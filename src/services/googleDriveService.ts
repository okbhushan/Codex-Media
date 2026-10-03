export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

/**
 * List files from Google Drive
 */
export const listDriveFiles = async (
  accessToken: string,
  query = "trashed = false and (mimeType = 'application/vnd.google-apps.spreadsheet' or name contains 'subtrack')"
): Promise<DriveFile[]> => {
  const params = new URLSearchParams({
    q: query,
    fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink)',
    orderBy: 'modifiedTime desc',
    pageSize: '25',
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error?.message || `Failed to fetch files from Drive (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Upload a JSON backup file to Google Drive
 */
export const uploadBackupToDrive = async (
  accessToken: string,
  backupData: Record<string, unknown>,
  fileName?: string
): Promise<DriveFile> => {
  const name = fileName || `SubTrack-Backup-${new Date().toISOString().slice(0, 10)}.json`;
  const fileContent = JSON.stringify(backupData, null, 2);

  const metadata = {
    name,
    mimeType: 'application/json',
    description: 'SubTrack Subscriptions and Expenses Backup',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', new Blob([fileContent], { type: 'application/json' }));

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to upload backup to Drive (${res.status})`);
  }

  return await res.json();
};

/**
 * Read file content from Drive (e.g. For JSON backup restore)
 */
export const readDriveFileContent = async (
  accessToken: string,
  fileId: string
): Promise<string> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to read file from Drive (${res.status})`);
  }

  return await res.text();
};

/**
 * Delete a file from Google Drive
 * (Note: Caller MUST ensure user confirmed this operation explicitly!)
 */
export const deleteDriveFile = async (
  accessToken: string,
  fileId: string
): Promise<void> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete file from Drive (${res.status})`);
  }
};
