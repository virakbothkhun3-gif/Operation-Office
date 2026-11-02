import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, HelpCircle, Shield, History, ExternalLink } from 'lucide-react';
import { TelegramConfig, TelegramDeliveryLog } from '../types';
import { sendTelegramMessage } from '../utils/telegram';
import { appendTelegramLog, getStoredTelegramLogs } from '../utils/storage';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onSaveConfig: (cfg: TelegramConfig) => void;
}

export const TelegramSettingsModal: React.FC<TelegramSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [botToken, setBotToken] = useState(config.botToken);
  const [chatIdOrUsername, setChatIdOrUsername] = useState(config.chatIdOrUsername);
  const [autoNotifyOnNewRequest, setAutoNotifyOnNewRequest] = useState(config.autoNotifyOnNewRequest);
  const [autoNotifyOnStatusUpdate, setAutoNotifyOnStatusUpdate] = useState(config.autoNotifyOnStatusUpdate);

  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [logs, setLogs] = useState<TelegramDeliveryLog[]>(getStoredTelegramLogs());
  const [activeTab, setActiveTab] = useState<'config' | 'preview' | 'logs'>('config');

  if (!isOpen) return null;

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
━━━━━━━━━━━━━━━━━
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#19191d] rounded-xl shadow-2xl border border-[rgba(240,240,242,0.12)] max-w-2xl w-full overflow-hidden my-8 text-[#f0f0f2]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-[#0f0f11] border-b border-[rgba(240,240,242,0.08)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-[rgba(240,240,242,0.08)] flex items-center justify-center text-[#2ecc71]">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg uppercase tracking-wider font-semibold text-[#f0f0f2]">
                Telegram Bot Relay Hub
              </h2>
              <p className="text-xs font-mono text-[rgba(240,240,242,0.5)] mt-0.5">
                Automated operations alerts and group dispatch gateway
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
        <div className="flex border-b border-[rgba(240,240,242,0.08)] bg-[#0f0f11] px-6 pt-2 gap-4 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 border-b-2 transition-colors uppercase ${
              activeTab === 'config'
                ? 'border-[#2ecc71] text-[#2ecc71] font-bold'
                : 'border-transparent text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2]'
            }`}
          >
            Bot Credentials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 border-b-2 transition-colors uppercase ${
              activeTab === 'preview'
                ? 'border-[#2ecc71] text-[#2ecc71] font-bold'
                : 'border-transparent text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2]'
            }`}
          >
            Message Format Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 uppercase ${
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

        {/* Content */}
        <div className="p-6">
          {activeTab === 'config' && (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Bot Father instructions */}
              <div className="p-3 bg-[#0f0f11] border border-[rgba(240,240,242,0.08)] rounded-lg text-xs space-y-1.5 text-[rgba(240,240,242,0.8)] font-mono">
                <div className="font-semibold text-[#2ecc71] flex items-center gap-1.5 uppercase">
                  <Shield className="w-3.5 h-3.5" />
                  Bot Configuration Setup:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[rgba(240,240,242,0.6)] pl-1 text-[11px]">
                  <li>Create bot via <strong>@BotFather</strong> in Telegram and copy API Token.</li>
                  <li>Add bot as Administrator to your ops group or channel.</li>
                  <li>Paste the Bot Token and your Group ID (e.g. <code>-5531389049</code>) or Username below.</li>
                </ol>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 border font-mono ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2ecc71] mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#e74c3c] mt-0.5" />
                  )}
                  <span>{testResult.msg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-[rgba(240,240,242,0.7)] mb-1 uppercase">
                  Telegram Bot API Token
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7123456789:AAFabcdefgh1234567890..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                />
                <span className="text-[10px] font-mono text-[rgba(240,240,242,0.4)] mt-1 block">
                  Keep secret. When blank, simulated mock records are logged locally.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-[rgba(240,240,242,0.7)] mb-1 uppercase">
                  Telegram Group ID or Username <span className="text-[#e74c3c]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. -5531389049 or @merchant_integration_hub"
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

              {/* Action buttons */}
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

          {activeTab === 'preview' && (
            <div className="space-y-3">
              <p className="text-xs font-mono text-[rgba(240,240,242,0.5)]">
                EXACT NOTIFICATION FORMAT DELIVERED TO TELEGRAM GROUP:
              </p>
              <div className="bg-[#0f0f11] text-[#f0f0f2] font-mono text-xs p-4 rounded-lg overflow-x-auto whitespace-pre leading-relaxed border border-[rgba(240,240,242,0.08)] select-all">
{`NEW MERCHANT INTEGRATION REQUEST
Merchant Company: KHUN Virakboth
Merchant Outlet: VB Coffee
POS S/N: WP555555Q55555
MID / TID: 55555555555 / 555555
Integration Type: Serial Port
Merchant Business: F&B / Restaurant & Cafe
👤 Contact Person: Mr.Vibol (012 5555 55)
Address: Phnom Penh
🗺️ Google Map: https://maps.app.goo.gl/phnompenh
👨‍💼 Assigned Staff: Nget Monioudom (Staff ID: 222222)
Current Status: New
Remarks: Merchant Request Completed Set within Today.
Logged At: 11/1/2026, 11:21:05 AM
Internal Only`}
              </div>
            </div>
          )}

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
  );
};
