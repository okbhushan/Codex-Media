import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  affectedItemName?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
  affectedItemName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-[24px] glass-panel-elevated p-6 relative border border-red-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle size={16} />
            </div>
            <h3 className="font-bold text-sm text-[#F8F7FC]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full glass-button flex items-center justify-center text-[#A7A0B5] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="py-4">
          <p className="text-xs text-[#A7A0B5] leading-relaxed">{message}</p>
          {affectedItemName && (
            <div className="mt-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-purple-200 truncate">
              {affectedItemName}
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl glass-button text-xs font-semibold text-[#A7A0B5] hover:text-white transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
            }`}
          >
            {isDestructive && <Trash2 size={13} />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
