import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Tag, 
  RefreshCw, 
  Send, 
  FileSpreadsheet, 
  ExternalLink,
  Copy,
  Check,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MerchantRequest, TelegramConfig } from '../types';
import { 
  formatNewRequestTelegramMessage, 
  formatStatusUpdateTelegramMessage,
  formatUatTerminalNoticeMessage,
  sendTelegramMessage 
} from '../utils/telegram';
import { appendTelegramLog } from '../utils/storage';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MerchantRequest | null;
  onOpenStatusUpdate: (request: MerchantRequest) => void;
  telegramConfig: TelegramConfig;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  onOpenStatusUpdate,
  telegramConfig,
}) => {
  const [showMsgPreview, setShowMsgPreview] = useState(false);
  const [formatType, setFormatType] = useState<'new_request' | 'status_update' | 'uat_notice'>('new_request');
  const [copied, setCopied] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !request) return null;

  const getFormattedMessage = () => {
    switch (formatType) {
      case 'new_request':
        return formatNewRequestTelegramMessage(request);
      case 'status_update': {
        const latestLog = request.statusLogs?.[0] || {
          id: `LOG-${request.id}`,
          previousStatus: 'New',
          newStatus: request.status,
          person: request.assignedStaff,
          staffId: request.staffId,
          timestamp: request.updatedAt,
          remarks: request.remarks || 'Status verification update',
        };
        return formatStatusUpdateTelegramMessage(request, latestLog);
      }
      case 'uat_notice':
        return formatUatTerminalNoticeMessage(request);
      default:
        return formatNewRequestTelegramMessage(request);
    }
  };

  const handleCopyMessage = () => {
    const text = getFormattedMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResendTelegram = async () => {
    setIsSending(true);
    setSendResult(null);

    const targetConfig = {
      ...telegramConfig,
      chatIdOrUsername: request.telegramGroup || telegramConfig.chatIdOrUsername,
    };
    const msg = getFormattedMessage();
    const res = await sendTelegramMessage(
      targetConfig,
      msg,
      'Manual Resend',
      `Manual Telegram dispatch: ${request.merchantName} (${request.id}) -> ${targetConfig.chatIdOrUsername || 'Default'}`
    );
    appendTelegramLog(res.log);
    setIsSending(false);

    if (res.success && res.log.status === 'Sent') {
      setSendResult({
        success: true,
        msg: `Message delivered to ${targetConfig.chatIdOrUsername || 'Telegram'}!`,
      });
    } else if (res.log.status === 'Simulated') {
      setSendResult({
        success: true,
        msg: `Demo simulated delivery recorded in Telegram log.`,
      });
    } else {
      setSendResult({
        success: false,
        msg: res.error || 'Failed to dispatch to Telegram API.',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return 'text-[#3498db] border-[#3498db]/40 bg-[#3498db]/10';
      case 'Pending':
        return 'text-[#f39c12] border-[#f39c12]/40 bg-[#f39c12]/10';
      case 'In Progress':
        return 'text-[#f1c40f] border-[#f1c40f]/40 bg-[#f1c40f]/10';
      case 'Testing':
        return 'text-[#9b59b6] border-[#9b59b6]/40 bg-[#9b59b6]/10';
      case 'Completed':
        return 'text-[#2ecc71] border-[#2ecc71]/40 bg-[#2ecc71]/10';
      case 'Rejected / Cancelled':
        return 'text-[#e74c3c] border-[#e74c3c]/40 bg-[#e74c3c]/10';
      default:
        return 'text-[#f0f0f2] border-[rgba(240,240,242,0.2)] bg-white/5';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-2 sm:p-4 overscroll-contain">
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div 
          className="bg-[#19191d] rounded-xl shadow-2xl border border-[rgba(240,240,242,0.12)] max-w-3xl w-full overflow-hidden text-[#f0f0f2] flex flex-col max-h-[92vh] sm:max-h-[88vh]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between bg-[#0f0f11] border-b border-[rgba(240,240,242,0.08)] shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 bg-white/10 rounded font-semibold text-[#2ecc71]">
                  {request.id}
                </span>
                <h2 className="font-display text-base sm:text-lg uppercase tracking-wider font-semibold text-[#f0f0f2]">
                  {request.merchantName}
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs font-mono text-[rgba(240,240,242,0.5)] mt-0.5">
                Outlet: {request.outletName} · Serial: {request.serialNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[rgba(240,240,242,0.6)] hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto overscroll-contain flex-1">
          {/* Top Status & Fast Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0f0f11] rounded-lg border border-[rgba(240,240,242,0.08)]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[rgba(240,240,242,0.5)]">STATUS:</span>
              <span className={`text-xs font-mono px-2.5 py-1 rounded border font-semibold ${getStatusBadge(request.status)}`}>
                {request.status.toUpperCase()}
              </span>
              {request.isPosTerminalUat && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                  request.posTerminalUatStatus === 'Pending Return'
                    ? 'bg-[#f1c40f]/10 text-[#f1c40f] border border-[#f1c40f]/30'
                    : 'bg-[#2ecc71]/10 text-[#2ecc71] border border-[#2ecc71]/30'
                }`}>
                  UAT POS: {request.posTerminalUatStatus.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowMsgPreview((prev) => !prev)}
                className={`btn-action-secondary text-xs flex items-center gap-1.5 ${
                  showMsgPreview ? 'border-[#2ecc71] text-[#2ecc71] bg-white/5' : ''
                }`}
                title="Preview Telegram Message & Manual Copy"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Preview</span>
              </button>

              <button
                type="button"
                onClick={handleResendTelegram}
                disabled={isSending}
                className="btn-action-secondary text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-[#2ecc71]" />
                <span>{isSending ? 'Sending...' : 'Send to Telegram'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStatusUpdate(request);
                }}
                className="btn-action-primary text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Update Status</span>
              </button>
            </div>
          </div>

          {/* Delivery result banner */}
          {sendResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                sendResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
              }`}
            >
              {sendResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{sendResult.msg}</span>
            </div>
          )}

          {/* Expandable Message Format Preview */}
          {showMsgPreview && (
            <div className="bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-[rgba(240,240,242,0.5)]">FORMAT:</span>
                  <div className="flex rounded-lg bg-[#19191d] p-0.5 border border-[rgba(240,240,242,0.08)]">
                    <button
                      type="button"
                      onClick={() => setFormatType('new_request')}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                        formatType === 'new_request'
                          ? 'bg-[#2ecc71]/20 text-[#2ecc71] font-bold'
                          : 'text-[rgba(240,240,242,0.6)] hover:text-[#f0f0f2]'
                      }`}
                    >
                      📞 New Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormatType('status_update')}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                        formatType === 'status_update'
                          ? 'bg-[#2ecc71]/20 text-[#2ecc71] font-bold'
                          : 'text-[rgba(240,240,242,0.6)] hover:text-[#f0f0f2]'
                      }`}
                    >
                      🔄 Status Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormatType('uat_notice')}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                        formatType === 'uat_notice'
                          ? 'bg-[#2ecc71]/20 text-[#2ecc71] font-bold'
                          : 'text-[rgba(240,240,242,0.6)] hover:text-[#f0f0f2]'
                      }`}
                    >
                      💳 UAT Notice
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-[#2ecc71] flex items-center gap-1 border border-white/10 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard (Manual Paste)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendTelegram}
                    disabled={isSending}
                    className="btn-action-primary text-xs py-1 px-2.5 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send This Format</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#19191d] text-[#f0f0f2] font-mono text-xs p-3.5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[rgba(240,240,242,0.08)] select-all shadow-inner">
                {getFormattedMessage()}
              </div>
            </div>
          )}

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment & Hardware Terminal Spec */}
            <div className="border border-[rgba(240,240,242,0.08)] bg-[#0f0f11]/50 rounded-lg p-4 space-y-2.5">
              <h3 className="text-xs font-mono font-semibold text-[rgba(240,240,242,0.6)] uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2ecc71]" />
                Terminal & Integration Parameters
              </h3>
              <div className="text-xs space-y-2 pt-1 font-mono">
                <div className="flex justify-between py-1 border-b border-[rgba(240,240,242,0.06)]">
                  <span className="text-[rgba(240,240,242,0.5)]">MID (Merchant ID):</span>
                  <span className="text-[#f0f0f2] font-semibold">{request.mid}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(240,240,242,0.06)]">
                  <span className="text-[rgba(240,240,242,0.5)]">TID (Terminal ID):</span>
                  <span className="text-[#f0f0f2] font-semibold">{request.tid}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(240,240,242,0.06)]">
                  <span className="text-[rgba(240,240,242,0.5)]">POS Serial:</span>
                  <span className="text-[#f0f0f2] font-semibold">{request.serialNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(240,240,242,0.06)]">
                  <span className="text-[rgba(240,240,242,0.5)]">Integration Type:</span>
                  <span className="text-[#2ecc71] font-semibold">{request.integrationType}</span>
                </div>
                {request.telegramGroup && (
                  <div className="flex justify-between py-1 border-b border-[rgba(240,240,242,0.06)]">
                    <span className="text-[rgba(240,240,242,0.5)]">Telegram Group:</span>
                    <span className="text-[#2ecc71] font-semibold">{request.telegramGroup}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-[rgba(240,240,242,0.5)]">Merchant Business:</span>
                  <span className="text-[#f0f0f2]">{request.businessType}</span>
                </div>
              </div>
            </div>

            {/* Merchant Contact & Site Location */}
            <div className="border border-[rgba(240,240,242,0.08)] bg-[#0f0f11]/50 rounded-lg p-4 space-y-2.5">
              <h3 className="text-xs font-mono font-semibold text-[rgba(240,240,242,0.6)] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2ecc71]" />
                Location & Staff Ownership
              </h3>
              <div className="text-xs space-y-2 pt-1 font-mono">
                <div className="flex justify-between py-1 border-b border-[rgba(240,240,242,0.06)]">
                  <span className="text-[rgba(240,240,242,0.5)]">👤 Contact Person:</span>
                  <span className="text-[#f0f0f2]">{request.contactPerson}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(240,240,242,0.06)]">
                  <span className="text-[rgba(240,240,242,0.5)]">Phone Number:</span>
                  <span className="text-[#f0f0f2]">{request.phoneNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(240,240,242,0.06)]">
                  <span className="text-[rgba(240,240,242,0.5)]">👨‍💼 Assigned Staff:</span>
                  <span className="text-[#f0f0f2] font-semibold">
                    {request.assignedStaff} (ID: {request.staffId})
                  </span>
                </div>
                <div className="py-1 border-b border-[rgba(240,240,242,0.06)]">
                  <span className="text-[rgba(240,240,242,0.5)] block mb-0.5">Physical Address:</span>
                  <span className="text-[#f0f0f2] font-sans text-xs">{request.address}</span>
                </div>
                {request.googleMap && (
                  <div className="py-1">
                    <span className="text-[rgba(240,240,242,0.5)] block mb-0.5">🗺️ Google Map:</span>
                    <a
                      href={request.googleMap.startsWith('http') ? request.googleMap : `https://maps.google.com/?q=${encodeURIComponent(request.googleMap)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2ecc71] hover:underline inline-flex items-center gap-1 font-medium break-all font-mono text-[11px]"
                    >
                      <span>{request.googleMap}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* POS Terminal UAT Specific Banner */}
          {request.isPosTerminalUat && (
            <div className="p-4 bg-[#0f0f11] border border-[#f1c40f]/40 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#f1c40f]">
                  POS Terminal UAT Loan Record: {request.posModel || 'Test Terminal'}
                </span>
                <span className="font-mono text-[#f1c40f]/80">
                  STATUS: {request.posTerminalUatStatus.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono pt-1 text-[11px]">
                <div>
                  <span className="text-[rgba(240,240,242,0.4)] block">Loan Date:</span>
                  <span className="text-[#f0f0f2]">{request.uatLoanDate || 'At intake'}</span>
                </div>
                <div>
                  <span className="text-[rgba(240,240,242,0.4)] block">Expected Return:</span>
                  <span className="text-[#f1c40f] font-medium">{request.uatExpectedReturnDate || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[rgba(240,240,242,0.4)] block">Actual Return Date:</span>
                  <span className="text-[#2ecc71] font-medium">
                    {request.uatActualReturnDate ? request.uatActualReturnDate : 'Pending Return'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Chronological Status Audit Log */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold text-[rgba(240,240,242,0.6)] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2ecc71]" />
                Audit Trail & Operation History ({request.statusLogs.length})
              </span>
              <span className="text-[11px] text-[rgba(240,240,242,0.4)] font-normal">
                Chronological transitions
              </span>
            </h3>

            <div className="border border-[rgba(240,240,242,0.08)] bg-[#0f0f11]/60 rounded-lg overflow-hidden divide-y divide-[rgba(240,240,242,0.04)]">
              {request.statusLogs.map((log, index) => (
                <div key={log.id || index} className="p-3.5 text-xs space-y-1.5 hover:bg-white/[0.015] transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#2ecc71]">
                        {log.previousStatus === log.newStatus ? log.newStatus : `${log.previousStatus} -> ${log.newStatus}`}
                      </span>
                      <span className="text-[rgba(240,240,242,0.3)]">·</span>
                      <span className="text-[#f0f0f2] font-medium">
                        {log.person} (Staff ID: {log.staffId})
                      </span>
                    </div>
                    <span className="font-mono text-[rgba(240,240,242,0.4)] text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[rgba(240,240,242,0.8)] pl-2 border-l-2 border-[#2ecc71] py-0.5 font-mono text-[11px]">
                    {log.remarks}
                  </p>

                  {log.uatStatusChange && (
                    <div className="text-[11px] text-[#f1c40f] font-mono">
                      Terminal Return Status: {log.uatStatusChange.from} &rarr; {log.uatStatusChange.to}
                      {log.uatStatusChange.returnDate && ` (Received: ${log.uatStatusChange.returnDate})`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0f0f11] border-t border-[rgba(240,240,242,0.08)] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-action-secondary text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);
};
