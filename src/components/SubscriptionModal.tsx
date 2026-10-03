import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, DollarSign, Tag, Clock } from 'lucide-react';
import { Subscription, BillingCycle, IconType } from '../types';
import { ServiceIcon } from './ServiceIcons';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscriptionData: Omit<Subscription, 'id'>, editId?: string) => void;
  initialData?: Subscription | null;
  currencySymbol?: string;
}

const PRESET_SERVICES: Array<{
  name: string;
  category: string;
  iconType: IconType;
  defaultAmount?: number;
}> = [
  { name: 'Wi-Fi', category: 'Utilities', iconType: 'wifi', defaultAmount: 600 },
  { name: 'YouTube Premium', category: 'Entertainment', iconType: 'youtube', defaultAmount: 90 },
  { name: 'Apple One', category: 'Entertainment', iconType: 'apple', defaultAmount: 480 },
  { name: 'House Rent', category: 'Housing', iconType: 'house', defaultAmount: 2500 },
  { name: 'Netflix', category: 'Entertainment', iconType: 'netflix', defaultAmount: 649 },
  { name: 'Spotify', category: 'Entertainment', iconType: 'spotify', defaultAmount: 119 },
  { name: 'Amazon Prime', category: 'Entertainment', iconType: 'amazon', defaultAmount: 299 },
  { name: 'Gym Membership', category: 'Health', iconType: 'gym', defaultAmount: 1500 },
  { name: 'Cloud Storage', category: 'Software', iconType: 'cloud', defaultAmount: 130 },
];

const AVAILABLE_ICONS: IconType[] = [
  'wifi',
  'youtube',
  'apple',
  'house',
  'netflix',
  'spotify',
  'amazon',
  'gym',
  'cloud',
  'generic',
];

const CATEGORIES = [
  'Utilities',
  'Entertainment',
  'Housing',
  'Software',
  'Health',
  'Personal',
  'Other',
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currencySymbol = '₹',
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('Monthly');
  const [renewalDate, setRenewalDate] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [iconType, setIconType] = useState<IconType>('wifi');
  const [error, setError] = useState('');

  // Pre-fill when editing or reset when adding
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(initialData.amount.toString());
      setBillingCycle(initialData.billingCycle);
      setRenewalDate(initialData.renewalDate);
      setCategory(initialData.category || 'Entertainment');
      setIconType(initialData.iconType || 'generic');
    } else {
      // Default new date: next week from current Oct 2026 anchor
      const defaultDate = '2026-10-25';
      setName('');
      setAmount('');
      setBillingCycle('Monthly');
      setRenewalDate(defaultDate);
      setCategory('Utilities');
      setIconType('wifi');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: typeof PRESET_SERVICES[0]) => {
    setName(preset.name);
    setCategory(preset.category);
    setIconType(preset.iconType);
    if (preset.defaultAmount && !amount) {
      setAmount(preset.defaultAmount.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a subscription name');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!renewalDate) {
      setError('Please select a renewal date');
      return;
    }

    onSave(
      {
        name: name.trim(),
        amount: Math.round(numAmount),
        billingCycle,
        renewalDate,
        category,
        iconType,
        active: true,
      },
      initialData?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[24px] glass-panel-elevated p-6 sm:p-7 relative border border-purple-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-purple-600/30 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] relative z-10">
          <div>
            <h2 className="text-xl font-bold text-[#F8F7FC] tracking-tight">
              {initialData ? 'Edit Subscription' : 'Add Subscription'}
            </h2>
            <p className="text-xs text-[#A7A0B5] mt-0.5">
              {initialData ? 'Update subscription details' : 'Track recurring expenses'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-button flex items-center justify-center text-[#A7A0B5] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Presets for fast entry */}
        {!initialData && (
          <div className="mt-4">
            <span className="text-[11px] font-semibold tracking-wider text-[#A7A0B5] uppercase flex items-center gap-1 mb-2">
              <Sparkles size={11} className="text-purple-400" />
              Quick Templates
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {PRESET_SERVICES.slice(0, 6).map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-purple-400/40 hover:bg-purple-500/10 text-xs text-[#F8F7FC] transition-all cursor-pointer"
                >
                  <ServiceIcon type={preset.iconType} size={14} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 relative z-10">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Subscription Name */}
          <div>
            <label className="block text-xs font-semibold text-[#A7A0B5] mb-1.5">
              Subscription Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Netflix, Wi-Fi, Gym"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-[#F8F7FC] placeholder-[#A7A0B5]/50 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Amount & Billing Cycle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#A7A0B5] mb-1.5">
                Amount ({currencySymbol})
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-bold text-purple-300">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  placeholder="3670"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold text-[#F8F7FC] placeholder-[#A7A0B5]/50 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7A0B5] mb-1.5">
                Billing Cycle
              </label>
              <div className="relative">
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-[#F8F7FC] focus:outline-none cursor-pointer appearance-none bg-[#110D1E]"
                >
                  <option value="Monthly" className="bg-[#110D1E] text-white">Monthly</option>
                  <option value="Yearly" className="bg-[#110D1E] text-white">Yearly</option>
                  <option value="Quarterly" className="bg-[#110D1E] text-white">Quarterly</option>
                  <option value="Weekly" className="bg-[#110D1E] text-white">Weekly</option>
                </select>
                <Clock size={14} className="absolute right-3.5 top-3.5 text-purple-300/70 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Renewal Date */}
          <div>
            <label className="block text-xs font-semibold text-[#A7A0B5] mb-1.5">
              Renewal Date
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={renewalDate}
                onChange={(e) => {
                  setRenewalDate(e.target.value);
                  setError('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-[#F8F7FC] focus:outline-none [color-scheme:dark]"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#A7A0B5] mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-purple-600/30 border border-purple-400/40 text-purple-200'
                      : 'bg-white/[0.03] border border-white/[0.08] text-[#A7A0B5] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#A7A0B5] mb-1.5">
              Service Icon
            </label>
            <div className="flex gap-2 flex-wrap">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => setIconType(icon)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    iconType === icon
                      ? 'bg-purple-600/40 border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                      : 'bg-white/[0.04] border border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <ServiceIcon type={icon} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl glass-button text-xs font-semibold text-[#A7A0B5] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all cursor-pointer"
            >
              {initialData ? 'Save Changes' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
