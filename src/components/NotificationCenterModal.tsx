import React, { useState, useMemo } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Check, 
  Search, 
  MessageSquare, 
  AlertTriangle, 
  Send, 
  AtSign, 
  Tag, 
  Sparkles,
  ExternalLink,
  Trash2,
  Filter
} from 'lucide-react';
import { GroupNotification, NotificationKeyword, UserProfile, MerchantRequest } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: GroupNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSendGroupMessage: (params: {
    senderName: string;
    senderRole: string;
    groupName: string;
    message: string;
    relatedRequestId?: string;
  }) => void;
  currentUser: UserProfile | null;
  requests: MerchantRequest[];
  onOpenDetail?: (request: MerchantRequest) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSendGroupMessage,
  currentUser,
  requests,
  onOpenDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'mentions' | 'POS' | 'Installation' | 'Maintenance' | 'Urgent'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Composer Form State
  const [composerSenderName, setComposerSenderName] = useState(currentUser?.name || 'Nget Monioudom');
  const [composerSenderRole, setComposerSenderRole] = useState(currentUser?.role || 'Lead Integration Engineer');
  const [composerGroup, setComposerGroup] = useState('@pos_integration_core');
  const [composerMessage, setComposerMessage] = useState('');
  const [composerRequestId, setComposerRequestId] = useState(requests[0]?.id || '');

  // Computed counts
  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);
  const mentionCount = useMemo(() => notifications.filter((n) => n.isMention).length, [notifications]);
  const posCount = useMemo(() => notifications.filter((n) => n.keywords.includes('POS')).length, [notifications]);
  const installCount = useMemo(() => notifications.filter((n) => n.keywords.includes('Installation')).length, [notifications]);
  const maintCount = useMemo(() => notifications.filter((n) => n.keywords.includes('Maintenance')).length, [notifications]);
  const urgentCount = useMemo(() => notifications.filter((n) => n.keywords.includes('Urgent')).length, [notifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Tab filter
      if (activeTab === 'unread' && n.isRead) return false;
      if (activeTab === 'mentions' && !n.isMention) return false;
      if (activeTab === 'POS' && !n.keywords.includes('POS')) return false;
      if (activeTab === 'Installation' && !n.keywords.includes('Installation')) return false;
      if (activeTab === 'Maintenance' && !n.keywords.includes('Maintenance')) return false;
      if (activeTab === 'Urgent' && !n.keywords.includes('Urgent')) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchText = n.message.toLowerCase().includes(q);
        const matchSender = n.senderName.toLowerCase().includes(q);
        const matchGroup = n.groupName.toLowerCase().includes(q);
        const matchKeywords = n.keywords.some((k) => k.toLowerCase().includes(q));
        return matchText || matchSender || matchGroup || matchKeywords;
      }
      return true;
    });
  }, [notifications, activeTab, searchTerm]);

  if (!isOpen) return null;

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerMessage.trim()) return;

    onSendGroupMessage({
      senderName: composerSenderName.trim() || 'Team Member',
      senderRole: composerSenderRole.trim() || 'Operations',
      groupName: composerGroup.trim() || '@pos_integration_core',
      message: composerMessage.trim(),
      relatedRequestId: composerRequestId || undefined,
    });

    setComposerMessage('');
    setIsComposerOpen(false);
  };

  const handlePresetSelect = (text: string, group?: string) => {
    setComposerMessage(text);
    if (group) setComposerGroup(group);
  };

  const formatRelativeTime = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  const getKeywordBadgeStyle = (keyword: NotificationKeyword) => {
    switch (keyword) {
      case 'Urgent':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'POS':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Installation':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Maintenance':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-white/5 text-[rgba(240,240,242,0.6)] border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-2 sm:p-4 overscroll-contain animate-in fade-in">
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div 
          className="bg-[#19191d] rounded-xl shadow-2xl border border-[rgba(240,240,242,0.12)] max-w-3xl w-full overflow-hidden text-[#f0f0f2] flex flex-col max-h-[92vh] sm:max-h-[88vh]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between bg-[#0f0f11] border-b border-[rgba(240,240,242,0.08)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-lg bg-white/5 border border-[rgba(240,240,242,0.1)] flex items-center justify-center text-[#2ecc71]">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#e74c3c]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base sm:text-lg uppercase tracking-wider font-semibold text-[#f0f0f2]">
                    Group Message & Alert Center
                  </h2>
                  {unreadCount > 0 && (
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs font-mono text-[rgba(240,240,242,0.5)] mt-0.5">
                  Real-time group notifications, keyword alerts & staff @mentions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsComposerOpen((prev) => !prev)}
                className={`btn-action-primary text-xs flex items-center gap-1.5 py-1.5 px-3 ${
                  isComposerOpen ? 'bg-[#27ae60]' : ''
                }`}
                title="Send a real-time group message"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send Message</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-[rgba(240,240,242,0.6)] hover:text-white p-1 rounded-md transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Real-Time Message Composer Drawer */}
          {isComposerOpen && (
            <div className="bg-[#141417] p-4 sm:p-5 border-b border-[rgba(240,240,242,0.1)] space-y-3.5 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[#2ecc71] flex items-center gap-1.5 uppercase">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Broadcast Real-Time Group Message</span>
                </span>
                <span className="text-[10px] font-mono text-[rgba(240,240,242,0.4)]">
                  Triggers real-time alerts & keyword tagging
                </span>
              </div>

              {/* Quick Presets for Mentions & Keywords */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[rgba(240,240,242,0.4)] uppercase">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handlePresetSelect(
                        `@${currentUser?.name || 'Nget Monioudom'} Urgent: Terminal at Starbucks 313 Quayside needs immediate POS installation!`,
                        '@pos_integration_core'
                      )
                    }
                    className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-[11px] font-mono border border-rose-500/30 transition-colors"
                  >
                    🚨 @Mention + Urgent POS Install
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handlePresetSelect(
                        'Scheduled maintenance for RS-232 serial cables tomorrow at 8 AM across all outlets.',
                        '@pos_integration_core'
                      )
                    }
                    className="px-2 py-1 rounded bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-[11px] font-mono border border-amber-500/30 transition-colors"
                  >
                    ⚙️ Cable Maintenance Alert
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handlePresetSelect(
                        'New POS terminal setup and merchant integration testing completed for VB Coffee.',
                        '@cambodia_pos_alerts'
                      )
                    }
                    className="px-2 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-[11px] font-mono border border-emerald-500/30 transition-colors"
                  >
                    📦 New POS Setup Done
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-mono text-[rgba(240,240,242,0.6)] mb-1">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      required
                      value={composerSenderName}
                      onChange={(e) => setComposerSenderName(e.target.value)}
                      placeholder="e.g. Seth Daka"
                      className="w-full text-xs px-2.5 py-1.5 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[rgba(240,240,242,0.6)] mb-1">
                      Target Group / Channel
                    </label>
                    <select
                      value={composerGroup}
                      onChange={(e) => setComposerGroup(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
                    >
                      <option value="@pos_integration_core">@pos_integration_core</option>
                      <option value="@cambodia_pos_alerts">@cambodia_pos_alerts</option>
                      <option value="Central Intake Desk">Central Intake Desk</option>
                      <option value="Merchant Support Cambodia">Merchant Support Cambodia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[rgba(240,240,242,0.6)] mb-1">
                      Related Request (Optional)
                    </label>
                    <select
                      value={composerRequestId}
                      onChange={(e) => setComposerRequestId(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
                    >
                      <option value="">None / General Group Message</option>
                      {requests.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.outletName} ({r.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[rgba(240,240,242,0.6)] mb-1">
                    Group Message (Mention @name or include keywords: POS, Installation, Maintenance, Urgent)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={composerMessage}
                    onChange={(e) => setComposerMessage(e.target.value)}
                    placeholder="e.g. @Nget Monioudom Urgent: The POS installation at Starbucks needs immediate attention..."
                    className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposerOpen(false)}
                    className="btn-action-secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-action-primary text-xs py-1.5 px-4 font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post to Group Now</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Keyword Filters & Search Toolbar */}
          <div className="p-3 sm:p-4 bg-[#0f0f11] border-b border-[rgba(240,240,242,0.08)] space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(240,240,242,0.4)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notifications by keyword (POS, Installation, Maintenance, Urgent), sender, or text..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-[#19191d] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.35)] focus:outline-none focus:border-[#2ecc71]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[rgba(240,240,242,0.4)] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Keyword Filter Tabs */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white/10 text-[#f0f0f2] font-semibold border border-white/20'
                      : 'text-[rgba(240,240,242,0.6)] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  All ({notifications.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('unread')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    activeTab === 'unread'
                      ? 'bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/40'
                      : 'text-[rgba(240,240,242,0.6)] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  Unread ({unreadCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('mentions')}
                  className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1 transition-colors ${
                    activeTab === 'mentions'
                      ? 'bg-amber-500/20 text-[#f1c40f] font-semibold border border-[#f1c40f]/40'
                      : 'text-[rgba(240,240,242,0.6)] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <AtSign className="w-3 h-3 text-[#f1c40f]" />
                  <span>@Mentions ({mentionCount})</span>
                </button>

                {/* Keyword Buttons */}
                <button
                  type="button"
                  onClick={() => setActiveTab('POS')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    activeTab === 'POS'
                      ? 'bg-emerald-500/20 text-[#2ecc71] font-semibold border border-[#2ecc71]/40'
                      : 'text-[rgba(240,240,242,0.6)] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  POS ({posCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('Installation')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    activeTab === 'Installation'
                      ? 'bg-blue-500/20 text-[#3498db] font-semibold border border-[#3498db]/40'
                      : 'text-[rgba(240,240,242,0.6)] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  Installation ({installCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('Maintenance')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    activeTab === 'Maintenance'
                      ? 'bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/40'
                      : 'text-[rgba(240,240,242,0.6)] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  Maintenance ({maintCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('Urgent')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    activeTab === 'Urgent'
                      ? 'bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/40'
                      : 'text-[rgba(240,240,242,0.6)] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  Urgent ({urgentCount})
                </button>
              </div>

              {/* Bulk actions */}
              <div className="flex items-center gap-2 text-xs font-mono">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="text-[#2ecc71] hover:underline flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="text-[rgba(240,240,242,0.4)] hover:text-rose-400 flex items-center gap-1 transition-colors"
                    title="Clear notification history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notification List Body */}
          <div className="p-4 overflow-y-auto overscroll-contain flex-1 divide-y divide-[rgba(240,240,242,0.06)]">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center text-xs font-mono text-[rgba(240,240,242,0.4)] space-y-2">
                <Bell className="w-8 h-8 mx-auto text-[rgba(240,240,242,0.2)]" />
                <p>No notifications found matching "{activeTab}" filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('all');
                    setSearchTerm('');
                  }}
                  className="text-[#2ecc71] hover:underline text-xs"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const relatedReq = n.relatedRequestId
                  ? requests.find((r) => r.id === n.relatedRequestId)
                  : undefined;

                return (
                  <div
                    key={n.id}
                    className={`py-3.5 px-3 rounded-xl transition-all mb-2 ${
                      !n.isRead
                        ? 'bg-[#141417] border border-[rgba(240,240,242,0.12)] shadow-xs'
                        : 'bg-[#0f0f11]/40 border border-transparent hover:bg-[#0f0f11] hover:border-[rgba(240,240,242,0.06)]'
                    }`}
                  >
                    {/* Top row: Sender, Group, Mentions, Time */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded bg-[#212126] border border-[rgba(240,240,242,0.1)] text-[#f0f0f2] font-display flex items-center justify-center text-xs font-bold shrink-0">
                          {n.senderAvatar || n.senderName.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-[#f0f0f2] truncate">
                              {n.senderName}
                            </span>
                            {n.senderRole && (
                              <span className="text-[10px] font-mono text-[rgba(240,240,242,0.4)] hidden sm:inline">
                                · {n.senderRole}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-[#3498db] bg-[#3498db]/10 px-1.5 py-0.5 rounded border border-[#3498db]/20 flex items-center gap-1">
                              <span>👥</span>
                              <span className="truncate">{n.groupName}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mention & Unread indicators */}
                      <div className="flex items-center gap-2 shrink-0">
                        {n.isMention && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-[#f1c40f] border border-[#f1c40f]/40 flex items-center gap-1 animate-pulse">
                            <AtSign className="w-3 h-3" />
                            <span>MENTIONED YOU</span>
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-[rgba(240,240,242,0.4)]">
                          {formatRelativeTime(n.timestamp)}
                        </span>

                        <button
                          type="button"
                          onClick={() => onMarkAsRead(n.id)}
                          className={`p-1 rounded text-xs transition-colors ${
                            n.isRead
                              ? 'text-[rgba(240,240,242,0.3)] hover:text-[#2ecc71]'
                              : 'text-[#2ecc71] hover:text-white bg-[#2ecc71]/10'
                          }`}
                          title={n.isRead ? 'Mark as unread' : 'Mark as read'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="mt-2 text-xs text-[#f0f0f2] font-sans leading-relaxed pl-9 break-words">
                      {n.message}
                    </div>

                    {/* Footer: Keywords & Related request */}
                    <div className="mt-2.5 flex items-center justify-between gap-2 pl-9 flex-wrap text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {n.keywords.map((kw) => (
                          <span
                            key={kw}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${getKeywordBadgeStyle(kw)}`}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>

                      {relatedReq && onOpenDetail && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenDetail(relatedReq);
                          }}
                          className="text-[11px] font-mono text-[#2ecc71] hover:underline flex items-center gap-1"
                        >
                          <span>View {relatedReq.outletName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 sm:px-6 py-3 bg-[#0f0f11] border-t border-[rgba(240,240,242,0.08)] flex items-center justify-between text-xs font-mono text-[rgba(240,240,242,0.4)] shrink-0">
            <span>
              Total History: {notifications.length} messages preserved locally
            </span>
            <button
              type="button"
              onClick={onClose}
              className="btn-action-secondary text-xs py-1 px-3"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
