import React from 'react';
import { Menu, Plus, Send, ChevronRight, LogOut, User } from 'lucide-react';
import { TelegramConfig, UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'uat-terminals' | 'reports';
  onOpenNewRequest: () => void;
  onOpenTelegramSettings: () => void;
  onToggleMobileSidebar: () => void;
  telegramConfig: TelegramConfig;
  currentUser: UserProfile | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenNewRequest,
  onOpenTelegramSettings,
  onToggleMobileSidebar,
  telegramConfig,
  currentUser,
  onSignOut,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Operations Dashboard';
      case 'uat-terminals':
        return 'POS Terminal UAT Tracker';
      case 'reports':
        return 'Reports & Excel Export';
      default:
        return 'Operations Dashboard';
    }
  };

  const isTgConfigured = Boolean(telegramConfig.botToken && telegramConfig.chatIdOrUsername);
  const targetChat = telegramConfig.chatIdOrUsername || '-5531389049';

  return (
    <header className="h-20 bg-[#0f0f11] border-b border-[rgba(240,240,242,0.08)] flex items-center justify-between px-6 sm:px-8 z-30 sticky top-0">
      {/* Title Group */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-[rgba(240,240,242,0.6)] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Open Sidebar Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="title-group min-w-0">
          <h1 className="font-display text-lg sm:text-xl font-semibold uppercase tracking-[0.05em] text-[#f0f0f2] truncate">
            {getTabTitle()}
          </h1>
          <p className="text-xs font-mono text-[rgba(240,240,242,0.5)] truncate">
            System Integration & Merchant Tracking / Lead Eng: {currentUser?.name || 'Nget Monioudom'}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        {/* Telegram Hub Status Pill */}
        <div 
          onClick={onOpenTelegramSettings}
          className="hidden md:block text-right cursor-pointer group"
          title="Click to configure Telegram Bot"
        >
          <div className="text-xs font-medium text-[rgba(240,240,242,0.7)] group-hover:text-white transition-colors flex items-center justify-end gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2ecc71] inline-block animate-pulse" />
            Telegram Hub
          </div>
          <div className="text-[11px] font-mono text-[#2ecc71] group-hover:underline">
            {isTgConfigured ? `ACTIVE : ${targetChat}` : `DEMO : ${targetChat}`}
          </div>
        </div>

        {/* User Initials Badge */}
        <div 
          className="w-10 h-10 rounded bg-[#19191d] border border-[rgba(240,240,242,0.1)] text-[#f0f0f2] font-display flex items-center justify-center text-sm font-semibold select-none shadow-xs"
          title={`${currentUser?.name || 'Nget Monioudom'} (${currentUser?.role || 'Lead Engineer'})`}
        >
          {currentUser?.avatarInitials || 'NM'}
        </div>

        {/* Quick Insert CTA */}
        <button
          type="button"
          onClick={onOpenNewRequest}
          className="btn-action-primary hidden sm:inline-flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Insert New</span>
        </button>
      </div>
    </header>
  );
};
