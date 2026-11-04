import React, { useState } from 'react';
import { FileSpreadsheet, Calendar, Search, CheckCircle, Clock, AlertTriangle, Layers, BarChart2, Upload } from 'lucide-react';
import { MerchantRequest } from '../types';
import { exportMerchantRequestsToExcel, exportUatTerminalsToExcel, exportAuditHistoryToExcel } from '../utils/excelExport';

interface ReportsViewProps {
  requests: MerchantRequest[];
  onOpenDetail: (request: MerchantRequest) => void;
  onOpenImportData?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ requests, onOpenDetail, onOpenImportData }) => {
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'history' | 'excel'>('daily');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [historySearch, setHistorySearch] = useState('');

  // Daily operations calculation
  const dailyRequestsCreated = requests.filter(
    (r) => r.createdAt.split('T')[0] === selectedDate
  );

  const dailyLogsExecuted = requests.flatMap((r) =>
    r.statusLogs
      .filter((log) => log.timestamp.split('T')[0] === selectedDate)
      .map((log) => ({ ...log, merchant: r }))
  );

  // Monthly requests calculation
  const monthlyRequests = requests.filter(
    (r) => r.createdAt.startsWith(selectedMonth) || r.updatedAt.startsWith(selectedMonth)
  );
  const monthlyCompleted = monthlyRequests.filter((r) => r.status === 'Completed').length;
  const monthlyInProgress = monthlyRequests.filter((r) => ['In Progress', 'Testing'].includes(r.status)).length;
  const monthlyRejected = monthlyRequests.filter((r) => r.status === 'Rejected / Cancelled').length;

  const monthlyCompletionRate = monthlyRequests.length > 0 
    ? Math.round((monthlyCompleted / monthlyRequests.length) * 100) 
    : 0;

  // Integration types count in selected month
  const monthlyIp = monthlyRequests.filter((r) => r.integrationType === 'IP').length;
  const monthlySerial = monthlyRequests.filter((r) => r.integrationType === 'Serial Port').length;
  const monthlyWireless = monthlyRequests.filter((r) => r.integrationType === 'Wireless').length;

  // History search filter
  const historyFiltered = requests.filter((r) => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      r.merchantName.toLowerCase().includes(q) ||
      r.outletName.toLowerCase().includes(q) ||
      r.mid.toLowerCase().includes(q) ||
      r.tid.toLowerCase().includes(q) ||
      r.serialNumber.toLowerCase().includes(q) ||
      r.assignedStaff.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Consolidated Toolbar: Report Tabs + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-1.5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl">
        {/* Report Type Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setReportType('daily')}
            className={`px-3 py-1.5 text-xs font-mono uppercase rounded-lg transition-colors ${
              reportType === 'daily'
                ? 'bg-white/10 text-[#2ecc71] font-semibold border border-[#2ecc71]/40'
                : 'text-[rgba(240,240,242,0.6)] hover:text-[#f0f0f2] hover:bg-white/5 border border-transparent'
            }`}
          >
            Daily Operations
          </button>

          <button
            type="button"
            onClick={() => setReportType('monthly')}
            className={`px-3 py-1.5 text-xs font-mono uppercase rounded-lg transition-colors ${
              reportType === 'monthly'
                ? 'bg-white/10 text-[#2ecc71] font-semibold border border-[#2ecc71]/40'
                : 'text-[rgba(240,240,242,0.6)] hover:text-[#f0f0f2] hover:bg-white/5 border border-transparent'
            }`}
          >
            Monthly Throughput
          </button>

          <button
            type="button"
            onClick={() => setReportType('history')}
            className={`px-3 py-1.5 text-xs font-mono uppercase rounded-lg transition-colors ${
              reportType === 'history'
                ? 'bg-white/10 text-[#2ecc71] font-semibold border border-[#2ecc71]/40'
                : 'text-[rgba(240,240,242,0.6)] hover:text-[#f0f0f2] hover:bg-white/5 border border-transparent'
            }`}
          >
            Audit History
          </button>

          <button
            type="button"
            onClick={() => setReportType('excel')}
            className={`px-3 py-1.5 text-xs font-mono uppercase rounded-lg transition-colors ${
              reportType === 'excel'
                ? 'bg-white/10 text-[#2ecc71] font-semibold border border-[#2ecc71]/40'
                : 'text-[rgba(240,240,242,0.6)] hover:text-[#f0f0f2] hover:bg-white/5 border border-transparent'
            }`}
          >
            Export Center
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start lg:self-auto px-1">
          {onOpenImportData && (
            <button
              type="button"
              onClick={onOpenImportData}
              className="btn-action-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
              title="Import existing data file (.xlsx, .csv, .json)"
            >
              <Upload className="w-3.5 h-3.5 text-[#2ecc71]" />
              <span className="hidden sm:inline">Import File</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => exportMerchantRequestsToExcel(requests)}
            className="btn-action-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
            title="Download full register as Excel spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export XLSX</span>
          </button>
        </div>
      </div>

      {/* 1. Daily Operation Report */}
      {reportType === 'daily' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#19191d] p-4 border border-[rgba(240,240,242,0.08)] rounded-xl">
            <div>
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#f0f0f2]">
                Daily Operations Log
              </h2>
              <p className="text-xs font-mono text-[rgba(240,240,242,0.5)]">
                Intake tickets & status transitions executed on selected date
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[rgba(240,240,242,0.5)]">Select Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs px-3 py-1.5 border border-[rgba(240,240,242,0.12)] rounded-lg bg-[#0f0f11] text-[#f0f0f2] font-mono focus:outline-none focus:border-[#2ecc71]"
              />
            </div>
          </div>

          {/* Daily metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="p-3.5 sm:p-5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl shadow-xs">
              <label className="font-mono text-[0.65rem] uppercase text-[rgba(240,240,242,0.5)] block mb-1">
                New Logged
              </label>
              <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#f0f0f2] tabular-nums">
                {dailyRequestsCreated.length < 10 ? `0${dailyRequestsCreated.length}` : dailyRequestsCreated.length}
              </div>
              <div className="text-[10px] font-mono text-[rgba(240,240,242,0.4)] mt-1">Intake on {selectedDate}</div>
            </div>

            <div className="p-3.5 sm:p-5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl shadow-xs">
              <label className="font-mono text-[0.65rem] uppercase text-[rgba(240,240,242,0.5)] block mb-1">
                Updates Executed
              </label>
              <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#3498db] tabular-nums">
                {dailyLogsExecuted.length < 10 ? `0${dailyLogsExecuted.length}` : dailyLogsExecuted.length}
              </div>
              <div className="text-[10px] font-mono text-[#3498db]/70 mt-1">Status transitions</div>
            </div>

            <div className="p-3.5 sm:p-5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl shadow-xs">
              <label className="font-mono text-[0.65rem] uppercase text-[rgba(240,240,242,0.5)] block mb-1">
                Active Pipeline
              </label>
              <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#f0f0f2] tabular-nums">
                {monthlyInProgress < 10 ? `0${monthlyInProgress}` : monthlyInProgress}
              </div>
              <div className="text-[10px] font-mono text-[rgba(240,240,242,0.4)] mt-1">Working & Testing</div>
            </div>

            <div className="p-3.5 sm:p-5 bg-[#19191d] border border-[#f1c40f]/50 rounded-xl shadow-xs">
              <label className="font-mono text-[0.65rem] uppercase text-[#f1c40f] block mb-1">
                UAT Return Due
              </label>
              <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#f1c40f] tabular-nums">
                {requests.filter((r) => r.posTerminalUatStatus === 'Pending Return').length < 10
                  ? `0${requests.filter((r) => r.posTerminalUatStatus === 'Pending Return').length}`
                  : requests.filter((r) => r.posTerminalUatStatus === 'Pending Return').length}
              </div>
              <div className="text-[10px] font-mono text-[#f1c40f]/70 mt-1">Field units pending</div>
            </div>
          </div>

          {/* Daily Operations Feed */}
          <div className="bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-[rgba(240,240,242,0.08)] bg-[rgba(255,255,255,0.01)] flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[rgba(240,240,242,0.6)] uppercase tracking-wider">
                Status Transitions on {selectedDate} ({dailyLogsExecuted.length})
              </span>
            </div>

            {dailyLogsExecuted.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-[rgba(240,240,242,0.4)]">
                No status transitions or updates logged on {selectedDate}.
              </div>
            ) : (
              <div className="divide-y divide-[rgba(240,240,242,0.04)]">
                {dailyLogsExecuted.map((item, idx) => (
                  <div key={idx} className="p-4 text-xs space-y-1.5 hover:bg-white/[0.015] transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span 
                          onClick={() => onOpenDetail(item.merchant)}
                          className="font-bold text-[#f0f0f2] hover:text-[#2ecc71] cursor-pointer"
                        >
                          {item.merchant.merchantName} ({item.merchant.outletName})
                        </span>
                        <span className="text-[rgba(240,240,242,0.3)] font-mono">·</span>
                        <span className="font-mono text-[rgba(240,240,242,0.5)]">{item.merchant.id}</span>
                        <span className="text-[rgba(240,240,242,0.3)] font-mono">·</span>
                        <span className="font-mono font-semibold text-[#2ecc71]">
                          {item.previousStatus} &rarr; {item.newStatus}
                        </span>
                      </div>
                      <span className="font-mono text-[rgba(240,240,242,0.4)] text-[11px]">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[rgba(240,240,242,0.8)] pl-2 border-l-2 border-[#2ecc71]">
                      {item.remarks}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[rgba(240,240,242,0.4)] font-mono">
                      <span>Staff: {item.person} (ID: {item.staffId})</span>
                      <span>MID: {item.merchant.mid}</span>
                      <span>SN: {item.merchant.serialNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Monthly Request Report */}
      {reportType === 'monthly' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#19191d] p-4 border border-[rgba(240,240,242,0.08)] rounded-xl">
            <div>
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#f0f0f2]">
                Monthly Integration Throughput
              </h2>
              <p className="text-xs font-mono text-[rgba(240,240,242,0.5)]">
                Performance analytics & interface protocol distribution
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[rgba(240,240,242,0.5)]">Select Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs px-3 py-1.5 border border-[rgba(240,240,242,0.12)] rounded-lg bg-[#0f0f11] text-[#f0f0f2] font-mono focus:outline-none focus:border-[#2ecc71]"
              />
            </div>
          </div>

          {/* Monthly KPI Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="p-3.5 sm:p-5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl shadow-xs">
              <label className="font-mono text-[0.65rem] uppercase text-[rgba(240,240,242,0.5)] block mb-1">
                Total Month Requests
              </label>
              <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#f0f0f2] tabular-nums">
                {monthlyRequests.length < 10 ? `0${monthlyRequests.length}` : monthlyRequests.length}
              </div>
              <div className="text-[10px] font-mono text-[rgba(240,240,242,0.4)] mt-1">Logged in {selectedMonth}</div>
            </div>

            <div className="p-3.5 sm:p-5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl shadow-xs">
              <label className="font-mono text-[0.65rem] uppercase text-[rgba(240,240,242,0.5)] block mb-1">
                Completion Rate
              </label>
              <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#2ecc71] tabular-nums">
                {monthlyCompletionRate}%
              </div>
              <div className="text-[10px] font-mono text-[#2ecc71]/70 mt-1">{monthlyCompleted} completed</div>
            </div>

            <div className="p-3.5 sm:p-5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl shadow-xs">
              <label className="font-mono text-[0.65rem] uppercase text-[rgba(240,240,242,0.5)] block mb-1">
                Testing & Working
              </label>
              <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#3498db] tabular-nums">
                {monthlyInProgress < 10 ? `0${monthlyInProgress}` : monthlyInProgress}
              </div>
              <div className="text-[10px] font-mono text-[#3498db]/70 mt-1">Active certification</div>
            </div>

            <div className="p-3.5 sm:p-5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl shadow-xs">
              <label className="font-mono text-[0.65rem] uppercase text-[rgba(240,240,242,0.5)] block mb-1">
                Cancelled / Rejected
              </label>
              <div className="text-2xl sm:text-3xl font-mono font-semibold text-[#e74c3c] tabular-nums">
                {monthlyRejected < 10 ? `0${monthlyRejected}` : monthlyRejected}
              </div>
              <div className="text-[10px] font-mono text-[#e74c3c]/70 mt-1">Aborted tickets</div>
            </div>
          </div>

          {/* Integration Type Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl">
              <div className="text-xs font-mono uppercase text-[rgba(240,240,242,0.6)]">IP (Ethernet / LAN)</div>
              <div className="text-2xl font-mono font-semibold text-[#f0f0f2] mt-1">{monthlyIp}</div>
              <div className="text-[11px] text-[rgba(240,240,242,0.4)] mt-1">Direct TCP/IP socket connection</div>
            </div>

            <div className="p-5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl">
              <div className="text-xs font-mono uppercase text-[rgba(240,240,242,0.6)]">Serial Port (RS-232)</div>
              <div className="text-2xl font-mono font-semibold text-[#f0f0f2] mt-1">{monthlySerial}</div>
              <div className="text-[11px] text-[rgba(240,240,242,0.4)] mt-1">Baud rate hardware serial links</div>
            </div>

            <div className="p-5 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl">
              <div className="text-xs font-mono uppercase text-[rgba(240,240,242,0.6)]">Wireless (4G / WiFi)</div>
              <div className="text-2xl font-mono font-semibold text-[#f0f0f2] mt-1">{monthlyWireless}</div>
              <div className="text-[11px] text-[rgba(240,240,242,0.4)] mt-1">Mobile SmartPOS cellular data</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Merchant Integration History Search */}
      {reportType === 'history' && (
        <div className="space-y-4">
          <div className="bg-[#19191d] p-4 border border-[rgba(240,240,242,0.08)] rounded-xl space-y-3">
            <div>
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[#f0f0f2]">
                Merchant Integration History Audit
              </h2>
              <p className="text-xs font-mono text-[rgba(240,240,242,0.5)]">
                Query end-to-end lifecycle history by MID, TID, Serial Number, or Merchant Name
              </p>
            </div>

            <div className="bg-[#0f0f11] border border-[rgba(240,240,242,0.08)] rounded-md px-3 py-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-[rgba(240,240,242,0.4)]" />
              <input
                type="text"
                placeholder="Search MID, TID, POS Serial Number, Merchant Name, Outlet..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full text-xs bg-transparent border-none text-[#f0f0f2] outline-none placeholder-[rgba(240,240,242,0.3)]"
              />
            </div>
          </div>

          {/* List of Merchant History Cards */}
          <div className="space-y-3">
            {historyFiltered.length === 0 ? (
              <div className="bg-[#19191d] p-8 text-center text-xs font-mono text-[rgba(240,240,242,0.4)] border border-[rgba(240,240,242,0.08)] rounded-xl">
                No merchant integration records found matching "{historySearch}".
              </div>
            ) : (
              historyFiltered.map((req) => (
                <div key={req.id} className="bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(240,240,242,0.06)] pb-2.5">
                    <div>
                      <span 
                        onClick={() => onOpenDetail(req)}
                        className="text-sm font-bold text-[#f0f0f2] hover:text-[#2ecc71] cursor-pointer"
                      >
                        {req.merchantName}
                      </span>
                      <span className="text-xs text-[rgba(240,240,242,0.5)] ml-2">({req.outletName})</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-[rgba(240,240,242,0.5)]">MID: <strong className="text-[#f0f0f2]">{req.mid}</strong></span>
                      <span className="text-[rgba(240,240,242,0.5)]">TID: <strong className="text-[#f0f0f2]">{req.tid}</strong></span>
                      <span className="terminal-chip">{req.status.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Chronological steps */}
                  <div className="pl-3 border-l-2 border-[rgba(240,240,242,0.12)] space-y-2 text-xs">
                    {req.statusLogs.map((log) => (
                      <div key={log.id} className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#f0f0f2]">
                            {log.previousStatus === log.newStatus ? log.newStatus : `${log.previousStatus} -> ${log.newStatus}`}
                          </span>
                          <span className="text-[rgba(240,240,242,0.3)]">·</span>
                          <span className="text-[rgba(240,240,242,0.5)]">{log.person} (Staff ID: {log.staffId})</span>
                          <span className="text-[rgba(240,240,242,0.3)]">·</span>
                          <span className="font-mono text-[11px] text-[rgba(240,240,242,0.4)]">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[rgba(240,240,242,0.8)] text-[11px]">{log.remarks}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. Export to Excel Hub */}
      {reportType === 'excel' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-[rgba(240,240,242,0.08)] flex items-center justify-center text-[#2ecc71] mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#f0f0f2] font-display uppercase tracking-wider">
                Master Register XLSX
              </h3>
              <p className="text-xs text-[rgba(240,240,242,0.5)] mt-1">
                Complete database of all merchant integration tickets, MIDs, TIDs, serial numbers, addresses, contact persons, and statuses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportMerchantRequestsToExcel(requests)}
              className="btn-action-primary text-xs w-full"
            >
              Download Full Register (.xlsx)
            </button>
          </div>

          <div className="p-6 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-[rgba(240,240,242,0.08)] flex items-center justify-center text-[#f1c40f] mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#f0f0f2] font-display uppercase tracking-wider">
                POS Terminal UAT Log
              </h3>
              <p className="text-xs text-[rgba(240,240,242,0.5)] mt-1">
                Hardware inventory of loaned test terminals, expected return dates, pending return items, and merchant outlet locations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportUatTerminalsToExcel(requests)}
              className="btn-action-secondary text-xs w-full text-[#f1c40f] border-[#f1c40f]/30 hover:border-[#f1c40f]/60"
            >
              Download UAT Report (.xlsx)
            </button>
          </div>

          <div className="p-6 bg-[#19191d] border border-[rgba(240,240,242,0.08)] rounded-xl shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-[rgba(240,240,242,0.08)] flex items-center justify-center text-[#3498db] mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#f0f0f2] font-display uppercase tracking-wider">
                Audit Trail Log
              </h3>
              <p className="text-xs text-[rgba(240,240,242,0.5)] mt-1">
                Detailed timeline log of every single status change, updating staff name, employee ID, exact timestamp, and compliance remarks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportAuditHistoryToExcel(requests)}
              className="btn-action-secondary text-xs w-full text-[#3498db] border-[#3498db]/30 hover:border-[#3498db]/60"
            >
              Download Audit Logs (.xlsx)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
