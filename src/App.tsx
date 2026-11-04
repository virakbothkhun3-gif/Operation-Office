import React, { useState, useEffect } from 'react';
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
import { ImportDataModal } from './components/ImportDataModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { MerchantRequest, TelegramConfig, UserProfile, GroupNotification } from './types';
import { 
  getStoredRequests, 
  saveStoredRequests, 
  getStoredTelegramConfig, 
  saveStoredTelegramConfig,
  getStoredCurrentUser,
  saveStoredCurrentUser,
  removeStoredCurrentUser,
  getStoredNotifications,
  saveStoredNotifications,
  detectKeywords,
  checkIsMention
} from './utils/storage';
import { CheckCircle2, Send, X, Sun, Moon } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredCurrentUser());
  const [requests, setRequests] = useState<MerchantRequest[]>(() => getStoredRequests());
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => getStoredTelegramConfig());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'uat-terminals' | 'reports'>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Theme state: 'night' (Dark system default) or 'day' (Light)
  const [theme, setTheme] = useState<'night' | 'day'>(() => {
    const saved = localStorage.getItem('system_integration_theme_v1');
    return saved === 'day' ? 'day' : 'night';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'day' ? 'light' : 'dark');
    if (theme === 'day') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'night' ? 'day' : 'night';
      localStorage.setItem('system_integration_theme_v1', next);
      return next;
    });
  };

  // Modals state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<MerchantRequest | null>(null);

  // Group notifications state & unread calculations
  const [notifications, setNotifications] = useState<GroupNotification[]>(() => getStoredNotifications());

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const hasMentionAlert = notifications.some((n) => !n.isRead && n.isMention);

  // Quick feedback toast
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Notification handlers
  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
    showToast('All notifications marked as read.');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    saveStoredNotifications([]);
    showToast('Notification history cleared.', 'info');
  };

  const handleSendGroupMessage = (params: {
    senderName: string;
    senderRole: string;
    groupName: string;
    message: string;
    relatedRequestId?: string;
  }) => {
    const isMention = checkIsMention(params.message, currentUser?.name);
    const detected = detectKeywords(params.message);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today';

    const newNotif: GroupNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderName: params.senderName,
      senderRole: params.senderRole,
      groupName: params.groupName,
      message: params.message,
      timestamp: timeFormatted,
      isRead: false,
      isMention,
      keywords: detected,
      relatedRequestId: params.relatedRequestId,
    };

    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveStoredNotifications(updated);

    if (isMention) {
      showToast(`🔔 @Mention alert from ${params.senderName} in ${params.groupName}!`, 'info');
    } else {
      showToast(`New group message in ${params.groupName} from ${params.senderName}`);
    }
  };

  // Sync requests changes to localStorage
  const handleInsertRequest = (newReq: MerchantRequest) => {
    const updated = [newReq, ...requests];
    setRequests(updated);
    saveStoredRequests(updated);
    showToast(`Request ${newReq.id} created for ${newReq.merchantName}. Alert sent to Telegram.`);

    // Auto-broadcast real-time group notification
    handleSendGroupMessage({
      senderName: currentUser?.name || 'Central Intake Desk',
      senderRole: currentUser?.role || 'Operations Officer',
      groupName: '@pos_integration_core',
      message: `[NEW INTAKE] ${newReq.merchantName} (${newReq.businessType || 'Retail'}) submitted. Integration: ${newReq.integrationType}. Assigned to ${newReq.assignedStaff}. S/N: ${newReq.serialNumber || 'Pending'}.`,
      relatedRequestId: newReq.id,
    });
  };

  const handleImportRequests = (importedList: MerchantRequest[], mode: 'append' | 'replace') => {
    const updated = mode === 'replace' ? importedList : [...importedList, ...requests];
    setRequests(updated);
    saveStoredRequests(updated);
    showToast(`Successfully imported ${importedList.length} merchant requests (${mode === 'replace' ? 'all existing replaced' : 'appended'}).`);
  };

  const handleUpdateRequest = (updatedReq: MerchantRequest) => {
    const updated = requests.map((r) => (r.id === updatedReq.id ? updatedReq : r));
    setRequests(updated);
    saveStoredRequests(updated);
    setActiveRequest(updatedReq);
    showToast(`Status updated to ${updatedReq.status} for ${updatedReq.merchantName}.`);

    // Auto-broadcast status change alert to group
    const latestRemark = updatedReq.statusLogs?.[0]?.remarks || updatedReq.remarks || 'Status transitioned';
    handleSendGroupMessage({
      senderName: currentUser?.name || 'Technical Operations',
      senderRole: currentUser?.role || 'Integration Engineer',
      groupName: '@pos_integration_core',
      message: `[STATUS UPDATE] ${updatedReq.merchantName} (${updatedReq.id}) changed to "${updatedReq.status}". Tech note: ${latestRemark}`,
      relatedRequestId: updatedReq.id,
    });
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
        <SignInPage 
          onSignIn={handleSignIn} 
          theme={theme}
          onToggleTheme={toggleTheme}
        />
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
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
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
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
          unreadNotificationsCount={unreadNotificationsCount}
          hasMentionAlert={hasMentionAlert}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-32 sm:pb-24 max-w-7xl w-full mx-auto overflow-y-visible">
          {activeTab === 'dashboard' && (
            <Dashboard
              requests={requests}
              onOpenNewRequest={() => setIsNewRequestOpen(true)}
              onOpenImportData={() => setIsImportModalOpen(true)}
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
              onOpenImportData={() => setIsImportModalOpen(true)}
            />
          )}
        </main>

        {/* Clean Application Footer */}
        <footer className="px-6 sm:px-8 py-4 border-t border-[rgba(240,240,242,0.08)] text-[0.7rem] font-mono text-[rgba(240,240,242,0.5)] flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto bg-[#0f0f11]">
          <div>System Integration & Merchant Operations Console</div>
          <div className="flex items-center gap-3">
            <span>Staff: <strong className="text-[#f0f0f2]">{currentUser?.name}</strong> ({currentUser?.staffId})</span>
            <span>·</span>
            <span>Role: {currentUser?.role}</span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSubmit={handleInsertRequest}
        onOpenImport={() => setIsImportModalOpen(true)}
        telegramConfig={telegramConfig}
        currentUser={currentUser}
      />

      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportRequests}
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
        requests={requests}
      />

      <NotificationCenterModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearNotifications}
        onSendGroupMessage={handleSendGroupMessage}
        currentUser={currentUser}
        requests={requests}
        onOpenDetail={(req) => {
          setActiveRequest(req);
          setIsDetailOpen(true);
        }}
      />
    </div>
  );
}
