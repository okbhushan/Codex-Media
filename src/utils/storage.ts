import { Subscription, SpendingDataPoint, TrendTimeframe, UserProfile } from '../types';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subtrack_subscriptions_v1',
  PROFILE: 'subtrack_profile_v1',
};

// Initial default subscriptions specified in requirements
export const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Wi-Fi',
    amount: 600,
    billingCycle: 'Monthly',
    renewalDate: '2026-10-20',
    category: 'Utilities',
    iconType: 'wifi',
    active: true,
  },
  {
    id: 'sub-2',
    name: 'YouTube Premium',
    amount: 90,
    billingCycle: 'Monthly',
    renewalDate: '2026-10-20',
    category: 'Entertainment',
    iconType: 'youtube',
    active: true,
  },
  {
    id: 'sub-3',
    name: 'Apple One',
    amount: 480,
    billingCycle: 'Monthly',
    renewalDate: '2026-10-21',
    category: 'Entertainment',
    iconType: 'apple',
    active: true,
  },
  {
    id: 'sub-4',
    name: 'House Rent',
    amount: 2500,
    billingCycle: 'Monthly',
    renewalDate: '2026-11-01',
    category: 'Housing',
    iconType: 'house',
    active: true,
  },
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Bhushan',
  greeting: 'GOOD EVENING',
  currencySymbol: '₹',
};

export const getStoredSubscriptions = (): Subscription[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (!raw) return DEFAULT_SUBSCRIPTIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SUBSCRIPTIONS;
  } catch (e) {
    console.error('Failed to load subscriptions from localStorage', e);
    return DEFAULT_SUBSCRIPTIONS;
  }
};

export const saveSubscriptions = (subs: Subscription[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
  } catch (e) {
    console.error('Failed to save subscriptions to localStorage', e);
  }
};

export const getStoredProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
};

/**
 * Calculates monthly equivalent cost of a subscription
 */
export const calculateMonthlyEquivalent = (sub: Subscription): number => {
  if (!sub.active) return 0;
  switch (sub.billingCycle) {
    case 'Monthly':
      return sub.amount;
    case 'Yearly':
      return Math.round(sub.amount / 12);
    case 'Quarterly':
      return Math.round(sub.amount / 3);
    case 'Weekly':
      return Math.round(sub.amount * 4.33);
    default:
      return sub.amount;
  }
};

/**
 * Check if renewal date is within next 30 days
 */
export const isDueIn30Days = (renewalDateStr: string, baseDate = new Date('2026-10-03')): boolean => {
  try {
    const renewal = new Date(renewalDateStr);
    const diffTime = renewal.getTime() - baseDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Due if it's today or within the next 30 days
    return diffDays >= 0 && diffDays <= 30;
  } catch {
    return false;
  }
};

/**
 * Format currency amount cleanly
 */
export const formatCurrency = (amount: number, symbol = '₹'): string => {
  return `${symbol}${amount.toLocaleString('en-IN')}`;
};

/**
 * Format renewal date nicely: e.g. "Renews on Oct 20, 2026"
 */
export const formatRenewalDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return `Renews on ${dateStr}`;
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `Renews on ${date.toLocaleDateString('en-US', options)}`;
  } catch {
    return `Renews on ${dateStr}`;
  }
};

/**
 * Generate spending trend data based on current monthly average and timeframe
 */
export const generateTrendData = (
  monthlyAvg: number,
  timeframe: TrendTimeframe
): SpendingDataPoint[] => {
  // Base anchor around current amount ₹3,670
  if (timeframe === '6M') {
    return [
      { month: 'May', amount: Math.round(monthlyAvg * 0.86) },
      { month: 'Jun', amount: Math.round(monthlyAvg * 0.92) },
      { month: 'Jul', amount: Math.round(monthlyAvg * 0.88) },
      { month: 'Aug', amount: Math.round(monthlyAvg * 0.95) },
      { month: 'Sep', amount: Math.round(monthlyAvg * 0.98) },
      { month: 'Oct', amount: monthlyAvg },
    ];
  } else if (timeframe === '3M') {
    return [
      { month: 'Aug', amount: Math.round(monthlyAvg * 0.94) },
      { month: 'Sep', amount: Math.round(monthlyAvg * 0.98) },
      { month: 'Oct', amount: monthlyAvg },
    ];
  } else {
    // 1Y
    return [
      { month: 'Nov', amount: Math.round(monthlyAvg * 0.72) },
      { month: 'Dec', amount: Math.round(monthlyAvg * 0.75) },
      { month: 'Jan', amount: Math.round(monthlyAvg * 0.80) },
      { month: 'Feb', amount: Math.round(monthlyAvg * 0.82) },
      { month: 'Mar', amount: Math.round(monthlyAvg * 0.85) },
      { month: 'Apr', amount: Math.round(monthlyAvg * 0.84) },
      { month: 'May', amount: Math.round(monthlyAvg * 0.86) },
      { month: 'Jun', amount: Math.round(monthlyAvg * 0.92) },
      { month: 'Jul', amount: Math.round(monthlyAvg * 0.88) },
      { month: 'Aug', amount: Math.round(monthlyAvg * 0.95) },
      { month: 'Sep', amount: Math.round(monthlyAvg * 0.98) },
      { month: 'Oct', amount: monthlyAvg },
    ];
  }
};
