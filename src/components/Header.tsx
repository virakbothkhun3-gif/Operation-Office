import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, Send, Sun, Moon, LogOut, User, ChevronDown, CheckCircle2, Shield, Bell } from 'lucide-react';
import { TelegramConfig, UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'uat-terminals' | 'reports';
  onOpenNewRequest: () => void;
  onOpenTelegramSettings: () => void;
  onToggleMobileSidebar: () => void;
  telegramConfig: TelegramConfig;
  currentUser: UserProfile | null;
  onSignOut: () => void;
  theme?: 'day' | 'night';
  onToggleTheme?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  hasMentionAlert?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenNewRequest,
  onOpenTelegramSettings,
  onToggleMobileSidebar,
  telegramConfig,
  currentUser,
  onSignOut,
  theme = 'night',
  onToggleTheme,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  hasMentionAlert = false,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Operations Dashboard';
      case 'uat-terminals':
        return 'POS Terminal UAT Tracker';
      case 'reports':
        return 'Reports & Analytics';
      default:
        return 'Operations Dashboard';
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Merchant intake queues, hardware lifecycle, and live integration statuses';
      case 'uat-terminals':
        return 'Loaned POS test terminal inventory, expected return schedules, and clearance';
      case 'reports':
        return 'Throughput reports, interface distribution analytics, and Excel exports';
      default:
        return 'Merchant Integration Management System';
    }
  };

  const isTgConfigured = Boolean(telegramConfig.botToken && telegramConfig.chatIdOrUsername);

  return (
    <header className="h-18 sm:h-20 bg-[#0f0f11] border-b border-[rgba(240,240,242,0.08)] flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0 backdrop-blur-md">
      {/* Zone 1: Left Brand / Navigation & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-[rgba(240,240,242,0.7)] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="title-group min-w-0">
          <h1 className="font-display text-base sm:text-xl font-semibold uppercase tracking-[0.05em] text-[#f0f0f2] truncate">
            {getTabTitle()}
          </h1>
          <p className="hidden sm:block text-xs font-mono text-[rgba(240,240,242,0.5)] truncate">
            {getTabSubtitle()}
          </p>
        </div>
      </div>

      {/* Zone 2: Right Interactive Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Telegram Config Button */}
        <button
          type="button"
          onClick={onOpenTelegramSettings}
          className="p-2 sm:px-3 sm:py-2 rounded-lg border border-[rgba(240,240,242,0.1)] bg-[#19191d] hover:bg-white/5 text-xs font-mono flex items-center gap-2 text-[rgba(240,240,242,0.8)] hover:text-[#f0f0f2] transition-colors"
          title={`Telegram Relay: ${isTgConfigured ? 'Active' : 'Standby / Demo'}`}
        >
          <Send className="w-4 h-4 text-[#2ecc71]" />
          <span className="hidden md:inline text-[11px]">Telegram</span>
          {isTgConfigured && (
            <span className="hidden md:inline w-1.5 h-1.5 rounded-full bg-[#2ecc71]" />
          )}
        </button>

        {/* Day / Night Theme Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 sm:px-3 sm:py-2 rounded-lg border border-[rgba(240,240,242,0.1)] bg-[#19191d] hover:bg-white/5 text-xs font-mono flex items-center gap-1.5 text-[rgba(240,240,242,0.8)] hover:text-[#f0f0f2] transition-colors"
            title={theme === 'night' ? 'Switch to Day Mode (Light)' : 'Switch to Night Mode (Dark)'}
            aria-label="Toggle Theme"
          >
            {theme === 'night' ? (
              <>
                <Sun className="w-4 h-4 text-[#f1c40f]" />
                <span className="hidden sm:inline text-[11px]">Day</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#3498db]" />
                <span className="hidden sm:inline text-[11px]">Night</span>
              </>
            )}
          </button>
        )}

        {/* Real-time Group Notifications Bell */}
        {onOpenNotifications && (
          <button
            type="button"
            onClick={onOpenNotifications}
            className={`relative p-2 sm:px-2.5 sm:py-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
              hasMentionAlert
                ? 'bg-amber-500/20 border-[#f1c40f] text-[#f1c40f] shadow-sm animate-pulse'
                : unreadNotificationsCount > 0
                ? 'bg-[#19191d] border-[rgba(240,240,242,0.2)] text-[#f0f0f2] hover:bg-white/5'
                : 'bg-[#19191d] border-[rgba(240,240,242,0.1)] text-[rgba(240,240,242,0.6)] hover:text-[#f0f0f2] hover:bg-white/5'
            }`}
            title="Group Notifications, Keywords & @Mentions"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#e74c3c] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-md">
                {unreadNotificationsCount}
              </span>
            )}
            {hasMentionAlert && (
              <span className="hidden sm:inline text-[10px] font-bold text-[#f1c40f]">
                @Mention
              </span>
            )}
          </button>
        )}

        {/* Primary CTA: + New Request */}
        <button
          type="button"
          onClick={onOpenNewRequest}
          className="btn-action-primary text-xs flex items-center gap-1.5 px-3 py-2 font-semibold shadow-xs"
          title="Create New Merchant Integration Request"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Request</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* Direct Log Out Button */}
        <button
          type="button"
          onClick={onSignOut}
          className="p-2 sm:px-2.5 sm:py-2 rounded-lg border border-[rgba(240,240,242,0.1)] bg-[#19191d] hover:bg-rose-500/10 hover:border-rose-500/30 text-xs font-mono flex items-center gap-1.5 text-[rgba(240,240,242,0.7)] hover:text-rose-400 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>

        {/* Interactive User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
            title="User Profile & Account"
            aria-expanded={isUserMenuOpen}
          >
            <div 
              className="w-9 h-9 rounded-lg bg-[#19191d] border border-[rgba(240,240,242,0.15)] text-[#f0f0f2] font-display flex items-center justify-center text-xs font-bold shadow-xs group-hover:border-[#2ecc71]/50 transition-colors"
            >
              {currentUser?.avatarInitials || 'NM'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[rgba(240,240,242,0.5)] group-hover:text-white transition-colors hidden sm:block" />
          </button>

          {/* User Menu Modal / Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#19191d] border border-[rgba(240,240,242,0.15)] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-[rgba(240,240,242,0.08)]">
                <div className="text-xs font-semibold text-[#f0f0f2] flex items-center justify-between">
                  <span>{currentUser?.name || 'Staff User'}</span>
                  <span className="font-mono text-[10px] text-[#2ecc71] bg-[#2ecc71]/10 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[rgba(240,240,242,0.5)] mt-0.5">
                  ID: {currentUser?.staffId || '222222'} · {currentUser?.role || 'Engineer'}
                </div>
                <div className="text-[10px] text-[rgba(240,240,242,0.4)] mt-0.5">
                  {currentUser?.department || 'Merchant Integration'}
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenTelegramSettings();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[rgba(240,240,242,0.8)] hover:bg-white/5 hover:text-[#2ecc71] flex items-center gap-2.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-[#2ecc71]" />
                  <span>Telegram Relay Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenNewRequest();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[rgba(240,240,242,0.8)] hover:bg-white/5 hover:text-[#2ecc71] flex items-center gap-2.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Merchant Request</span>
                </button>
              </div>

              <div className="pt-1 border-t border-[rgba(240,240,242,0.08)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
