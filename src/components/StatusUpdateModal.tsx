import React, { useState } from 'react';
import { X, Check, Send, AlertTriangle } from 'lucide-react';
import { MerchantRequest, RequestStatus, StatusLog, TelegramConfig, UatTerminalStatus, UserProfile } from '../types';
import { formatStatusUpdateTelegramMessage, sendTelegramMessage } from '../utils/telegram';
import { appendTelegramLog } from '../utils/storage';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MerchantRequest | null;
  onUpdate: (updatedRequest: MerchantRequest) => void;
  telegramConfig: TelegramConfig;
  currentUser?: UserProfile | null;
}

const ALL_STATUSES: RequestStatus[] = [
  'New',
  'Pending',
  'In Progress',
  'Testing',
  'Completed',
  'Rejected / Cancelled',
];

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  request,
  onUpdate,
  telegramConfig,
  currentUser,
}) => {
  if (!isOpen || !request) return null;

  const [newStatus, setNewStatus] = useState<RequestStatus>(request.status);
  const [person, setPerson] = useState(() => currentUser?.name || request.assignedStaff || 'Nget Monioudom');
  const [staffId, setStaffId] = useState(() => currentUser?.staffId || request.staffId || '222222');
  const [remarks, setRemarks] = useState('');
  
  // UAT return handling
  const [newUatStatus, setNewUatStatus] = useState<UatTerminalStatus>(request.posTerminalUatStatus);
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [notifyTelegram, setNotifyTelegram] = useState(telegramConfig.autoNotifyOnStatusUpdate);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!person.trim() || !staffId.trim()) {
      setErrorMsg('Please specify the person name and Staff ID performing this update.');
      return;
    }
    if (!remarks.trim()) {
      setErrorMsg('Remarks are required for audit trail history.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const nowIso = new Date().toISOString();
    
    // Check if UAT status changed
    let uatStatusChangeInfo = undefined;
    if (request.isPosTerminalUat && newUatStatus !== request.posTerminalUatStatus) {
      uatStatusChangeInfo = {
        from: request.posTerminalUatStatus,
        to: newUatStatus,
        returnDate: newUatStatus === 'Returned' ? returnDate : undefined,
      };
    }

    const newLog: StatusLog = {
      id: `LOG-${Date.now()}`,
      previousStatus: request.status,
      newStatus,
      person: person.trim(),
      staffId: staffId.trim(),
      timestamp: nowIso,
      remarks: remarks.trim(),
      uatStatusChange: uatStatusChangeInfo,
    };

    const updatedRequest: MerchantRequest = {
      ...request,
      status: newStatus,
      posTerminalUatStatus: request.isPosTerminalUat ? newUatStatus : request.posTerminalUatStatus,
      uatActualReturnDate: (request.isPosTerminalUat && newUatStatus === 'Returned') ? returnDate : request.uatActualReturnDate,
      updatedAt: nowIso,
      statusLogs: [newLog, ...request.statusLogs],
    };

    // Telegram notification dispatch if checked
    if (notifyTelegram) {
      const tgMsg = formatStatusUpdateTelegramMessage(updatedRequest, newLog);
      const res = await sendTelegramMessage(
        telegramConfig,
        tgMsg,
        'Status Update',
        `Status changed to ${newStatus} for ${request.merchantName}`
      );
      appendTelegramLog(res.log);
    }

    setSubmitting(false);
    onUpdate(updatedRequest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#19191d] rounded-xl shadow-2xl border border-[rgba(240,240,242,0.12)] max-w-lg w-full overflow-hidden my-8 text-[#f0f0f2]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-[#0f0f11] border-b border-[rgba(240,240,242,0.08)]">
          <div>
            <h2 className="font-display text-lg uppercase tracking-wider font-semibold text-[#f0f0f2]">
              Update Request Status
            </h2>
            <p className="text-xs font-mono text-[rgba(240,240,242,0.5)] mt-0.5">
              {request.id} · {request.merchantName} ({request.outletName})
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-400 text-xs rounded-lg flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Context Summary */}
          <div className="bg-[#0f0f11] border border-[rgba(240,240,242,0.08)] rounded-lg p-3 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-[rgba(240,240,242,0.5)]">MID / TID:</span>
              <span className="text-[#f0f0f2]">{request.mid} / {request.tid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(240,240,242,0.5)]">POS S/N:</span>
              <span className="text-[#f0f0f2]">{request.serialNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgba(240,240,242,0.5)]">CURRENT STATUS:</span>
              <span className="text-[#2ecc71] font-semibold">{request.status}</span>
            </div>
          </div>

          {/* Target Status Selection */}
          <div>
            <label className="block text-xs font-mono text-[rgba(240,240,242,0.7)] mb-1.5 uppercase">
              New Status <span className="text-[#e74c3c]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_STATUSES.map((status) => {
                const isSelected = newStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setNewStatus(status)}
                    className={`px-3 py-2 text-xs font-mono rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-[#2ecc71] bg-[#2ecc71]/10 text-[#2ecc71] font-semibold'
                        : 'border-[rgba(240,240,242,0.08)] bg-[#0f0f11] text-[rgba(240,240,242,0.6)] hover:border-[rgba(240,240,242,0.2)]'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* UAT Terminal Return Section (if loaned) */}
          {request.isPosTerminalUat && (
            <div className="p-3 bg-[#0f0f11] border border-[#f1c40f]/40 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#f1c40f]">
                  POS Terminal UAT Status ({request.posModel || 'Test Terminal'})
                </span>
                <span className="text-[11px] font-mono text-[#f1c40f]/80">
                  Current: {request.posTerminalUatStatus}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {(['Pending Return', 'Returned'] as UatTerminalStatus[]).map((uStatus) => (
                  <button
                    key={uStatus}
                    type="button"
                    onClick={() => setNewUatStatus(uStatus)}
                    className={`py-1.5 px-2 text-xs font-mono rounded border transition-colors ${
                      newUatStatus === uStatus
                        ? 'bg-[#f1c40f]/20 text-[#f1c40f] border-[#f1c40f] font-medium'
                        : 'bg-[#19191d] text-[rgba(240,240,242,0.6)] border-[rgba(240,240,242,0.1)] hover:bg-white/5'
                    }`}
                  >
                    {uStatus === 'Returned' ? 'Mark Returned' : 'Pending Return'}
                  </button>
                ))}
              </div>
              {newUatStatus === 'Returned' && (
                <div className="pt-1">
                  <label className="block text-[11px] font-medium text-[rgba(240,240,242,0.6)] mb-0.5">
                    Terminal Received Back Date:
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-[rgba(240,240,242,0.12)] rounded bg-[#19191d] text-[#f0f0f2] font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* Person & Staff ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                Updated By (Person) <span className="text-[#e74c3c]">*</span>
              </label>
              <input
                type="text"
                required
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="e.g. Nget Monioudom"
                className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                Staff ID <span className="text-[#e74c3c]">*</span>
              </label>
              <input
                type="text"
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="e.g. 222222"
                className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
              />
            </div>
          </div>

          {/* Mandatory Remarks */}
          <div>
            <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
              Remarks / Progress Notes <span className="text-[#e74c3c]">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="State reason for update, test results, or next steps..."
              className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
            />
          </div>

          {/* Telegram Notification Checkbox */}
          <div className="flex items-center justify-between p-2.5 bg-[#0f0f11] border border-[rgba(240,240,242,0.08)] rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyTelegram}
                onChange={(e) => setNotifyTelegram(e.target.checked)}
                className="w-4 h-4 text-[#2ecc71] rounded border-[rgba(240,240,242,0.2)] focus:ring-[#2ecc71]"
              />
              <span className="text-xs font-medium text-[#f0f0f2] flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#2ecc71]" />
                Send status update notification to Telegram group
              </span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(240,240,242,0.08)]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn-action-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-action-primary text-xs flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save & Record Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
