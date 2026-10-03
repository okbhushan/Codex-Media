import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: string;
  badgeText: string;
  badgeVariant?: 'purple' | 'violet' | 'amber';
  icon?: LucideIcon;
  subtext?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  badgeText,
  badgeVariant = 'purple',
  icon: Icon,
}) => {
  return (
    <div className="relative overflow-hidden rounded-[22px] glass-panel p-5 sm:p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] flex flex-col justify-between group">
      {/* Ambient background glow inside the card */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500" />
      
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-[#A7A0B5] tracking-wide">
            {title}
          </span>
          {Icon && (
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
              <Icon size={14} />
            </div>
          )}
        </div>

        {/* Large Bold Amount */}
        <div className="text-2xl sm:text-3xl font-extrabold text-[#F8F7FC] tracking-tight my-1">
          {amount}
        </div>
      </div>

      {/* Badge at the bottom */}
      <div className="mt-4 flex items-center">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          badgeVariant === 'purple'
            ? 'bg-purple-500/15 border border-purple-500/25 text-purple-200'
            : 'bg-violet-500/15 border border-violet-500/25 text-violet-200'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>{badgeText}</span>
        </div>
      </div>
    </div>
  );
};
