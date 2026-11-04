import React, { useState, useMemo } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Copy, 
  Check, 
  FileText, 
  RefreshCw, 
  MessageSquare,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { MerchantRequest, TelegramConfig, TelegramDeliveryLog } from '../types';
import { 
  sendTelegramMessage, 
  formatNewRequestTelegramMessage, 
  formatStatusUpdateTelegramMessage,
  formatUatTerminalNoticeMessage,
  formatDailySummaryMessage
} from '../utils/telegram';
import { appendTelegramLog, getStoredTelegramLogs } from '../utils/storage';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onSaveConfig: (cfg: TelegramConfig) => void;
  requests?: MerchantRequest[];
}

export const TelegramSettingsModal: React.FC<TelegramSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  requests = [],
}) => {
  const [botToken, setBotToken] = useState(config.botToken);
  const [chatIdOrUsername, setChatIdOrUsername] = useState(config.chatIdOrUsername);
  const [autoNotifyOnNewRequest, setAutoNotifyOnNewRequest] = useState(config.autoNotifyOnNewRequest);
  const [autoNotifyOnStatusUpdate, setAutoNotifyOnStatusUpdate] = useState(config.autoNotifyOnStatusUpdate);

  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [logs, setLogs] = useState<TelegramDeliveryLog[]>(getStoredTelegramLogs());
  const [activeTab, setActiveTab] = useState<'config' | 'preview' | 'manual' | 'logs'>('config');

  // Preview format state
  type FormatType = 'new_request' | 'status_update' | 'uat_notice' | 'daily_summary';
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('new_request');
  const [selectedRequestId, setSelectedRequestId] = useState<string>(requests[0]?.id || 'demo');
  const [copied, setCopied] = useState(false);

  // Manual Dispatch State
  const [manualChatId, setManualChatId] = useState(config.chatIdOrUsername || '@pos_integration_core');
  const [manualCustomText, setManualCustomText] = useState('');
  const [manualSending, setManualSending] = useState(false);
  const [manualResult, setManualResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Active target request for preview
  const activePreviewRequest = useMemo<MerchantRequest>(() => {
    const found = requests.find((r) => r.id === selectedRequestId);
    if (found) return found;

    return {
      id: 'REQ-2026-098',
      merchantName: 'COFFEE CONCEPTS (CAMBODIA) LIMITED',
      outletName: 'STARBUCKS 313 QUAYSIDE',
      serialNumber: 'SN555555Q2222',
      mid: '',
      tid: '',
      address: 'HKL Ounalom River Side Mall, Preah Sisowath Quay, Village 1, PP',
      googleMap: 'N/A',
      businessType: 'F&B / Restaurant & Cafe',
      contactPerson: 'Seth Daka',
      phoneNumber: '012345678',
      integrationType: 'IP',
      assignedStaff: 'Nget Monioudom',
      staffId: '222222',
      status: 'New',
      telegramGroup: '@pos_integration_core',
      isPosTerminalUat: false,
      posTerminalUatStatus: 'Not Applicable',
      posModel: 'IP POS Terminal',
      remarks: 'Please adding POS stand and USB too',
      createdAt: '2026-11-02T13:50:06.000Z',
      updatedAt: '2026-11-02T13:50:06.000Z',
      statusLogs: [
        {
          id: 'LOG-098',
          previousStatus: 'New',
          newStatus: 'New',
          person: 'Nget Monioudom',
          staffId: '222222',
          timestamp: '2026-11-02T13:50:06.000Z',
          remarks: 'Please adding POS stand and USB too',
        },
      ],
    };
  }, [requests, selectedRequestId]);

  // Compute preview message based on selected format
  const generatedPreviewMessage = useMemo(() => {
    switch (selectedFormat) {
      case 'new_request':
        return formatNewRequestTelegramMessage(activePreviewRequest);
      case 'status_update': {
        const latestLog = activePreviewRequest.statusLogs?.[0] || {
          id: 'LOG-SAMPLE',
          previousStatus: 'Pending',
          newStatus: activePreviewRequest.status || 'In Progress',
          person: activePreviewRequest.assignedStaff || 'Nget Monioudom',
          staffId: activePreviewRequest.staffId || '222222',
          timestamp: new Date().toISOString(),
          remarks: 'Configured IP address and verified merchant gateway connection.',
        };
        return formatStatusUpdateTelegramMessage(activePreviewRequest, latestLog);
      }
      case 'uat_notice':
        return formatUatTerminalNoticeMessage({
          ...activePreviewRequest,
          isPosTerminalUat: true,
          posTerminalUatStatus: activePreviewRequest.posTerminalUatStatus || 'Pending Return',
          posModel: activePreviewRequest.posModel || 'Castles Vega3000 UAT Terminal',
          uatExpectedReturnDate: activePreviewRequest.uatExpectedReturnDate || '2026-11-15',
        });
      case 'daily_summary':
        return formatDailySummaryMessage(requests.length > 0 ? requests : [activePreviewRequest]);
      default:
        return formatNewRequestTelegramMessage(activePreviewRequest);
    }
  }, [selectedFormat, activePreviewRequest, requests]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sync generated preview into manual custom text when entering manual tab
  const handleSwitchToManual = (textToUse?: string) => {
    setManualCustomText(textToUse || generatedPreviewMessage);
    setActiveTab('manual');
    setManualResult(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TelegramConfig = {
      botToken: botToken.trim(),
      chatIdOrUsername: chatIdOrUsername.trim(),
      autoNotifyOnNewRequest,
      autoNotifyOnStatusUpdate,
      configuredAt: new Date().toISOString(),
    };
    onSaveConfig(updated);
    onClose();
  };

  const handleTestPing = async () => {
    setTestSending(true);
    setTestResult(null);

    const testText = `TELEGRAM BOT CONNECTION TEST
━━━━━━━━━━━━━━━━━━━
Connection test triggered successfully!
Target Chat: ${chatIdOrUsername || 'Default Group'}
Logged At: ${new Date().toLocaleString('en-US')}
━━━━━━━━━━━━━━━━━━━
Internal Only`;

    const currentConfig: TelegramConfig = {
      botToken: botToken.trim(),
      chatIdOrUsername: chatIdOrUsername.trim(),
      autoNotifyOnNewRequest,
      autoNotifyOnStatusUpdate,
    };

    const res = await sendTelegramMessage(
      currentConfig,
      testText,
      'Test Ping',
      'Manual Test Notification from Settings'
    );

    appendTelegramLog(res.log);
    setLogs(getStoredTelegramLogs());
    setTestSending(false);

    if (res.success && res.log.status === 'Sent') {
      setTestResult({
        success: true,
        msg: `Message delivered live to Telegram chat ${chatIdOrUsername}!`,
      });
    } else if (res.log.status === 'Simulated') {
      setTestResult({
        success: true,
        msg: `Demo simulated delivery recorded in log. To send live messages, provide a bot token and group ID.`,
      });
    } else {
      setTestResult({
        success: false,
        msg: res.error || 'Failed to dispatch to Telegram API.',
      });
    }
  };

  const handleManualDispatch = async () => {
    if (!manualCustomText.trim()) {
      setManualResult({ success: false, msg: 'Please enter a message to send.' });
      return;
    }

    setManualSending(true);
    setManualResult(null);

    const targetConfig: TelegramConfig = {
      botToken: botToken.trim() || config.botToken.trim(),
      chatIdOrUsername: manualChatId.trim() || chatIdOrUsername.trim() || config.chatIdOrUsername.trim(),
      autoNotifyOnNewRequest,
      autoNotifyOnStatusUpdate,
    };

    const res = await sendTelegramMessage(
      targetConfig,
      manualCustomText.trim(),
      'Manual Send',
      `Manual Dispatch -> ${targetConfig.chatIdOrUsername || 'Default Group'}`
    );

    appendTelegramLog(res.log);
    setLogs(getStoredTelegramLogs());
    setManualSending(false);

    if (res.success && res.log.status === 'Sent') {
      setManualResult({
        success: true,
        msg: `Message dispatched successfully to ${targetConfig.chatIdOrUsername}!`,
      });
    } else if (res.log.status === 'Simulated') {
      setManualResult({
        success: true,
        msg: `Simulated manual dispatch recorded in logs. (Add bot token for live transmission).`,
      });
    } else {
      setManualResult({
        success: false,
        msg: res.error || 'Failed to dispatch via Telegram Bot.',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-2 sm:p-4 overscroll-contain">
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div 
          className="bg-[#19191d] rounded-xl shadow-2xl border border-[rgba(240,240,242,0.12)] max-w-3xl w-full overflow-hidden text-[#f0f0f2] flex flex-col max-h-[92vh] sm:max-h-[90vh]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between bg-[#0f0f11] border-b border-[rgba(240,240,242,0.08)] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-[rgba(240,240,242,0.08)] flex items-center justify-center text-[#2ecc71]">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg uppercase tracking-wider font-semibold text-[#f0f0f2]">
                  Telegram Bot & Message Relay
                </h2>
                <p className="text-[11px] sm:text-xs font-mono text-[rgba(240,240,242,0.5)] mt-0.5">
                  Automated operations alerts, message format previews, and manual dispatch
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[rgba(240,240,242,0.6)] hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-navigation tabs */}
          <div className="flex border-b border-[rgba(240,240,242,0.08)] bg-[#0f0f11] px-4 sm:px-6 pt-2 gap-3 sm:gap-5 text-xs font-mono shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`pb-2.5 border-b-2 transition-colors uppercase whitespace-nowrap ${
                activeTab === 'config'
                  ? 'border-[#2ecc71] text-[#2ecc71] font-bold'
                  : 'border-transparent text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2]'
              }`}
            >
              Bot Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`pb-2.5 border-b-2 transition-colors uppercase whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'border-[#2ecc71] text-[#2ecc71] font-bold'
                  : 'border-transparent text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Format Previews (4)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!manualCustomText) setManualCustomText(generatedPreviewMessage);
                setActiveTab('manual');
              }}
              className={`pb-2.5 border-b-2 transition-colors uppercase whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'border-[#2ecc71] text-[#2ecc71] font-bold'
                  : 'border-transparent text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Manual Send & Copy</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 uppercase whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'border-[#2ecc71] text-[#2ecc71] font-bold'
                  : 'border-transparent text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2]'
              }`}
            >
              <span>Dispatch Logs</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-white/10 text-[rgba(240,240,242,0.7)] rounded">
                {logs.length}
              </span>
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-4">
            {/* TAB 1: Bot Credentials */}
            {activeTab === 'config' && (
              <form onSubmit={handleSave} className="space-y-4">
                {testResult && (
                  <div
                    className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{testResult.msg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                    Telegram Bot Token
                  </label>
                  <input
                    type="password"
                    placeholder="e.g. 7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                  />
                  <p className="text-[11px] text-[rgba(240,240,242,0.4)] mt-1 font-mono">
                    Obtain a bot token from @BotFather on Telegram.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                    Default Destination Group / Channel ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. @pos_integration_core or -100123456789"
                    value={chatIdOrUsername}
                    onChange={(e) => setChatIdOrUsername(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-[rgba(240,240,242,0.08)]">
                  <div className="text-xs font-mono uppercase text-[rgba(240,240,242,0.6)]">Automation Triggers:</div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[rgba(240,240,242,0.8)]">
                    <input
                      type="checkbox"
                      checked={autoNotifyOnNewRequest}
                      onChange={(e) => setAutoNotifyOnNewRequest(e.target.checked)}
                      className="w-4 h-4 text-[#2ecc71] rounded border-[rgba(240,240,242,0.2)] focus:ring-[#2ecc71]"
                    />
                    <span>Auto-dispatch when a new merchant request is submitted</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[rgba(240,240,242,0.8)]">
                    <input
                      type="checkbox"
                      checked={autoNotifyOnStatusUpdate}
                      onChange={(e) => setAutoNotifyOnStatusUpdate(e.target.checked)}
                      className="w-4 h-4 text-[#2ecc71] rounded border-[rgba(240,240,242,0.2)] focus:ring-[#2ecc71]"
                    />
                    <span>Auto-dispatch on status transitions & UAT returns</span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(240,240,242,0.08)]">
                  <button
                    type="button"
                    onClick={handleTestPing}
                    disabled={testSending}
                    className="btn-action-secondary text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-[#2ecc71]" />
                    <span>{testSending ? 'Testing...' : 'Send Test Notification'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-action-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-action-primary text-xs"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: Multiple Message Format Previews */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                {/* Format Switcher Pills */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[rgba(240,240,242,0.5)] mb-2">
                    SELECT MESSAGE TEMPLATE FORMAT:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFormat('new_request')}
                      className={`p-2 rounded-lg text-left text-xs font-mono border transition-all ${
                        selectedFormat === 'new_request'
                          ? 'border-[#2ecc71] bg-[#2ecc71]/10 text-[#2ecc71] font-semibold'
                          : 'border-[rgba(240,240,242,0.08)] bg-[#0f0f11] text-[rgba(240,240,242,0.6)] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>📞</span>
                        <span>1. New Request</span>
                      </div>
                      <div className="text-[10px] text-[rgba(240,240,242,0.4)] mt-0.5">Intake Request</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFormat('status_update')}
                      className={`p-2 rounded-lg text-left text-xs font-mono border transition-all ${
                        selectedFormat === 'status_update'
                          ? 'border-[#2ecc71] bg-[#2ecc71]/10 text-[#2ecc71] font-semibold'
                          : 'border-[rgba(240,240,242,0.08)] bg-[#0f0f11] text-[rgba(240,240,242,0.6)] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>🔄</span>
                        <span>2. Status Update</span>
                      </div>
                      <div className="text-[10px] text-[rgba(240,240,242,0.4)] mt-0.5">Transition Log</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFormat('uat_notice')}
                      className={`p-2 rounded-lg text-left text-xs font-mono border transition-all ${
                        selectedFormat === 'uat_notice'
                          ? 'border-[#2ecc71] bg-[#2ecc71]/10 text-[#2ecc71] font-semibold'
                          : 'border-[rgba(240,240,242,0.08)] bg-[#0f0f11] text-[rgba(240,240,242,0.6)] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>💳</span>
                        <span>3. UAT POS Notice</span>
                      </div>
                      <div className="text-[10px] text-[rgba(240,240,242,0.4)] mt-0.5">Loan / Return</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFormat('daily_summary')}
                      className={`p-2 rounded-lg text-left text-xs font-mono border transition-all ${
                        selectedFormat === 'daily_summary'
                          ? 'border-[#2ecc71] bg-[#2ecc71]/10 text-[#2ecc71] font-semibold'
                          : 'border-[rgba(240,240,242,0.08)] bg-[#0f0f11] text-[rgba(240,240,242,0.6)] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>📊</span>
                        <span>4. Daily Digest</span>
                      </div>
                      <div className="text-[10px] text-[rgba(240,240,242,0.4)] mt-0.5">Summary Report</div>
                    </button>
                  </div>
                </div>

                {/* Merchant Selector for live preview */}
                {selectedFormat !== 'daily_summary' && requests.length > 0 && (
                  <div className="flex items-center justify-between gap-3 bg-[#0f0f11] p-2.5 rounded-lg border border-[rgba(240,240,242,0.08)]">
                    <span className="text-xs font-mono text-[rgba(240,240,242,0.5)] shrink-0">
                      PREVIEW WITH MERCHANT:
                    </span>
                    <select
                      value={selectedRequestId}
                      onChange={(e) => setSelectedRequestId(e.target.value)}
                      className="text-xs font-mono px-2 py-1 bg-[#19191d] border border-[rgba(240,240,242,0.12)] rounded text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
                    >
                      {requests.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.merchantName} ({r.outletName}) — {r.id}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Formatted Message Code Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[rgba(240,240,242,0.6)]">
                    <span>EXACT TELEGRAM FORMATTED MESSAGE PREVIEW:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(generatedPreviewMessage)}
                        className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-[#2ecc71] flex items-center gap-1 transition-colors border border-white/10"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy Format'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSwitchToManual(generatedPreviewMessage)}
                        className="btn-action-primary text-xs py-1 px-2.5 flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Use in Manual Send →</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0f0f11] text-[#f0f0f2] font-mono text-xs p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[rgba(240,240,242,0.1)] select-all shadow-inner">
                    {generatedPreviewMessage}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Manual Message Dispatch & Custom Composer */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                {manualResult && (
                  <div
                    className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                      manualResult.success
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {manualResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{manualResult.msg}</span>
                  </div>
                )}

                {/* Quick Template Inserters */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono uppercase text-[rgba(240,240,242,0.5)]">
                      INSERT TEMPLATE TO EDIT:
                    </label>
                    <span className="text-[10px] font-mono text-[rgba(240,240,242,0.4)]">
                      Choose template to populate or edit manually
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setManualCustomText(formatNewRequestTelegramMessage(activePreviewRequest))}
                      className="px-2.5 py-1 rounded bg-[#0f0f11] hover:bg-white/5 border border-[rgba(240,240,242,0.1)] text-xs font-mono text-[rgba(240,240,242,0.8)] hover:text-[#2ecc71] transition-colors"
                    >
                      📞 New Request Format
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const latestLog = activePreviewRequest.statusLogs?.[0] || {
                          id: 'LOG-MANUAL',
                          previousStatus: 'New',
                          newStatus: 'In Progress',
                          person: activePreviewRequest.assignedStaff,
                          staffId: activePreviewRequest.staffId,
                          timestamp: new Date().toISOString(),
                          remarks: 'Manual status update verification.',
                        };
                        setManualCustomText(formatStatusUpdateTelegramMessage(activePreviewRequest, latestLog));
                      }}
                      className="px-2.5 py-1 rounded bg-[#0f0f11] hover:bg-white/5 border border-[rgba(240,240,242,0.1)] text-xs font-mono text-[rgba(240,240,242,0.8)] hover:text-[#2ecc71] transition-colors"
                    >
                      🔄 Status Update Format
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualCustomText(formatUatTerminalNoticeMessage(activePreviewRequest))}
                      className="px-2.5 py-1 rounded bg-[#0f0f11] hover:bg-white/5 border border-[rgba(240,240,242,0.1)] text-xs font-mono text-[rgba(240,240,242,0.8)] hover:text-[#2ecc71] transition-colors"
                    >
                      💳 UAT POS Notice Format
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualCustomText(formatDailySummaryMessage(requests))}
                      className="px-2.5 py-1 rounded bg-[#0f0f11] hover:bg-white/5 border border-[rgba(240,240,242,0.1)] text-xs font-mono text-[rgba(240,240,242,0.8)] hover:text-[#2ecc71] transition-colors"
                    >
                      📊 Daily Digest Format
                    </button>
                  </div>
                </div>

                {/* Target Chat for Manual Send */}
                <div>
                  <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                    Destination Telegram Group / Chat ID
                  </label>
                  <input
                    type="text"
                    value={manualChatId}
                    onChange={(e) => setManualChatId(e.target.value)}
                    placeholder="e.g. @pos_integration_core, -100123456789"
                    className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                  />
                </div>

                {/* Editable Text Area */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)]">
                      Message Content (Editable)
                    </label>
                    <span className="text-[10px] font-mono text-[rgba(240,240,242,0.4)]">
                      {manualCustomText.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={manualCustomText}
                    onChange={(e) => setManualCustomText(e.target.value)}
                    placeholder="Type or paste your message here..."
                    className="w-full text-xs font-mono px-3 py-2.5 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71] leading-relaxed"
                  />
                </div>

                {/* Actions: Manual Copy and Manual Dispatch */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[rgba(240,240,242,0.08)]">
                  <button
                    type="button"
                    onClick={() => handleCopy(manualCustomText)}
                    disabled={!manualCustomText.trim()}
                    className="btn-action-secondary text-xs flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard (Manual Paste)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleManualDispatch}
                    disabled={manualSending || !manualCustomText.trim()}
                    className="btn-action-primary text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{manualSending ? 'Dispatching...' : 'Send Manually via Bot'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: Dispatch Logs */}
            {activeTab === 'logs' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[rgba(240,240,242,0.5)]">
                  <span>RECENT TELEGRAM DISPATCH LOG ({logs.length})</span>
                  <button
                    type="button"
                    onClick={() => setLogs(getStoredTelegramLogs())}
                    className="hover:text-[#2ecc71] underline"
                  >
                    REFRESH
                  </button>
                </div>

                {logs.length === 0 ? (
                  <div className="text-center py-8 text-xs font-mono text-[rgba(240,240,242,0.4)] border border-dashed border-[rgba(240,240,242,0.08)] rounded-lg">
                    No notifications recorded yet. Submit a new merchant request or click "Send Test Notification".
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto border border-[rgba(240,240,242,0.08)] bg-[#0f0f11] rounded-lg divide-y divide-[rgba(240,240,242,0.04)] text-xs font-mono">
                    {logs.map((log) => (
                      <div key={log.id} className="p-3 space-y-1 hover:bg-white/[0.015]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                              log.status === 'Sent'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                                : log.status === 'Simulated'
                                ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                                : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                            }`}>
                              {log.status}
                            </span>
                            <span className="font-semibold text-[#f0f0f2]">{log.trigger}</span>
                          </div>
                          <span className="text-[rgba(240,240,242,0.4)] text-[11px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[rgba(240,240,242,0.6)] text-[11px]">{log.messageSummary}</p>
                        <div className="text-[10px] text-[rgba(240,240,242,0.4)] font-mono">
                          Target: {log.recipient}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
