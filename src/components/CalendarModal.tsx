import React from 'react';
import { X, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Subscription } from '../types';
import { ServiceIcon } from './ServiceIcons';
import { formatCurrency, formatRenewalDate } from '../utils/storage';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  currencySymbol?: string;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  currencySymbol = '₹',
}) => {
  if (!isOpen) return null;

  // Sort upcoming subscriptions
  const sortedUpcoming = [...subscriptions].sort((a, b) => {
    return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
  });

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date('2026-10-03');
    const target = new Date(dateStr);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Due Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0) return `${Math.abs(diff)} days ago`;
    return `in ${diff} days`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-[24px] glass-panel-elevated p-6 relative border border-purple-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <CalendarIcon size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F8F7FC] tracking-tight">
                Billing Calendar
              </h2>
              <p className="text-xs text-[#A7A0B5]">Upcoming renewal timeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-button flex items-center justify-center text-[#A7A0B5] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content timeline */}
        <div className="mt-5 space-y-3">
          {sortedUpcoming.length === 0 ? (
            <p className="text-xs text-center text-[#A7A0B5] py-8">
              No upcoming renewals recorded.
            </p>
          ) : (
            sortedUpcoming.map((sub) => {
              const daysText = getDaysRemaining(sub.renewalDate);
              const isClose = daysText.includes('in 1') || daysText.includes('Today');

              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <ServiceIcon type={sub.iconType} size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#F8F7FC]">
                        {sub.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-[#A7A0B5] mt-0.5">
                        <Clock size={11} className="text-purple-300" />
                        <span>{formatRenewalDate(sub.renewalDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-[#F8F7FC]">
                      {formatCurrency(sub.amount, currencySymbol)}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ${
                        isClose
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-purple-500/15 text-purple-300 border border-purple-500/25'
                      }`}
                    >
                      {daysText}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#A7A0B5]">
          <span>Total tracked services: {subscriptions.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
