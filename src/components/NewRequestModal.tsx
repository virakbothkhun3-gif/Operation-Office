import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { IntegrationType, MerchantRequest, TelegramConfig, UserProfile } from '../types';
import { formatNewRequestTelegramMessage, sendTelegramMessage } from '../utils/telegram';
import { appendTelegramLog } from '../utils/storage';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: MerchantRequest) => void;
  telegramConfig: TelegramConfig;
  currentUser?: UserProfile | null;
}

const BUSINESS_TYPES = [
  'F&B / Restaurant & Cafe',
  'Retail & Apparel',
  'Supermarket & Grocery',
  'Hospitality & Hotel',
  'Electronics & Digital',
  'Health & Beauty',
  'Automotive & Fuel',
  'Services & Entertainment',
  'Other Commercial Sector',
];

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  telegramConfig,
  currentUser,
}) => {
  const [merchantName, setMerchantName] = useState('');
  const [outletName, setOutletName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [mid, setMid] = useState('');
  const [tid, setTid] = useState('');
  const [address, setAddress] = useState('');
  const [googleMap, setGoogleMap] = useState('');
  const [businessType, setBusinessType] = useState('F&B / Restaurant & Cafe');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [integrationType, setIntegrationType] = useState<IntegrationType>('IP');
  const [assignedStaff, setAssignedStaff] = useState(() => currentUser?.name || 'Nget Monioudom');
  const [staffId, setStaffId] = useState(() => currentUser?.staffId || '222222');
  const [remarks, setRemarks] = useState('Please adding POS stand and USB too');

  // Quick fill helper
  const handleLoadSample = () => {
    setMerchantName('COFFEE CONCEPTS (CAMBODIA) LIMITED');
    setOutletName('STARBUCKS 313 QUAYSIDE');
    setSerialNumber('SN555555Q2222');
    setMid('');
    setTid('');
    setAddress('HKL Ounalom River Side Mall, Preah Sisowath Quay, Village 1, PP');
    setGoogleMap('N/A');
    setBusinessType('F&B / Restaurant & Cafe');
    setContactPerson('Seth Daka');
    setPhoneNumber('012345678');
    setIntegrationType('IP');
    setAssignedStaff('Nget Monioudom');
    setStaffId('222222');
    setRemarks('Please adding POS stand and USB too');
  };

  // UAT Loan specifics
  const [isPosTerminalUat, setIsPosTerminalUat] = useState(false);
  const [posModel, setPosModel] = useState('PAX A920 Pro SmartPOS');
  const [uatExpectedReturnDate, setUatExpectedReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // default 2 weeks loan
    return d.toISOString().split('T')[0];
  });

  const [sendTelegram, setSendTelegram] = useState(telegramConfig.autoNotifyOnNewRequest);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName.trim() || !outletName.trim() || !serialNumber.trim()) {
      setErrorMsg('Please fill in Merchant Company, Outlet Name, and POS Serial Number.');
      return;
    }
    if (!assignedStaff.trim() || !staffId.trim()) {
      setErrorMsg('Assigned Staff Name and Staff ID are mandatory.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const newReqId = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const newRequest: MerchantRequest = {
      id: newReqId,
      merchantName: merchantName.trim(),
      outletName: outletName.trim(),
      serialNumber: serialNumber.trim(),
      mid: mid.trim(),
      tid: tid.trim(),
      address: address.trim() || 'Address to be confirmed on site',
      googleMap: googleMap.trim() || undefined,
      businessType,
      contactPerson: contactPerson.trim() || 'Store Manager',
      phoneNumber: phoneNumber.trim() || '-',
      integrationType,
      assignedStaff: assignedStaff.trim(),
      staffId: staffId.trim(),
      status: 'New',
      isPosTerminalUat,
      posTerminalUatStatus: isPosTerminalUat ? 'Pending Return' : 'Not Applicable',
      posModel: isPosTerminalUat ? posModel : undefined,
      uatLoanDate: isPosTerminalUat ? nowIso.split('T')[0] : undefined,
      uatExpectedReturnDate: isPosTerminalUat ? uatExpectedReturnDate : undefined,
      remarks: remarks.trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
      statusLogs: [
        {
          id: `LOG-${Date.now()}`,
          previousStatus: 'New',
          newStatus: 'New',
          person: assignedStaff.trim(),
          staffId: staffId.trim(),
          timestamp: nowIso,
          remarks: remarks.trim() || 'New merchant integration request initialized.',
          uatStatusChange: isPosTerminalUat
            ? {
                from: 'Not Applicable',
                to: 'Pending Return',
                returnDate: uatExpectedReturnDate,
              }
            : undefined,
        },
      ],
    };

    // Auto-dispatch to Telegram if enabled
    if (sendTelegram) {
      const tgMsg = formatNewRequestTelegramMessage(newRequest);
      const res = await sendTelegramMessage(
        telegramConfig,
        tgMsg,
        'New Request',
        `New request: ${newRequest.merchantName} (${newRequest.id})`
      );
      appendTelegramLog(res.log);
    }

    setSubmitting(false);
    onSubmit(newRequest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#19191d] rounded-xl shadow-2xl border border-[rgba(240,240,242,0.12)] max-w-2xl w-full overflow-hidden my-8 text-[#f0f0f2]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-[#0f0f11] border-b border-[rgba(240,240,242,0.08)]">
          <div>
            <h2 className="font-display text-lg uppercase tracking-wider font-semibold text-[#f0f0f2]">
              Insert New Merchant Request
            </h2>
            <p className="text-xs font-mono text-[rgba(240,240,242,0.5)] mt-0.5">
              Enter merchant details, POS serial, network integration parameters, and notify Telegram
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-400 text-xs rounded-lg flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Merchant & Outlet Identification */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold text-[rgba(240,240,242,0.6)] uppercase tracking-wider">
                1. Merchant & Outlet Information
              </h3>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-[11px] font-mono text-[#2ecc71] hover:underline transition-colors"
              >
                Autofill Sample (KHUN Virakboth)
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  Merchant Company <span className="text-[#e74c3c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KHUN Virakboth"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  Merchant Outlet <span className="text-[#e74c3c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VB Coffee"
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  POS S/N <span className="text-[#e74c3c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WP555555Q55555"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  MID <span className="text-[rgba(240,240,242,0.4)] text-[10px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 55555555555"
                  value={mid}
                  onChange={(e) => setMid(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  TID <span className="text-[rgba(240,240,242,0.4)] text-[10px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 555555"
                  value={tid}
                  onChange={(e) => setTid(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  Merchant Business
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
                >
                  {BUSINESS_TYPES.map((bt) => (
                    <option key={bt} value={bt} className="bg-[#19191d] text-[#f0f0f2]">
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Phnom Penh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                />
              </div>
            </div>

            {/* Google Map Field */}
            <div>
              <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                🗺️ Google Map <span className="text-[rgba(240,240,242,0.4)] font-normal font-mono">(Link or Coordinates)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. https://maps.app.goo.gl/... or Phnom Penh"
                value={googleMap}
                onChange={(e) => setGoogleMap(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  👤 Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr.Vibol"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 012 5555 55"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[rgba(240,240,242,0.08)]" />

          {/* Section 2: Technical Integration & Staff Assignment */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-semibold text-[rgba(240,240,242,0.6)] uppercase tracking-wider">
              2. Integration Specs & Staff Assignment
            </h3>

            <div>
              <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1.5">
                Integration Type <span className="text-[#e74c3c]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['IP', 'Serial Port', 'Wireless'] as IntegrationType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIntegrationType(type)}
                    className={`py-2 px-3 text-xs font-mono rounded-lg border transition-all text-center ${
                      integrationType === type
                        ? 'border-[#2ecc71] bg-[#2ecc71]/10 text-[#2ecc71] font-semibold'
                        : 'border-[rgba(240,240,242,0.08)] bg-[#0f0f11] text-[rgba(240,240,242,0.5)] hover:border-[rgba(240,240,242,0.2)]'
                    }`}
                  >
                    {type === 'IP' && 'IP (LAN / Ethernet)'}
                    {type === 'Serial Port' && 'Serial Port (RS-232)'}
                    {type === 'Wireless' && 'Wireless (4G / WiFi)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  👨‍💼 Assigned Staff <span className="text-[#e74c3c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nget Monioudom"
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
                  Staff ID <span className="text-[#e74c3c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 222222"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[rgba(240,240,242,0.08)]" />

          {/* Section 3: POS Terminal UAT Loan */}
          <div className="space-y-3 bg-[#0f0f11] p-3.5 rounded-lg border border-[rgba(240,240,242,0.08)]">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPosTerminalUat}
                  onChange={(e) => setIsPosTerminalUat(e.target.checked)}
                  className="w-4 h-4 text-[#2ecc71] rounded border-[rgba(240,240,242,0.2)] focus:ring-[#2ecc71]"
                />
                <span className="text-xs font-semibold text-[#f0f0f2]">
                  Loan POS Terminal for UAT Testing
                </span>
              </label>
              {isPosTerminalUat && (
                <span className="text-[11px] font-mono text-[#f1c40f] bg-[#f1c40f]/10 border border-[#f1c40f]/30 px-2 py-0.5 rounded">
                  Status: Pending Return
                </span>
              )}
            </div>

            {isPosTerminalUat && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-[rgba(240,240,242,0.6)] mb-1">
                    Terminal Hardware Model
                  </label>
                  <input
                    type="text"
                    value={posModel}
                    onChange={(e) => setPosModel(e.target.value)}
                    placeholder="e.g. PAX A920 Pro SmartPOS"
                    className="w-full text-xs px-3 py-1.5 bg-[#19191d] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[rgba(240,240,242,0.6)] mb-1">
                    Expected UAT Return Date
                  </label>
                  <input
                    type="date"
                    value={uatExpectedReturnDate}
                    onChange={(e) => setUatExpectedReturnDate(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 bg-[#19191d] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] focus:outline-none focus:border-[#2ecc71] font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-[rgba(240,240,242,0.7)] mb-1">
              Initial Remarks / Integration Requirements
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Dual LAN IP configuration with Oracle Symphony POS till..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg text-[#f0f0f2] placeholder-[rgba(240,240,242,0.3)] focus:outline-none focus:border-[#2ecc71]"
            />
          </div>

          {/* Telegram Auto-Send Option */}
          <div className="flex items-center justify-between p-3 bg-[#0f0f11] border border-[rgba(240,240,242,0.08)] rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendTelegram}
                onChange={(e) => setSendTelegram(e.target.checked)}
                className="w-4 h-4 text-[#2ecc71] rounded border-[rgba(240,240,242,0.2)] focus:ring-[#2ecc71]"
              />
              <span className="text-xs font-medium text-[#f0f0f2] flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#2ecc71]" />
                Auto-notify Telegram group / username upon submission
              </span>
            </label>
            <span className="text-[11px] text-[rgba(240,240,242,0.4)] font-mono">
              {telegramConfig.chatIdOrUsername || 'Default Demo Group'}
            </span>
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
              {submitting ? (
                <span>Registering & Notifying...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit & Save Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
