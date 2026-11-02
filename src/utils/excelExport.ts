import * as XLSX from 'xlsx';
import { MerchantRequest } from '../types';

/**
 * Utility to trigger download of a generated workbook in browser
 */
function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, filename);
}

/**
 * Export full merchant integration requests list to Excel
 */
export function exportMerchantRequestsToExcel(requests: MerchantRequest[]) {
  const data = requests.map((req, index) => ({
    'No.': index + 1,
    'Request ID': req.id,
    'Merchant Name': req.merchantName,
    'Outlet Name': req.outletName,
    'POS Serial Number': req.serialNumber,
    'MID': req.mid,
    'TID': req.tid,
    'Integration Type': req.integrationType,
    'Business Type': req.businessType,
    'Current Status': req.status,
    'Assigned Staff': req.assignedStaff,
    'Staff ID': req.staffId,
    'Contact Person': req.contactPerson,
    'Phone Number': req.phoneNumber,
    'Address': req.address,
    'Google Map': req.googleMap || '-',
    'UAT Loaned': req.isPosTerminalUat ? 'Yes' : 'No',
    'UAT Return Status': req.posTerminalUatStatus,
    'Expected Return Date': req.uatExpectedReturnDate || '-',
    'Actual Return Date': req.uatActualReturnDate || '-',
    'Created Date': new Date(req.createdAt).toLocaleDateString(),
    'Last Updated': new Date(req.updatedAt).toLocaleDateString(),
    'Initial Remarks': req.remarks,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  // Auto-width columns
  const wscols = [
    { wch: 5 },  // No.
    { wch: 15 }, // Request ID
    { wch: 25 }, // Merchant Name
    { wch: 20 }, // Outlet Name
    { wch: 18 }, // POS Serial
    { wch: 15 }, // MID
    { wch: 12 }, // TID
    { wch: 16 }, // Integration Type
    { wch: 20 }, // Business Type
    { wch: 18 }, // Current Status
    { wch: 18 }, // Assigned Staff
    { wch: 12 }, // Staff ID
    { wch: 18 }, // Contact Person
    { wch: 15 }, // Phone Number
    { wch: 30 }, // Address
    { wch: 35 }, // Google Map
    { wch: 12 }, // UAT Loaned
    { wch: 18 }, // UAT Return Status
    { wch: 18 }, // Expected Return Date
    { wch: 18 }, // Actual Return Date
    { wch: 14 }, // Created Date
    { wch: 14 }, // Last Updated
    { wch: 30 }, // Remarks
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Merchant Requests');

  const dateStr = new Date().toISOString().split('T')[0];
  downloadWorkbook(workbook, `System_Integration_Requests_${dateStr}.xlsx`);
}

/**
 * Export POS Terminal UAT Tracking Report to Excel
 */
export function exportUatTerminalsToExcel(requests: MerchantRequest[]) {
  const uatItems = requests.filter(r => r.isPosTerminalUat);
  const data = uatItems.map((req, index) => ({
    'No.': index + 1,
    'Request ID': req.id,
    'Merchant Name': req.merchantName,
    'Outlet': req.outletName,
    'POS Serial Number': req.serialNumber,
    'MID': req.mid,
    'TID': req.tid,
    'UAT Status': req.posTerminalUatStatus,
    'Loan Date': req.uatLoanDate || new Date(req.createdAt).toLocaleDateString(),
    'Expected Return Date': req.uatExpectedReturnDate || 'N/A',
    'Actual Return Date': req.uatActualReturnDate || 'Pending',
    'Assigned Staff': req.assignedStaff,
    'Staff ID': req.staffId,
    'Contact Person': req.contactPerson,
    'Phone': req.phoneNumber,
    'Integration Status': req.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'UAT Terminal Inventory');

  const dateStr = new Date().toISOString().split('T')[0];
  downloadWorkbook(workbook, `POS_Terminal_UAT_Pending_Return_${dateStr}.xlsx`);
}

/**
 * Export Complete Audit History & Status Changes to Excel
 */
export function exportAuditHistoryToExcel(requests: MerchantRequest[]) {
  const rows: Record<string, string | number>[] = [];

  requests.forEach(req => {
    req.statusLogs.forEach((log, logIdx) => {
      rows.push({
        'Log Index': logIdx + 1,
        'Request ID': req.id,
        'Merchant Name': req.merchantName,
        'Outlet': req.outletName,
        'Previous Status': log.previousStatus,
        'New Status': log.newStatus,
        'Updated By': log.person,
        'Staff ID': log.staffId,
        'Timestamp': new Date(log.timestamp).toLocaleString(),
        'Remarks': log.remarks,
        'UAT Status Change': log.uatStatusChange ? `${log.uatStatusChange.from} -> ${log.uatStatusChange.to}` : 'N/A',
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Integration Audit Trail');

  const dateStr = new Date().toISOString().split('T')[0];
  downloadWorkbook(workbook, `Merchant_Integration_Audit_Trail_${dateStr}.xlsx`);
}
