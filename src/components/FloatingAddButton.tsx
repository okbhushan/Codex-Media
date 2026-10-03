import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
      <button
        onClick={onClick}
        aria-label="Add Subscription"
        title="Add new subscription"
        className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] via-[#9333EA] to-[#A855F7] text-white flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.65)] hover:shadow-[0_0_40px_rgba(168,85,247,0.85)] border border-white/25 transition-all duration-300 transform hover:scale-108 active:scale-95 cursor-pointer group"
      >
        <Plus size={26} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
};
