import React from 'react';
import { Calendar, Settings, FileSpreadsheet } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  onOpenCalendar: () => void;
  onOpenSettings: () => void;
  onOpenWorkspace: () => void;
  isGoogleConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenCalendar,
  onOpenSettings,
  onOpenWorkspace,
  isGoogleConnected,
}) => {
  return (
    <header className="flex items-center justify-between py-4 px-1">
      {/* User profile info */}
      <div className="flex items-center gap-3.5">
        <div className="relative group">
          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 via-violet-400 to-indigo-500 shadow-[0_0_15px_rgba(139,92,246,0.35)]">
            <div className="w-full h-full rounded-full bg-[#0E0A1A] flex items-center justify-center overflow-hidden border border-white/10">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#07050D] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold tracking-wider text-[#A7A0B5] uppercase">
            {profile.greeting || 'GOOD EVENING'}
          </span>
          <h1 className="text-xl font-bold tracking-tight text-[#F8F7FC] flex items-center gap-1.5">
            {profile.name}
          </h1>
        </div>
      </div>

      {/* Right side action icons */}
      <div className="flex items-center gap-2">
        {/* Google Workspace Hub Trigger Button */}
        <button
          onClick={onOpenWorkspace}
          aria-label="Google Drive & Sheets Hub"
          title="Google Drive & Sheets Sync"
          className="h-10 px-2.5 rounded-2xl glass-button flex items-center gap-1.5 text-[#F8F7FC] transition-transform active:scale-95 group relative"
        >
          <FileSpreadsheet
            size={18}
            className={`${
              isGoogleConnected ? 'text-emerald-400' : 'text-purple-300'
            } group-hover:scale-110 transition-transform`}
          />
          <span className="hidden sm:inline text-xs font-semibold text-purple-200">
            {isGoogleConnected ? 'Drive' : 'Connect'}
          </span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isGoogleConnected
                ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                : 'bg-purple-400 shadow-[0_0_6px_#c084fc]'
            }`}
          />
        </button>

        <button
          onClick={onOpenCalendar}
          aria-label="View upcoming renewals calendar"
          title="Upcoming Schedule"
          className="w-10 h-10 rounded-2xl glass-button flex items-center justify-center text-[#F8F7FC] transition-transform active:scale-95 group relative"
        >
          <Calendar size={18} className="text-purple-200 group-hover:text-white transition-colors" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_6px_#c084fc]" />
        </button>

        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          title="Preferences & Settings"
          className="w-10 h-10 rounded-2xl glass-button flex items-center justify-center text-[#F8F7FC] transition-transform active:scale-95 group"
        >
          <Settings size={18} className="text-purple-200 group-hover:text-white group-hover:rotate-45 transition-all duration-300" />
        </button>
      </div>
    </header>
  );
};
