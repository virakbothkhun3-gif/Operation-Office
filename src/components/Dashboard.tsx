import React, { useState } from 'react';
import { 
  Search, 
  RefreshCw, 
  Send, 
  FileSpreadsheet, 
  Eye, 
  MapPin, 
  Upload,
  X,
  Smartphone,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { IntegrationType, MerchantRequest, RequestStatus, TelegramConfig } from '../types';
import { exportMerchantRequestsToExcel } from '../utils/excelExport';
import { formatNewRequestTelegramMessage, sendTelegramMessage } from '../utils/telegram';
import { appendTelegramLog } from '../utils/storage';

interface DashboardProps {
  requests: MerchantRequest[];
  onOpenNewRequest: () => void;
  onOpenImportData: () => void;
  onOpenStatusUpdate: (request: MerchantRequest) => void;
  onOpenDetail: (request: MerchantRequest) => void;
  onOpenUatView: () => void;
  telegramConfig: TelegramConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({
  requests,
  onOpenNewRequest,
  onOpenImportData,
  onOpenStatusUpdate,
  onOpenDetail,
  onOpenUatView,
  telegramConfig,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [integrationFilter, setIntegrationFilter] = useState<string>('all');
  const [uatOnlyFilter, setUatOnlyFilter] = useState<boolean>(false);

  // Stats calculation
  const totalRequests = requests.length;
  const newRequestsCount = requests.filter((r) => r.status === 'New').length;
  const inProgressRequests = requests.filter((r) => r.status === 'In Progress').length;
  const testingRequests = requests.filter((r) => r.status === 'Testing').length;
  const completedRequests = requests.filter((r) => r.status === 'Completed').length;
  const posTerminalUatPendingReturn = requests.filter(
    (r) => r.isPosTerminalUat && r.posTerminalUatStatus === 'Pending Return'
  ).length;

  // Filter logic
  const filteredRequests = requests.filter((req) => {
    if (uatOnlyFilter && (!req.isPosTerminalUat || req.posTerminalUatStatus !== 'Pending Return')) {
      return false;
    }
    if (statusFilter !== 'all' && req.status !== statusFilter) {
      return false;
    }
    if (integrationFilter !== 'all' && req.integrationType !== integrationFilter) {
      return false;
    }

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      req.merchantName.toLowerCase().includes(q) ||
      req.outletName.toLowerCase().includes(q) ||
      req.serialNumber.toLowerCase().includes(q) ||
      req.mid.toLowerCase().includes(q) ||
      req.tid.toLowerCase().includes(q) ||
      req.assignedStaff.toLowerCase().includes(q) ||
      req.staffId.toLowerCase().includes(q) ||
      req.businessType.toLowerCase().includes(q) ||
      (req.contactPerson && req.contactPerson.toLowerCase().includes(q))
    );
  });

  const getStatusDotColor = (status: RequestStatus) => {
    switch (status) {
      case 'New':
        return '#3498db'; // Electric blue
      case 'Pending':
        return '#f39c12'; // Amber
      case 'In Progress':
        return '#f1c40f'; // Yellow working
      case 'Testing':
        return '#9b59b6'; // Purple
      case 'Completed':
        return '#2ecc71'; // Green accent
      case 'Rejected / Cancelled':
        return '#e74c3c'; // Rose red
      default:
        return 'rgba(240, 240, 242, 0.4)';
    }
  };

  const handleQuickTelegram = async (req: MerchantRequest) => {
    const targetConfig = {
      ...telegramConfig,
      chatIdOrUsername: req.telegramGroup || telegramConfig.chatIdOrUsername,
    };
    const msg = formatNewRequestTelegramMessage(req);
    const res = await sendTelegramMessage(
      targetConfig,
      msg,
      'Manual Resend',
      `Manual Telegram dispatch: ${req.merchantName} (${req.id})`
    );
    appendTelegramLog(res.log);
    alert(res.success ? `Message dispatched to Telegram (${targetConfig.chatIdOrUsername || 'default group'}) successfully!` : `Telegram notification result: ${res.error || 'Simulated in demo log'}`);
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setIntegrationFilter('all');
    setUatOnlyFilter(false);
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || integrationFilter !== 'all' || uatOnlyFilter;

  return (
    <div className="space-y-6">
      {/* 4 Interactive KPI Blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Intake */}
        <div 
          onClick={() => {
            setStatusFilter('all');
            setUatOnlyFilter(false);
          }}
          className={`bg-[#19191d] border p-4 sm:p-5 rounded-xl shadow-xs cursor-pointer transition-all ${
            statusFilter === 'all' && !uatOnlyFilter
              ? 'border-[#2ecc71]/60 bg-[#2ecc71]/5 ring-1 ring-[#2ecc71]/30'
              : 'border-[rgba(240,240,242,0.08)] hover:border-[rgba(240,240,242,0.2)]'
          }`}
          title="Click to view all requests"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[rgba(240,240,242,0.5)]">
              Total Intake
            </span>
            <span className="text-[10px] font-mono text-[rgba(240,240,242,0.4)]">ALL</span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#f0f0f2] tabular-nums">
            {totalRequests < 10 ? `0${totalRequests}` : totalRequests}
          </div>
        </div>

        {/* In Progress */}
        <div 
          onClick={() => {
            setStatusFilter('In Progress');
            setUatOnlyFilter(false);
          }}
          className={`bg-[#19191d] border p-4 sm:p-5 rounded-xl shadow-xs cursor-pointer transition-all ${
            statusFilter === 'In Progress' && !uatOnlyFilter
              ? 'border-[#3498db]/60 bg-[#3498db]/5 ring-1 ring-[#3498db]/30'
              : 'border-[rgba(240,240,242,0.08)] hover:border-[#3498db]/40'
          }`}
          title="Click to filter In Progress requests"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#3498db]">
              In Progress
            </span>
            <span className="text-[10px] font-mono text-[#3498db]/70">WORKING</span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#3498db] tabular-nums">
            {inProgressRequests < 10 ? `0${inProgressRequests}` : inProgressRequests}
          </div>
        </div>

        {/* Completed */}
        <div 
          onClick={() => {
            setStatusFilter('Completed');
            setUatOnlyFilter(false);
          }}
          className={`bg-[#19191d] border p-4 sm:p-5 rounded-xl shadow-xs cursor-pointer transition-all ${
            statusFilter === 'Completed' && !uatOnlyFilter
              ? 'border-[#2ecc71]/60 bg-[#2ecc71]/5 ring-1 ring-[#2ecc71]/30'
              : 'border-[rgba(240,240,242,0.08)] hover:border-[#2ecc71]/40'
          }`}
          title="Click to filter Completed requests"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#2ecc71]">
              Completed
            </span>
            <span className="text-[10px] font-mono text-[#2ecc71]/70">READY</span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#2ecc71] tabular-nums">
            {completedRequests < 10 ? `0${completedRequests}` : completedRequests}
          </div>
        </div>

        {/* UAT Pending */}
        <div 
          onClick={onOpenUatView}
          className="bg-[#19191d] border border-[#f1c40f]/50 hover:border-[#f1c40f] p-4 sm:p-5 rounded-xl shadow-xs cursor-pointer transition-all group"
          title="Click to open POS Terminal UAT Tracker"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[#f1c40f]">
              UAT Pending
            </span>
            <span className="text-[10px] font-mono text-[#f1c40f]/80 group-hover:underline">
              tracker &rarr;
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#f1c40f] tabular-nums">
            {posTerminalUatPendingReturn < 10 ? `0${posTerminalUatPendingReturn}` : posTerminalUatPendingReturn}
          </div>
        </div>
      </div>

      {/* Main Request Registry Table & Controls (Full Width, Zero Duplicate Panels) */}
      <div className="bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl overflow-hidden shadow-xs">
        {/* Streamlined Filter Toolbar */}
        <div className="p-3.5 sm:p-4 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(240,240,242,0.08)] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Search input & Interface Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            {/* Search Box */}
            <div className="relative bg-[#0f0f11] border border-[rgba(240,240,242,0.1)] rounded-lg px-3 py-1.5 flex items-center gap-2 w-full sm:w-64 focus-within:border-[#2ecc71] transition-colors">
              <Search className="w-3.5 h-3.5 text-[rgba(240,240,242,0.4)] shrink-0" />
              <input
                type="text"
                placeholder="Search merchant, MID, TID, serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-[#f0f0f2] text-xs outline-none w-full placeholder-[rgba(240,240,242,0.3)]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-[rgba(240,240,242,0.4)] hover:text-white p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Interface Type Filter Dropdown */}
            <select
              value={integrationFilter}
              onChange={(e) => setIntegrationFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(240,240,242,0.1)] bg-[#0f0f11] text-[#f0f0f2] font-mono focus:outline-none focus:border-[#2ecc71] cursor-pointer"
              title="Filter by Integration Type"
            >
              <option value="all">All Integration Types</option>
              <option value="IP">IP (LAN / Ethernet)</option>
              <option value="Serial Port">Serial Port (RS-232)</option>
              <option value="Wireless">Wireless (4G / WiFi)</option>
            </select>
          </div>

          {/* Center / Right: Status Filters & Data Action Buttons */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 text-xs">
            {/* Status Pills with Dynamic Counts */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setUatOnlyFilter(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  statusFilter === 'all' && !uatOnlyFilter
                    ? 'bg-white/10 text-[#2ecc71] font-semibold border border-[#2ecc71]/40'
                    : 'text-[rgba(240,240,242,0.6)] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                All ({totalRequests})
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('New');
                  setUatOnlyFilter(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  statusFilter === 'New' && !uatOnlyFilter
                    ? 'bg-white/10 text-[#3498db] font-semibold border border-[#3498db]/40'
                    : 'text-[rgba(240,240,242,0.6)] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                New ({newRequestsCount})
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('In Progress');
                  setUatOnlyFilter(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  statusFilter === 'In Progress' && !uatOnlyFilter
                    ? 'bg-white/10 text-[#f1c40f] font-semibold border border-[#f1c40f]/40'
                    : 'text-[rgba(240,240,242,0.6)] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                Working ({inProgressRequests})
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Testing');
                  setUatOnlyFilter(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  statusFilter === 'Testing' && !uatOnlyFilter
                    ? 'bg-white/10 text-[#9b59b6] font-semibold border border-[#9b59b6]/40'
                    : 'text-[rgba(240,240,242,0.6)] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                Testing ({testingRequests})
              </button>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Completed');
                  setUatOnlyFilter(false);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  statusFilter === 'Completed' && !uatOnlyFilter
                    ? 'bg-white/10 text-[#2ecc71] font-semibold border border-[#2ecc71]/40'
                    : 'text-[rgba(240,240,242,0.6)] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                Done ({completedRequests})
              </button>

              <button
                type="button"
                onClick={() => setUatOnlyFilter((prev) => !prev)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors flex items-center gap-1 ${
                  uatOnlyFilter
                    ? 'bg-[#f1c40f]/20 text-[#f1c40f] font-semibold border border-[#f1c40f]'
                    : 'text-[rgba(240,240,242,0.6)] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title="Filter records with loaned test terminals pending return"
              >
                <Smartphone className="w-3 h-3 text-[#f1c40f]" />
                <span>UAT ({posTerminalUatPendingReturn})</span>
              </button>
            </div>

            {/* Import & Export Tools */}
            <div className="flex items-center gap-1.5 ml-auto lg:ml-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-2 py-1 text-[11px] font-mono text-[rgba(240,240,242,0.5)] hover:text-white hover:underline transition-colors"
                  title="Reset all search & filter options"
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={onOpenImportData}
                className="btn-action-secondary text-xs flex items-center gap-1.5 py-1.5 px-2.5"
                title="Import existing data file (.xlsx, .xls, .csv, .json)"
              >
                <Upload className="w-3.5 h-3.5 text-[#2ecc71]" />
                <span className="hidden sm:inline">Import</span>
              </button>

              <button
                type="button"
                onClick={() => exportMerchantRequestsToExcel(filteredRequests)}
                className="btn-action-secondary text-xs flex items-center gap-1.5 py-1.5 px-2.5"
                title="Download filtered list as Excel spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#2ecc71]" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View: Clean Vertical Cards (Smooth up/down scrolling, zero side-scrolling required) */}
        <div className="block md:hidden divide-y divide-[rgba(240,240,242,0.06)]">
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-[rgba(240,240,242,0.4)] font-mono text-xs px-4">
              No merchant integration requests match filter criteria.
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div 
                key={req.id}
                className="p-4 space-y-3 hover:bg-white/[0.02] transition-colors"
              >
                {/* Header: ID, Merchant Company, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#2ecc71] bg-[#2ecc71]/10 px-1.5 py-0.5 rounded border border-[#2ecc71]/20">
                        {req.id}
                      </span>
                      <span className="terminal-chip text-[10px]">
                        {req.integrationType.toUpperCase()}
                      </span>
                    </div>

                    <h4 
                      onClick={() => onOpenDetail(req)}
                      className="font-bold text-sm text-[#f0f0f2] hover:text-[#2ecc71] cursor-pointer mt-1 break-words leading-tight"
                    >
                      {req.merchantName}
                    </h4>

                    <div className="text-[11px] text-[rgba(240,240,242,0.6)] flex items-center gap-1.5 mt-0.5">
                      <span>{req.outletName}</span>
                      {req.googleMap && (
                        <a
                          href={req.googleMap.startsWith('http') ? req.googleMap : `https://maps.google.com/?q=${encodeURIComponent(req.googleMap)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2ecc71] hover:underline inline-flex items-center gap-0.5"
                          onClick={(e) => e.stopPropagation()}
                          title="Open Google Map"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Map</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <div className="status-dot">
                      <span 
                        className="dot" 
                        style={{ backgroundColor: getStatusDotColor(req.status) }} 
                      />
                      <span className="font-medium text-xs">{req.status}</span>
                    </div>
                    {req.isPosTerminalUat && req.posTerminalUatStatus === 'Pending Return' && (
                      <span className="text-[10px] font-mono text-[#f1c40f] bg-[#f1c40f]/10 px-1.5 py-0.5 rounded border border-[#f1c40f]/20">
                        UAT Return Due
                      </span>
                    )}
                  </div>
                </div>

                {/* Key specs grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#0f0f11] border border-[rgba(240,240,242,0.06)] font-mono text-[11px]">
                  <div>
                    <span className="text-[rgba(240,240,242,0.4)] block text-[10px]">MID / TID:</span>
                    <span className="text-[#f0f0f2] font-semibold">{req.mid || '-'} / {req.tid || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[rgba(240,240,242,0.4)] block text-[10px]">POS S/N:</span>
                    <span className="text-[#2ecc71] font-semibold break-all">{req.serialNumber}</span>
                  </div>
                  <div>
                    <span className="text-[rgba(240,240,242,0.4)] block text-[10px]">Contact Person:</span>
                    <span className="text-[#f0f0f2]">{req.contactPerson || '-'} {req.phoneNumber ? `(${req.phoneNumber})` : ''}</span>
                  </div>
                  <div>
                    <span className="text-[rgba(240,240,242,0.4)] block text-[10px]">Assigned Staff:</span>
                    <span className="text-[#f0f0f2]">{req.assignedStaff} (ID: {req.staffId})</span>
                  </div>
                </div>

                {/* Telegram Group & Remarks */}
                {(req.remarks || req.telegramGroup) && (
                  <div className="text-[11px] space-y-1 font-mono">
                    {req.telegramGroup && (
                      <div className="text-[#2ecc71] flex items-center gap-1 text-[10px]">
                        <span>Telegram:</span>
                        <strong className="underline">{req.telegramGroup}</strong>
                      </div>
                    )}
                    {req.remarks && (
                      <p className="text-[rgba(240,240,242,0.6)] line-clamp-2 text-[10px] font-sans pl-2 border-l border-[rgba(240,240,242,0.15)]">
                        {req.remarks}
                      </p>
                    )}
                  </div>
                )}

                {/* Mobile Actions Toolbar */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-mono text-[10px] text-[rgba(240,240,242,0.4)]">
                    Updated {new Date(req.updatedAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenStatusUpdate(req)}
                      className="px-2.5 py-1 text-[11px] font-mono rounded bg-white/5 hover:bg-white/10 text-[#f0f0f2] border border-[rgba(240,240,242,0.1)] flex items-center gap-1"
                      title="Update Status"
                    >
                      <RefreshCw className="w-3 h-3 text-[#3498db]" />
                      <span>Status</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickTelegram(req)}
                      className="px-2.5 py-1 text-[11px] font-mono rounded bg-white/5 hover:bg-white/10 text-[#2ecc71] border border-[#2ecc71]/30 flex items-center gap-1"
                      title="Send Telegram"
                    >
                      <Send className="w-3 h-3" />
                      <span>Notify</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDetail(req)}
                      className="px-2.5 py-1 text-[11px] font-mono rounded bg-[#2ecc71] text-black font-semibold flex items-center gap-1"
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full-Width High-Density Data Grid */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="border-b border-[rgba(240,240,242,0.08)] text-[0.7rem] uppercase font-mono text-[rgba(240,240,242,0.5)] bg-[rgba(255,255,255,0.01)]">
                <th className="py-3 px-5">Merchant & Outlet</th>
                <th className="py-3 px-5">POS Hardware & Spec</th>
                <th className="py-3 px-5">Integration Type</th>
                <th className="py-3 px-5">Assigned Staff</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Updated</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(240,240,242,0.04)]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[rgba(240,240,242,0.4)] font-mono text-xs">
                    No merchant integration requests match filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr 
                    key={req.id} 
                    className="hover:bg-white/[0.015] transition-colors group cursor-default"
                  >
                    {/* Merchant & Outlet */}
                    <td className="py-3.5 px-5">
                      <div 
                        onClick={() => onOpenDetail(req)}
                        className="font-bold text-[#f0f0f2] hover:text-[#2ecc71] transition-colors cursor-pointer text-[13px]"
                      >
                        {req.merchantName}
                      </div>
                      <div className="text-[rgba(240,240,242,0.5)] text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span>{req.outletName}</span>
                        {req.googleMap && (
                          <a
                            href={req.googleMap.startsWith('http') ? req.googleMap : `https://maps.google.com/?q=${encodeURIComponent(req.googleMap)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2ecc71] hover:underline inline-flex items-center gap-0.5 font-mono text-[10px]"
                            onClick={(e) => e.stopPropagation()}
                            title="Open Google Map Location"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Map</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Hardware Specs: S/N, MID, TID, Telegram */}
                    <td className="py-3.5 px-5 font-mono text-[0.75rem] text-[rgba(240,240,242,0.7)]">
                      <div className="text-[#f0f0f2] font-semibold">SN: {req.serialNumber}</div>
                      <div className="text-[rgba(240,240,242,0.4)] text-[11px]">
                        MID {req.mid || '-'} · TID {req.tid || '-'}
                      </div>
                      {req.telegramGroup && (
                        <div className="text-[#2ecc71] text-[10px] truncate max-w-[160px] mt-0.5" title={`Telegram Group: ${req.telegramGroup}`}>
                          TG: {req.telegramGroup}
                        </div>
                      )}
                    </td>

                    {/* Interface */}
                    <td className="py-3.5 px-5">
                      <span className="terminal-chip">
                        {req.integrationType.toUpperCase()}
                      </span>
                    </td>

                    {/* Assigned */}
                    <td className="py-3.5 px-5 text-[rgba(240,240,242,0.8)]">
                      <div>{req.assignedStaff}</div>
                      <div className="font-mono text-[11px] text-[rgba(240,240,242,0.4)]">ID: {req.staffId}</div>
                    </td>

                    {/* Status Dot */}
                    <td className="py-3.5 px-5">
                      <div className="status-dot">
                        <span 
                          className="dot" 
                          style={{ backgroundColor: getStatusDotColor(req.status) }} 
                        />
                        <span className="font-medium">{req.status}</span>
                      </div>
                      {req.isPosTerminalUat && req.posTerminalUatStatus === 'Pending Return' && (
                        <div className="text-[10px] font-mono text-[#f1c40f] mt-1">
                          UAT Return Due
                        </div>
                      )}
                    </td>

                    {/* Updated */}
                    <td className="py-3.5 px-5 font-mono text-[0.75rem] text-[rgba(240,240,242,0.5)]">
                      {new Date(req.updatedAt).toLocaleDateString([], { month: 'short', day: '2-digit' }).toUpperCase()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          title="Update Status"
                          onClick={() => onOpenStatusUpdate(req)}
                          className="p-1.5 text-[rgba(240,240,242,0.6)] hover:text-[#3498db] hover:bg-white/5 rounded transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Send to Telegram"
                          onClick={() => handleQuickTelegram(req)}
                          className="p-1.5 text-[rgba(240,240,242,0.6)] hover:text-[#2ecc71] hover:bg-white/5 rounded transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="View Full Details"
                          onClick={() => onOpenDetail(req)}
                          className="p-1.5 text-[rgba(240,240,242,0.6)] hover:text-[#f0f0f2] hover:bg-white/5 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Table Status Footer */}
        <div className="px-5 py-3 bg-[rgba(255,255,255,0.01)] border-t border-[rgba(240,240,242,0.08)] flex items-center justify-between text-[11px] font-mono text-[rgba(240,240,242,0.5)]">
          <span>
            SHOWING <strong className="text-[#f0f0f2]">{filteredRequests.length}</strong> OF {totalRequests} RECORDS
          </span>
          <span className="hidden sm:inline">ALL STATUS TRANSITIONS AUDITED</span>
        </div>
      </div>
    </div>
  );
};
