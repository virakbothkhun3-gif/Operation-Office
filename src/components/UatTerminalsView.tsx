import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, FileSpreadsheet, RefreshCw, Search } from 'lucide-react';
import { MerchantRequest } from '../types';
import { exportUatTerminalsToExcel } from '../utils/excelExport';

interface UatTerminalsViewProps {
  requests: MerchantRequest[];
  onOpenStatusUpdate: (request: MerchantRequest) => void;
  onOpenDetail: (request: MerchantRequest) => void;
}

export const UatTerminalsView: React.FC<UatTerminalsViewProps> = ({
  requests,
  onOpenStatusUpdate,
  onOpenDetail,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'returned'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const uatRequests = requests.filter((r) => r.isPosTerminalUat);

  const totalLoaned = uatRequests.length;
  const pendingReturnCount = uatRequests.filter((r) => r.posTerminalUatStatus === 'Pending Return').length;
  const returnedCount = uatRequests.filter((r) => r.posTerminalUatStatus === 'Returned').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = uatRequests.filter(
    (r) => r.posTerminalUatStatus === 'Pending Return' && r.uatExpectedReturnDate && r.uatExpectedReturnDate < todayStr
  ).length;

  const filtered = uatRequests.filter((r) => {
    if (filter === 'pending' && r.posTerminalUatStatus !== 'Pending Return') return false;
    if (filter === 'returned' && r.posTerminalUatStatus !== 'Returned') return false;

    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.merchantName.toLowerCase().includes(q) ||
      r.outletName.toLowerCase().includes(q) ||
      r.serialNumber.toLowerCase().includes(q) ||
      r.mid.toLowerCase().includes(q) ||
      r.tid.toLowerCase().includes(q) ||
      r.assignedStaff.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(240,240,242,0.08)]">
        <div>
          <h1 className="font-display text-xl uppercase tracking-[0.05em] text-[#f0f0f2]">
            POS Terminal UAT Return Tracker
          </h1>
          <p className="text-xs font-mono text-[rgba(240,240,242,0.5)] mt-1">
            Hardware lifecycle & test terminal clearance console
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportUatTerminalsToExcel(requests)}
          className="btn-action-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-[#2ecc71]" />
          <span>Export UAT Excel</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl shadow-xs">
          <label className="font-mono text-[0.65rem] uppercase text-[rgba(240,240,242,0.5)] block mb-1">
            Total UAT Units
          </label>
          <div className="text-3xl font-mono font-semibold text-[#f0f0f2] tabular-nums">
            {totalLoaned < 10 ? `0${totalLoaned}` : totalLoaned}
          </div>
          <div className="text-[10px] font-mono text-[rgba(240,240,242,0.4)] mt-1">Loaned test hardware</div>
        </div>

        <div className="p-5 bg-[#19191d] border border-[#f1c40f]/50 rounded-xl shadow-xs">
          <label className="font-mono text-[0.65rem] uppercase text-[#f1c40f] block mb-1">
            Pending Return
          </label>
          <div className="text-3xl font-mono font-semibold text-[#f1c40f] tabular-nums">
            {pendingReturnCount < 10 ? `0${pendingReturnCount}` : pendingReturnCount}
          </div>
          <div className="text-[10px] font-mono text-[#f1c40f]/70 mt-1">In merchant possession</div>
        </div>

        <div className="p-5 bg-[#19191d] border border-[#e74c3c]/50 rounded-xl shadow-xs">
          <label className="font-mono text-[0.65rem] uppercase text-[#e74c3c] block mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Overdue Returns</span>
          </label>
          <div className="text-3xl font-mono font-semibold text-[#e74c3c] tabular-nums">
            {overdueCount < 10 ? `0${overdueCount}` : overdueCount}
          </div>
          <div className="text-[10px] font-mono text-[#e74c3c]/70 mt-1">Exceeded return date</div>
        </div>

        <div className="p-5 bg-[#19191d] border border-[#2ecc71]/50 rounded-xl shadow-xs">
          <label className="font-mono text-[0.65rem] uppercase text-[#2ecc71] block mb-1">
            Returned & Cleared
          </label>
          <div className="text-3xl font-mono font-semibold text-[#2ecc71] tabular-nums">
            {returnedCount < 10 ? `0${returnedCount}` : returnedCount}
          </div>
          <div className="text-[10px] font-mono text-[#2ecc71]/70 mt-1">Restocked in lab</div>
        </div>
      </div>

      {/* Controls: Search & Segmented Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-lg w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              filter === 'pending'
                ? 'bg-white/10 text-[#f1c40f] font-semibold border border-[#f1c40f]/40'
                : 'text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2]'
            }`}
          >
            PENDING RETURN ({pendingReturnCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              filter === 'all'
                ? 'bg-white/10 text-[#2ecc71] font-semibold border border-[#2ecc71]/40'
                : 'text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2]'
            }`}
          >
            ALL HARDWARE ({totalLoaned})
          </button>
          <button
            type="button"
            onClick={() => setFilter('returned')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              filter === 'returned'
                ? 'bg-white/10 text-[#2ecc71] font-semibold border border-[#2ecc71]/40'
                : 'text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2]'
            }`}
          >
            RETURNED ({returnedCount})
          </button>
        </div>

        <div className="bg-[#0f0f11] border border-[rgba(240,240,242,0.08)] rounded-md px-3 py-1.5 flex items-center gap-2 w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[rgba(240,240,242,0.4)] shrink-0" />
          <input
            type="text"
            placeholder="Search S/N, MID, Merchant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-[#f0f0f2] text-xs outline-none w-full placeholder-[rgba(240,240,242,0.3)]"
          />
        </div>
      </div>

      {/* UAT List Table */}
      <div className="bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[rgba(240,240,242,0.08)] text-[0.7rem] uppercase font-mono text-[rgba(240,240,242,0.5)] bg-[rgba(255,255,255,0.01)]">
                <th className="py-3 px-5">POS Serial & Model</th>
                <th className="py-3 px-5">Merchant & Outlet</th>
                <th className="py-3 px-5">MID / TID</th>
                <th className="py-3 px-5">Expected Return</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Assigned</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(240,240,242,0.04)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[rgba(240,240,242,0.4)] font-mono text-xs">
                    No UAT terminals match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => {
                  const isOverdue =
                    req.posTerminalUatStatus === 'Pending Return' &&
                    req.uatExpectedReturnDate &&
                    req.uatExpectedReturnDate < todayStr;

                  return (
                    <tr key={req.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-3 px-5 font-mono text-[0.75rem]">
                        <div className="text-[#f0f0f2] font-semibold">{req.serialNumber}</div>
                        <div className="text-[rgba(240,240,242,0.4)] text-[11px] font-sans">{req.posModel || 'Standard POS'}</div>
                      </td>

                      <td className="py-3 px-5">
                        <div 
                          onClick={() => onOpenDetail(req)}
                          className="font-bold text-[#f0f0f2] hover:text-[#2ecc71] cursor-pointer"
                        >
                          {req.merchantName}
                        </div>
                        <div className="text-[rgba(240,240,242,0.5)] text-[11px]">{req.outletName}</div>
                      </td>

                      <td className="py-3 px-5 font-mono tabular-nums text-[0.75rem] text-[rgba(240,240,242,0.7)]">
                        <div>MID {req.mid}</div>
                        <div className="text-[rgba(240,240,242,0.4)] text-[11px]">TID {req.tid}</div>
                      </td>

                      <td className="py-3 px-5 font-mono tabular-nums text-[0.75rem]">
                        {req.uatExpectedReturnDate ? (
                          <span className={isOverdue ? 'text-[#e74c3c] font-semibold' : 'text-[#f0f0f2]'}>
                            {req.uatExpectedReturnDate}
                            {isOverdue && ' (OVERDUE)'}
                          </span>
                        ) : (
                          <span className="text-[rgba(240,240,242,0.4)]">-</span>
                        )}
                      </td>

                      <td className="py-3 px-5">
                        <span className={`terminal-chip ${
                          req.posTerminalUatStatus === 'Pending Return'
                            ? isOverdue
                              ? 'text-[#e74c3c] border-[#e74c3c]/40'
                              : 'text-[#f1c40f] border-[#f1c40f]/40'
                            : 'text-[#2ecc71] border-[#2ecc71]/40'
                        }`}>
                          {req.posTerminalUatStatus.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-5 text-[rgba(240,240,242,0.8)]">
                        <div>{req.assignedStaff}</div>
                        <div className="text-[rgba(240,240,242,0.4)] font-mono text-[11px]">ID: {req.staffId}</div>
                      </td>

                      <td className="py-3 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenStatusUpdate(req)}
                          className="px-2.5 py-1 text-xs font-mono text-[#2ecc71] hover:bg-[#2ecc71]/10 rounded border border-[#2ecc71]/30 transition-colors inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Update Return</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
