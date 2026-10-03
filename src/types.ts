export type BillingCycle = 'Monthly' | 'Yearly' | 'Quarterly' | 'Weekly';

export type IconType = 
  | 'wifi' 
  | 'youtube' 
  | 'apple' 
  | 'house' 
  | 'netflix' 
  | 'spotify' 
  | 'amazon' 
  | 'google' 
  | 'github' 
  | 'cloud' 
  | 'gym'
  | 'music'
  | 'generic';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency?: string;
  billingCycle: BillingCycle;
  renewalDate: string; // ISO date string YYYY-MM-DD
  category: string;
  iconType: IconType;
  customIcon?: string;
  active: boolean;
  notes?: string;
}

export type TrendTimeframe = '3M' | '6M' | '1Y';

export interface SpendingDataPoint {
  month: string; // e.g. "May", "Jun", "Jul", "Aug", "Sep", "Oct"
  amount: number;
  fullDate?: string;
  isProjected?: boolean;
}

export interface UserProfile {
  name: string;
  greeting?: string;
  avatarUrl?: string;
  currencySymbol: string;
}

export type SortOption = 'renewal-asc' | 'renewal-desc' | 'amount-desc' | 'amount-asc' | 'name-asc';
