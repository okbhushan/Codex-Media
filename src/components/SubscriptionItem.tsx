import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Subscription } from '../types';
import { ServiceIcon, getIconBoxStyles } from './ServiceIcons';
import { formatCurrency, formatRenewalDate } from '../utils/storage';

interface SubscriptionItemProps {
  subscription: Subscription;
  currencySymbol?: string;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  isLast?: boolean;
}

export const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
  subscription,
  currencySymbol = '₹',
  onEdit,
  onDelete,
  isLast = false,
}) => {
  const iconBoxStyle = getIconBoxStyles(subscription.iconType);

  return (
    <div
      className={`group relative flex items-center justify-between py-4 px-3 sm:px-4 rounded-xl transition-all duration-200 hover:bg-white/[0.04] ${
        !isLast ? 'border-b border-white/[0.06]' : ''
      }`}
    >
      {/* Left: Icon box + Info */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 duration-200 ${iconBoxStyle.bg} ${iconBoxStyle.border} shadow-[0_4px_12px_rgba(0,0,0,0.2)]`}
        >
          <ServiceIcon type={subscription.iconType} size={22} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-[#F8F7FC] truncate group-hover:text-purple-200 transition-colors">
              {subscription.name}
            </h3>
            {subscription.category && (
              <span className="hidden md:inline-block text-[10px] text-purple-300/80 bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/20">
                {subscription.category}
              </span>
            )}
          </div>
          <p className="text-xs text-[#A7A0B5] mt-0.5 truncate">
            {formatRenewalDate(subscription.renewalDate)}
          </p>
        </div>
      </div>

      {/* Right: Price & Cycle + Action buttons */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="text-right">
          <div className="font-bold text-sm sm:text-base text-[#F8F7FC]">
            {formatCurrency(subscription.amount, currencySymbol)}
          </div>
          <div className="text-xs text-[#A7A0B5] capitalize">
            {subscription.billingCycle}
          </div>
        </div>

        {/* Hover / tap actions */}
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(subscription)}
            aria-label={`Edit ${subscription.name}`}
            title="Edit subscription"
            className="p-1.5 rounded-lg text-[#A7A0B5] hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(subscription.id)}
            aria-label={`Delete ${subscription.name}`}
            title="Delete subscription"
            className="p-1.5 rounded-lg text-[#A7A0B5] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
