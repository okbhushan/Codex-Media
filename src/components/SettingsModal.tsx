import React, { useState } from 'react';
import { X, User, RotateCcw, Check, FileSpreadsheet } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetData: () => void;
  onOpenWorkspace: () => void;
  isGoogleConnected: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetData,
  onOpenWorkspace,
  isGoogleConnected,
}) => {
  const [name, setName] = useState(profile.name);
  const [currencySymbol, setCurrencySymbol] = useState(profile.currencySymbol);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || 'Bhushan',
      currencySymbol,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-[24px] glass-panel-elevated p-6 relative border border-purple-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F8F7FC] tracking-tight">
                Preferences
              </h2>
              <p className="text-xs text-[#A7A0B5]">Customize your tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-button flex items-center justify-center text-[#A7A0B5] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* User Name */}
          <div>
            <label className="block text-xs font-semibold text-[#A7A0B5] mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-[#F8F7FC] focus:outline-none"
              placeholder="e.g. Bhushan"
              required
            />
          </div>

          {/* Currency Preference */}
          <div>
            <label className="block text-xs font-semibold text-[#A7A0B5] mb-1.5">
              Preferred Currency
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { symbol: '₹', label: 'INR (₹)' },
                { symbol: '$', label: 'USD ($)' },
                { symbol: '€', label: 'EUR (€)' },
                { symbol: '£', label: 'GBP (£)' },
              ].map((curr) => (
                <button
                  type="button"
                  key={curr.symbol}
                  onClick={() => setCurrencySymbol(curr.symbol)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currencySymbol === curr.symbol
                      ? 'bg-purple-600/35 border border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'bg-white/[0.04] border border-white/[0.08] text-[#A7A0B5] hover:text-white'
                  }`}
                >
                  {curr.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Google Workspace Integration Hub */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-[#A7A0B5] mb-1.5">
              Cloud & Storage Integration
            </label>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWorkspace();
              }}
              className="w-full p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/25 flex items-center justify-between text-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-200">
                  <FileSpreadsheet size={16} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[#F8F7FC] group-hover:text-purple-200 transition-colors">
                    Google Drive & Sheets Hub
                  </div>
                  <div className="text-[11px] text-[#A7A0B5]">
                    {isGoogleConnected ? 'Connected • Ready to sync' : 'Connect your account'}
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isGoogleConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {isGoogleConnected ? 'Connected' : 'Setup'}
              </span>
            </button>
          </div>

          {/* Reset sample data */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all subscriptions back to original demo data (Wi-Fi, YouTube, Apple One, House Rent)?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-medium text-purple-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset to Default Demo Data</span>
            </button>
          </div>

          {/* Buttons */}
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
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-[0_0_18px_rgba(139,92,246,0.4)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check size={14} />
                  <span>Saved!</span>
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
