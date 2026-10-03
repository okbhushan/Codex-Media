import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Filter, ChevronDown, Check, Layers } from 'lucide-react';
import { Subscription, SortOption } from '../types';
import { SubscriptionItem } from './SubscriptionItem';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  currencySymbol?: string;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  currencySymbol = '₹',
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [sortOption, setSortOption] = useState<SortOption>('renewal-asc');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter categories
  const categories = ['All', ...Array.from(new Set(subscriptions.map((s) => s.category).filter(Boolean)))];

  // Apply filtering and sorting
  const filteredSubs = subscriptions.filter((sub) => {
    if (selectedCategory === 'All') return true;
    return sub.category === selectedCategory;
  });

  const sortedSubs = [...filteredSubs].sort((a, b) => {
    if (sortOption === 'renewal-asc') {
      return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
    }
    if (sortOption === 'renewal-desc') {
      return new Date(b.renewalDate).getTime() - new Date(a.renewalDate).getTime();
    }
    if (sortOption === 'amount-desc') {
      return b.amount - a.amount;
    }
    if (sortOption === 'amount-asc') {
      return a.amount - b.amount;
    }
    if (sortOption === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const getSortLabel = () => {
    switch (sortOption) {
      case 'renewal-asc':
        return 'Upcoming';
      case 'amount-desc':
        return 'Highest Price';
      case 'amount-asc':
        return 'Lowest Price';
      case 'name-asc':
        return 'Name (A-Z)';
      default:
        return 'Upcoming';
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F8F7FC]">
          Subscriptions
        </h2>

        {/* Right side: Upcoming + Sort/Filter trigger */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-button text-xs font-semibold text-purple-200 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <span>{getSortLabel()}</span>
            <ArrowUpDown size={13} className="text-purple-300" />
            <ChevronDown size={13} className={`text-purple-300/80 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Glass Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-panel-elevated p-2 shadow-2xl z-30 border border-purple-500/20 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[11px] font-bold text-[#A7A0B5] uppercase tracking-wider">
                Sort By
              </div>
              <div className="space-y-0.5">
                {[
                  { id: 'renewal-asc', label: 'Upcoming (Earliest)' },
                  { id: 'amount-desc', label: 'Highest Amount' },
                  { id: 'amount-asc', label: 'Lowest Amount' },
                  { id: 'name-asc', label: 'Name (A to Z)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSortOption(item.id as SortOption);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      sortOption === item.id
                        ? 'bg-purple-600/30 text-purple-200 font-semibold'
                        : 'text-[#F8F7FC] hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                    {sortOption === item.id && <Check size={14} className="text-purple-300" />}
                  </button>
                ))}
              </div>

              {/* Category Filter section */}
              {categories.length > 2 && (
                <>
                  <div className="my-1.5 border-t border-white/10" />
                  <div className="px-2 py-1 text-[11px] font-bold text-[#A7A0B5] uppercase tracking-wider flex items-center gap-1">
                    <Filter size={10} />
                    <span>Filter Category</span>
                  </div>
                  <div className="space-y-0.5 max-h-36 overflow-y-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-purple-600/30 text-purple-200 font-semibold'
                            : 'text-[#F8F7FC] hover:bg-white/5'
                        }`}
                      >
                        <span>{cat}</span>
                        {selectedCategory === cat && <Check size={14} className="text-purple-300" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Glass List Container */}
      <div className="rounded-[22px] glass-panel p-2 sm:p-3 relative overflow-hidden transition-all duration-300">
        {sortedSubs.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 mb-3">
              <Layers size={24} />
            </div>
            <h3 className="text-base font-semibold text-[#F8F7FC]">No subscriptions found</h3>
            <p className="text-xs text-[#A7A0B5] mt-1 max-w-xs mx-auto">
              {selectedCategory !== 'All'
                ? `No subscriptions in the "${selectedCategory}" category.`
                : 'Start tracking by tapping the + button below.'}
            </p>
            <button
              onClick={onAddNew}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
            >
              Add First Service
            </button>
          </div>
        ) : (
          <div className="divide-y-0">
            {sortedSubs.map((sub, index) => (
              <SubscriptionItem
                key={sub.id}
                subscription={sub}
                currencySymbol={currencySymbol}
                onEdit={onEdit}
                onDelete={onDelete}
                isLast={index === sortedSubs.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
