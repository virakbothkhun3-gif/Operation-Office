import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Send, 
  FileSpreadsheet, 
  Eye, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { IntegrationType, MerchantRequest, RequestStatus, TelegramConfig } from '../types';
import { exportMerchantRequestsToExcel } from '../utils/excelExport';
import { formatNewRequestTelegramMessage, sendTelegramMessage } from '../utils/telegram';
import { appendTelegramLog } from '../utils/storage';

interface DashboardProps {
  requests: MerchantRequest[];
  onOpenNewRequest: () => void;
  onOpenStatusUpdate: (request: MerchantRequest) => void;
  onOpenDetail: (request: MerchantRequest) => void;
  onOpenUatView: () => void;
  telegramConfig: TelegramConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({
  requests,
  onOpenNewRequest,
  onOpenStatusUpdate,
  onOpenDetail,
  onOpenUatView,
  telegramConfig,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [integrationFilter, setIntegrationFilter] = useState<string>('all');
  const [uatFilterOnly, setUatFilterOnly] = useState<boolean>(false);

  // Stats calculation
  const totalRequests = requests.length;
  const inProgressRequests = requests.filter((r) => ['In Progress', 'Testing'].includes(r.status)).length;
  const completedRequests = requests.filter((r) => r.status === 'Completed').length;
  const posTerminalUatPendingReturn = requests.filter(
    (r) => r.isPosTerminalUat && r.posTerminalUatStatus === 'Pending Return'
  ).length;

  // Filter logic
  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) {
      return false;
    }
    if (integrationFilter !== 'all' && req.integrationType !== integrationFilter) {
      return false;
    }
    if (uatFilterOnly && (!req.isPosTerminalUat || req.posTerminalUatStatus !== 'Pending Return')) {
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
      req.businessType.toLowerCase().includes(q)
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
    const msg = formatNewRequestTelegramMessage(req);
    const res = await sendTelegramMessage(
      telegramConfig,
      msg,
      'Manual Resend',
      `Manual Telegram dispatch: ${req.merchantName} (${req.id})`
    );
    appendTelegramLog(res.log);
    alert(res.success ? 'Message sent to Telegram successfully!' : `Telegram notification result: ${res.error || 'Simulated in demo log'}`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Row - 4 KPI Blocks (Variation 3) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Intake */}
        <div className="bg-[#19191d] border border-[rgba(240,240,242,0.08)] p-6 rounded-xl shadow-xs">
          <label className="font-mono text-[0.65rem] uppercase tracking-wider text-[rgba(240,240,242,0.5)] block mb-2">
            Total Intake
          </label>
          <div className="text-3xl font-mono font-semibold text-[#f0f0f2] tabular-nums">
            {totalRequests < 10 ? `0${totalRequests}` : totalRequests}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-[#19191d] border border-[rgba(240,240,242,0.08)] p-6 rounded-xl shadow-xs">
          <label className="font-mono text-[0.65rem] uppercase tracking-wider text-[rgba(240,240,242,0.5)] block mb-2">
            In Progress
          </label>
          <div className="text-3xl font-mono font-semibold text-[#3498db] tabular-nums">
            {inProgressRequests < 10 ? `0${inProgressRequests}` : inProgressRequests}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-[#19191d] border border-[rgba(240,240,242,0.08)] p-6 rounded-xl shadow-xs">
          <label className="font-mono text-[0.65rem] uppercase tracking-wider text-[rgba(240,240,242,0.5)] block mb-2">
            Completed
          </label>
          <div className="text-3xl font-mono font-semibold text-[#2ecc71] tabular-nums">
            {completedRequests < 10 ? `0${completedRequests}` : completedRequests}
          </div>
        </div>

        {/* UAT Pending */}
        <div 
          onClick={onOpenUatView}
          className="bg-[#19191d] border border-[#f1c40f]/60 p-6 rounded-xl shadow-xs cursor-pointer hover:border-[#f1c40f] transition-all group"
        >
          <label className="font-mono text-[0.65rem] uppercase tracking-wider text-[#f1c40f] block mb-2 flex items-center justify-between">
            <span>UAT Pending</span>
            <span className="text-[10px] lowercase text-[#f1c40f]/70 group-hover:underline">view &rarr;</span>
          </label>
          <div className="text-3xl font-mono font-semibold text-[#f1c40f] tabular-nums">
            {posTerminalUatPendingReturn < 10 ? `0${posTerminalUatPendingReturn}` : posTerminalUatPendingReturn}
          </div>
        </div>
      </div>

      {/* Grid Layout: 3fr (Data Section) + 1fr (Right Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main List Section (3 cols on large screens) */}
        <div className="lg:col-span-3 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl overflow-hidden shadow-xs">
          {/* Data Header with Search, Filter & Actions */}
          <div className="p-4 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(240,240,242,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Wrap */}
            <div className="bg-[#0f0f11] border border-[rgba(240,240,242,0.08)] rounded-md px-3 py-1.5 flex items-center gap-2 w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-[rgba(240,240,242,0.4)] shrink-0" />
              <input
                type="text"
                placeholder="Filter requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-[#f0f0f2] text-xs outline-none w-full placeholder-[rgba(240,240,242,0.3)]"
              />
            </div>

            {/* Quick Status Filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['all', 'New', 'In Progress', 'Testing', 'Completed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase transition-colors ${
                    statusFilter === st
                      ? 'bg-white/10 text-[#2ecc71] font-semibold border border-[#2ecc71]/40'
                      : 'text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {st === 'all' ? 'All' : st}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => exportMerchantRequestsToExcel(filteredRequests)}
                className="btn-action-secondary text-xs flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#2ecc71]" />
                <span>Export XLSX</span>
              </button>
              <button
                type="button"
                onClick={onOpenNewRequest}
                className="btn-action-primary text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Insert New</span>
              </button>
            </div>
          </div>

          {/* List Table (Variation 3 List Table) */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="border-b border-[rgba(240,240,242,0.08)] text-[0.7rem] uppercase font-mono text-[rgba(240,240,242,0.5)]">
                  <th className="py-3 px-5">Merchant</th>
                  <th className="py-3 px-5">ID Specs</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Assigned</th>
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
                      {/* Merchant */}
                      <td className="py-3 px-5">
                        <div 
                          onClick={() => onOpenDetail(req)}
                          className="font-bold text-[#f0f0f2] hover:text-[#2ecc71] transition-colors cursor-pointer"
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
                              className="text-[#2ecc71] hover:underline"
                              onClick={(e) => e.stopPropagation()}
                              title="Open Google Map Location"
                            >
                              <MapPin className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* ID Specs */}
                      <td className="py-3 px-5 font-mono text-[0.75rem] text-[rgba(240,240,242,0.7)]">
                        <div>MID {req.mid}</div>
                        <div className="text-[rgba(240,240,242,0.4)] text-[11px]">TID {req.tid}</div>
                        <div className="text-[rgba(240,240,242,0.3)] text-[10px]">SN: {req.serialNumber}</div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-5">
                        <span className="terminal-chip">
                          {req.integrationType.toUpperCase()}
                        </span>
                      </td>

                      {/* Assigned */}
                      <td className="py-3 px-5 text-[rgba(240,240,242,0.8)]">
                        <div>{req.assignedStaff}</div>
                        <div className="font-mono text-[11px] text-[rgba(240,240,242,0.4)]">ID: {req.staffId}</div>
                      </td>

                      {/* Status Dot */}
                      <td className="py-3 px-5">
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
                      <td className="py-3 px-5 font-mono text-[0.75rem] text-[rgba(240,240,242,0.5)]">
                        {new Date(req.updatedAt).toLocaleDateString([], { month: 'short', day: '2-digit' }).toUpperCase()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            title="Update Status"
                            onClick={() => onOpenStatusUpdate(req)}
                            className="p-1.5 text-[rgba(240,240,242,0.6)] hover:text-[#2ecc71] hover:bg-white/5 rounded transition-colors"
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

          {/* Table Footer */}
          <div className="px-5 py-3 bg-[rgba(255,255,255,0.01)] border-t border-[rgba(240,240,242,0.08)] flex items-center justify-between text-[11px] font-mono text-[rgba(240,240,242,0.5)]">
            <span>
              TOTAL DISPLAYED: <strong className="text-[#f0f0f2]">{filteredRequests.length}</strong> OF {totalRequests}
            </span>
            <span>SYSTEM AUDIT: ENCRYPTED · INTEGRATION VERIFIED</span>
          </div>
        </div>

        {/* Right Pane (1 col on large screens) */}
        <div className="right-pane flex flex-col gap-4">
          {/* Pane Box 1: Operational Health */}
          <div className="bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl p-5 shadow-xs">
            <h3 className="text-[0.75rem] uppercase font-mono text-[rgba(240,240,242,0.5)] mb-3 tracking-wider flex items-center justify-between">
              <span>Operational Health</span>
              <span className="w-2 h-2 rounded-full bg-[#2ecc71]" />
            </h3>
            
            <div className="space-y-1 divide-y divide-[rgba(240,240,242,0.06)]">
              <div className="flex justify-between py-2 text-xs">
                <span className="text-[rgba(240,240,242,0.7)]">In Progress</span>
                <span className="font-mono font-semibold text-[#3498db]">
                  {inProgressRequests < 10 ? `0${inProgressRequests}` : inProgressRequests}
                </span>
              </div>
              <div className="flex justify-between py-2 text-xs">
                <span className="text-[rgba(240,240,242,0.7)]">Return Due</span>
                <span className="font-mono font-semibold text-[#f1c40f]">
                  {posTerminalUatPendingReturn < 10 ? `0${posTerminalUatPendingReturn}` : posTerminalUatPendingReturn}
                </span>
              </div>
              <div className="flex justify-between py-2 text-xs">
                <span className="text-[rgba(240,240,242,0.7)]">Completed</span>
                <span className="font-mono font-semibold text-[#2ecc71]">
                  {completedRequests < 10 ? `0${completedRequests}` : completedRequests}
                </span>
              </div>
              <div className="flex justify-between py-2 text-xs">
                <span className="text-[rgba(240,240,242,0.7)]">Total Requests</span>
                <span className="font-mono font-semibold text-[#f0f0f2]">
                  {totalRequests < 10 ? `0${totalRequests}` : totalRequests}
                </span>
              </div>
            </div>
          </div>

          {/* Pane Box 2: Quick Action (Dashed Border Box) */}
          <div className="bg-transparent border border-dashed border-[rgba(240,240,242,0.2)] rounded-xl p-5">
            <h3 className="text-[0.75rem] uppercase font-mono text-[rgba(240,240,242,0.5)] mb-2 tracking-wider">
              Quick Action
            </h3>
            <p className="text-xs text-[rgba(240,240,242,0.5)] mb-4 leading-relaxed">
              Export the current integration queue to an Excel spreadsheet for management review.
            </p>
            <button
              type="button"
              onClick={() => exportMerchantRequestsToExcel(requests)}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#27272d] hover:bg-[#313138] text-[#f0f0f2] transition-colors border border-[rgba(240,240,242,0.08)] flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#2ecc71]" />
              <span>Run Export</span>
            </button>
          </div>

          {/* Pane Box 3: Telegram Dispatch Hub Preview */}
          <div className="bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[0.75rem] uppercase font-mono text-[rgba(240,240,242,0.5)] tracking-wider">
                Telegram Relay
              </h3>
              <span className="text-[10px] font-mono text-[#2ecc71]">
                {telegramConfig.chatIdOrUsername ? 'LINKED' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-[rgba(240,240,242,0.5)] mb-3">
              Channel: <span className="font-mono text-[#f0f0f2]">{telegramConfig.chatIdOrUsername || '-5531389049'}</span>
            </p>
            <button
              type="button"
              onClick={onOpenNewRequest}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#2ecc71]/10 text-[#2ecc71] hover:bg-[#2ecc71]/20 border border-[#2ecc71]/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Intake Queue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
