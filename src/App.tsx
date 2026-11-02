import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { NewRequestModal } from './components/NewRequestModal';
import { StatusUpdateModal } from './components/StatusUpdateModal';
import { RequestDetailModal } from './components/RequestDetailModal';
import { ReportsView } from './components/ReportsView';
import { TelegramSettingsModal } from './components/TelegramSettingsModal';
import { UatTerminalsView } from './components/UatTerminalsView';
import { SignInPage } from './components/SignInPage';
import { MerchantRequest, TelegramConfig, UserProfile } from './types';
import { 
  getStoredRequests, 
  saveStoredRequests, 
  getStoredTelegramConfig, 
  saveStoredTelegramConfig,
  getStoredCurrentUser,
  saveStoredCurrentUser,
  removeStoredCurrentUser
} from './utils/storage';
import { CheckCircle2, Send, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredCurrentUser());
  const [requests, setRequests] = useState<MerchantRequest[]>(() => getStoredRequests());
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => getStoredTelegramConfig());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'uat-terminals' | 'reports'>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<MerchantRequest | null>(null);

  // Quick feedback toast
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Sync requests changes to localStorage
  const handleInsertRequest = (newReq: MerchantRequest) => {
    const updated = [newReq, ...requests];
    setRequests(updated);
    saveStoredRequests(updated);
    showToast(`Request ${newReq.id} created for ${newReq.merchantName}. Alert sent to Telegram.`);
  };

  const handleUpdateRequest = (updatedReq: MerchantRequest) => {
    const updated = requests.map((r) => (r.id === updatedReq.id ? updatedReq : r));
    setRequests(updated);
    saveStoredRequests(updated);
    setActiveRequest(updatedReq);
    showToast(`Status updated to ${updatedReq.status} for ${updatedReq.merchantName}.`);
  };

  const handleSaveTelegramConfig = (cfg: TelegramConfig) => {
    setTelegramConfig(cfg);
    saveStoredTelegramConfig(cfg);
    showToast('Telegram bot configuration saved.');
  };

  const handleSignIn = (user: UserProfile) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
    showToast(`Welcome back, ${user.name}! Signed in as ${user.role}.`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    removeStoredCurrentUser();
    showToast('You have been signed out.', 'info');
  };

  const uatPendingCount = requests.filter(
    (r) => r.isPosTerminalUat && r.posTerminalUatStatus === 'Pending Return'
  ).length;

  const inProgressCount = requests.filter(
    (r) => ['In Progress', 'Testing'].includes(r.status)
  ).length;

  const completedCount = requests.filter(
    (r) => r.status === 'Completed'
  ).length;

  // Unauthenticated view: Professional Sign In page
  if (!currentUser) {
    return (
      <>
        {/* Toast alert banner */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <SignInPage onSignIn={handleSignIn} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-[#f0f0f2] flex font-sans antialiased">
      {/* Toast alert banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-[#19191d] text-[#f0f0f2] px-4 py-3 rounded-lg shadow-2xl border border-[rgba(240,240,242,0.15)] flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2ecc71] shrink-0" />
            <span className="font-mono text-xs">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[rgba(240,240,242,0.4)] hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewRequest={() => setIsNewRequestOpen(true)}
        onOpenTelegramSettings={() => setIsTelegramModalOpen(true)}
        uatPendingCount={uatPendingCount}
        inProgressCount={inProgressCount}
        completedCount={completedCount}
        telegramConfig={telegramConfig}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* MAIN CONTENT AREA ON THE RIGHT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenNewRequest={() => setIsNewRequestOpen(true)}
          onOpenTelegramSettings={() => setIsTelegramModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          telegramConfig={telegramConfig}
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              requests={requests}
              onOpenNewRequest={() => setIsNewRequestOpen(true)}
              onOpenStatusUpdate={(req) => {
                setActiveRequest(req);
                setIsStatusUpdateOpen(true);
              }}
              onOpenDetail={(req) => {
                setActiveRequest(req);
                setIsDetailOpen(true);
              }}
              onOpenUatView={() => setActiveTab('uat-terminals')}
              telegramConfig={telegramConfig}
            />
          )}

          {activeTab === 'uat-terminals' && (
            <UatTerminalsView
              requests={requests}
              onOpenStatusUpdate={(req) => {
                setActiveRequest(req);
                setIsStatusUpdateOpen(true);
              }}
              onOpenDetail={(req) => {
                setActiveRequest(req);
                setIsDetailOpen(true);
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              requests={requests}
              onOpenDetail={(req) => {
                setActiveRequest(req);
                setIsDetailOpen(true);
              }}
            />
          )}
        </main>

        {/* Variation 3 Footer */}
        <footer className="px-6 sm:px-8 py-5 border-t border-[rgba(240,240,242,0.08)] text-[0.65rem] font-mono text-[rgba(240,240,242,0.5)] flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto bg-[#0f0f11]">
          <div>SYSTEM INTEGRATION v2.4.0</div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsTelegramModalOpen(true)}
              className="hover:text-[#2ecc71] transition-colors"
            >
              TELEGRAM RELAY CONFIG
            </button>
            <span>·</span>
            <span>STATUS: ALL SYSTEMS NOMINAL · AUDIT SECURE</span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSubmit={handleInsertRequest}
        telegramConfig={telegramConfig}
        currentUser={currentUser}
      />

      <StatusUpdateModal
        isOpen={isStatusUpdateOpen}
        onClose={() => {
          setIsStatusUpdateOpen(false);
          setActiveRequest(null);
        }}
        request={activeRequest}
        onUpdate={handleUpdateRequest}
        telegramConfig={telegramConfig}
        currentUser={currentUser}
      />

      <RequestDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveRequest(null);
        }}
        request={activeRequest}
        onOpenStatusUpdate={(req) => {
          setActiveRequest(req);
          setIsStatusUpdateOpen(true);
        }}
        telegramConfig={telegramConfig}
      />

      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        config={telegramConfig}
        onSaveConfig={handleSaveTelegramConfig}
      />
    </div>
  );
}
