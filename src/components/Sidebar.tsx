import React from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  FileSpreadsheet, 
  Send, 
  Plus, 
  X, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Settings,
  LogOut
} from 'lucide-react';
import { TelegramConfig, UserProfile } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'uat-terminals' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'uat-terminals' | 'reports') => void;
  onOpenNewRequest: () => void;
  onOpenTelegramSettings: () => void;
  uatPendingCount: number;
  inProgressCount: number;
  completedCount: number;
  telegramConfig: TelegramConfig;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser: UserProfile | null;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewRequest,
  onOpenTelegramSettings,
  uatPendingCount,
  inProgressCount,
  completedCount,
  telegramConfig,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  onSignOut,
}) => {
  const isTgConfigured = Boolean(telegramConfig.botToken && telegramConfig.chatIdOrUsername);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container - Variation 3 Dark System */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-20 lg:w-20 bg-[#19191d] border-r border-[rgba(240,240,242,0.08)] flex flex-col items-center py-6 gap-6 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Monogram */}
        <div 
          onClick={() => {
            setActiveTab('dashboard');
            onCloseMobile();
          }}
          className="w-10 h-10 bg-[#f0f0f2] text-[#0f0f11] font-display flex items-center justify-center rounded text-lg font-bold cursor-pointer hover:opacity-90 transition-opacity"
          title="System Integration Dashboard"
        >
          SI
        </div>

        {/* Quick Insert CTA Button */}
        <button
          type="button"
          onClick={() => {
            onOpenNewRequest();
            onCloseMobile();
          }}
          className="w-10 h-10 rounded-lg bg-[#2ecc71] text-black flex items-center justify-center font-bold hover:bg-[#27ae60] transition-colors shadow-sm"
          title="Insert New Merchant Request"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Navigation Icon Links */}
        <nav className="flex-1 flex flex-col items-center gap-3 w-full px-3">
          {/* Dashboard */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('dashboard');
              onCloseMobile();
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all relative ${
              activeTab === 'dashboard'
                ? 'bg-white/5 text-[#2ecc71] shadow-xs'
                : 'text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2] hover:bg-white/5'
            }`}
            title="Operations Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
            {activeTab === 'dashboard' && (
              <span className="absolute -left-3 top-2 bottom-2 w-1 bg-[#2ecc71] rounded-r" />
            )}
          </button>

          {/* UAT Terminals */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('uat-terminals');
              onCloseMobile();
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all relative ${
              activeTab === 'uat-terminals'
                ? 'bg-white/5 text-[#2ecc71] shadow-xs'
                : 'text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2] hover:bg-white/5'
            }`}
            title="POS Terminal UAT Tracker"
          >
            <Smartphone className="w-5 h-5" />
            {uatPendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f1c40f]" />
            )}
            {activeTab === 'uat-terminals' && (
              <span className="absolute -left-3 top-2 bottom-2 w-1 bg-[#2ecc71] rounded-r" />
            )}
          </button>

          {/* Reports & Excel */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('reports');
              onCloseMobile();
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all relative ${
              activeTab === 'reports'
                ? 'bg-white/5 text-[#2ecc71] shadow-xs'
                : 'text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2] hover:bg-white/5'
            }`}
            title="Reports & Excel Export"
          >
            <FileSpreadsheet className="w-5 h-5" />
            {activeTab === 'reports' && (
              <span className="absolute -left-3 top-2 bottom-2 w-1 bg-[#2ecc71] rounded-r" />
            )}
          </button>

          {/* Telegram Settings */}
          <button
            type="button"
            onClick={() => {
              onOpenTelegramSettings();
              onCloseMobile();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-lg transition-all text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2] hover:bg-white/5 relative"
            title="Telegram Bot Settings"
          >
            <Send className="w-5 h-5" />
            {isTgConfigured && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2ecc71]" />
            )}
          </button>
        </nav>

        {/* Bottom Section: Profile Avatar & Sign Out */}
        <div className="flex flex-col items-center gap-3 pt-4 border-t border-[rgba(240,240,242,0.08)] w-full">
          {/* User Avatar Chip */}
          <div 
            className="w-9 h-9 rounded bg-[#19191d] border border-[rgba(240,240,242,0.12)] text-[#f0f0f2] font-display flex items-center justify-center text-xs font-semibold cursor-default"
            title={`${currentUser?.name || 'Staff'} (${currentUser?.role || 'Lead Eng'})`}
          >
            {currentUser?.avatarInitials || 'NM'}
          </div>

          {/* Sign Out Action */}
          <button
            type="button"
            onClick={onSignOut}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[rgba(240,240,242,0.4)] hover:text-[#e74c3c] hover:bg-white/5 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-[rgba(240,240,242,0.5)] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </aside>
    </>
  );
};
