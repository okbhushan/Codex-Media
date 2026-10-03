import { Subscription } from '../types';
import { calculateMonthlyEquivalent } from '../utils/storage';

export interface CreateSpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export interface SheetRowData {
  name: string;
  category: string;
  billingCycle: string;
  renewalDate: string;
  amount: number;
}

/**
 * Creates a brand new, beautifully structured Google Spreadsheet
 * populated with current SubTrack subscriptions and metrics.
 */
export const exportSubscriptionsToSheets = async (
  accessToken: string,
  subscriptions: Subscription[],
  currencySymbol = '₹',
  title = `SubTrack - Subscriptions & Expenses (${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`
): Promise<CreateSpreadsheetResult> => {
  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Subscriptions',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create Google Spreadsheet (${createRes.status})`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // 2. Prepare Rows
  const headers = [
    'Subscription Name',
    'Category',
    'Billing Cycle',
    'Renewal Date',
    `Amount (${currencySymbol})`,
    `Monthly Equivalent (${currencySymbol})`,
    'Status',
  ];

  const activeSubs = subscriptions.filter((s) => s.active);
  const totalMonthly = activeSubs.reduce((sum, s) => sum + calculateMonthlyEquivalent(s), 0);

  const rows = subscriptions.map((s) => [
    s.name,
    s.category || 'General',
    s.billingCycle,
    s.renewalDate,
    s.amount,
    calculateMonthlyEquivalent(s),
    s.active ? 'Active' : 'Paused',
  ]);

  // Empty separator row and summary row
  const summaryDivider = ['', '', '', '', '', '', ''];
  const summaryRow = [
    'MONTHLY AVERAGE TOTAL',
    '',
    '',
    '',
    '',
    totalMonthly,
    `${activeSubs.length} Active Services`,
  ];

  const allValues = [headers, ...rows, summaryDivider, summaryRow];

  // 3. Write data to the sheet
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Subscriptions!A1:G${allValues.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `Subscriptions!A1:G${allValues.length}`,
        majorDimension: 'ROWS',
        values: allValues,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to populate Google Sheet (${updateRes.status})`);
  }

  // 4. Apply styling via batchUpdate (header purple background, bold text)
  try {
    const sheetId = sheetData.sheets?.[0]?.properties?.sheetId || 0;
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Format header row: Purple bg (#7C3AED), white bold text
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 7,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.486, green: 0.227, blue: 0.929 },
                  textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          // Format summary row: subtle purple tint
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: allValues.length - 1,
                endRowIndex: allValues.length,
                startColumnIndex: 0,
                endColumnIndex: 7,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.933, green: 0.898, blue: 0.996 },
                  textFormat: { bold: true, fontSize: 11, foregroundColor: { red: 0.2, green: 0.1, blue: 0.4 } },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      }),
    });
  } catch (e) {
    console.warn('Optional spreadsheet formatting warning:', e);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
};

/**
 * Reads spreadsheet values and extracts subscriptions
 * dynamically fetches the first tab name to avoid hardcoding "Sheet1".
 */
export const readSubscriptionsFromSheets = async (
  accessToken: string,
  spreadsheetId: string
): Promise<SheetRowData[]> => {
  // 1. Fetch metadata to get actual sheet title
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to open spreadsheet (${metaRes.status})`);
  }

  const metadata = await metaRes.json();
  const firstSheetTitle = metadata.sheets?.[0]?.properties?.title || 'Sheet1';

  // 2. Fetch all values
  const valuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetTitle)}!A1:G100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!valuesRes.ok) {
    throw new Error(`Failed to read values from ${firstSheetTitle}`);
  }

  const valuesData = await valuesRes.json();
  const rows: (string | number)[][] = valuesData.values || [];

  if (rows.length <= 1) {
    return [];
  }

  // Parse rows (skipping header)
  const parsedRows: SheetRowData[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = String(row[0] || '').trim();
    if (!name || name.toUpperCase().includes('TOTAL') || name.toUpperCase().includes('AVERAGE')) {
      continue;
    }

    const category = String(row[1] || 'General').trim();
    const cycleRaw = String(row[2] || 'Monthly').trim();
    const renewalDate = String(row[3] || '2026-10-25').trim();
    const amountVal = parseFloat(String(row[4]).replace(/[^0-9.]/g, '')) || 0;

    if (amountVal > 0) {
      parsedRows.push({
        name,
        category,
        billingCycle: cycleRaw || 'Monthly',
        renewalDate,
        amount: amountVal,
      });
    }
  }

  return parsedRows;
};
