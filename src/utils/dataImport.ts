import * as XLSX from 'xlsx';
import { IntegrationType, MerchantRequest, RequestStatus, UatTerminalStatus } from '../types';

/**
 * Download sample Excel template for existing merchant integration requests
 */
export function downloadSampleIntegrationTemplate() {
  const sampleData = [
    {
      'Merchant Company': 'COFFEE CONCEPTS (CAMBODIA) LIMITED',
      'Merchant Outlet': 'STARBUCKS 313 QUAYSIDE',
      'POS S/N': 'SN555555Q2222',
      'MID': '',
      'TID': '',
      'Integration Type': 'IP',
      'Merchant Business': 'F&B / Restaurant & Cafe',
      'Contact Person': 'Seth Daka',
      'Phone Number': '012345678',
      'Address': 'HKL Ounalom River Side Mall, Preah Sisowath Quay, Village 1, PP',
      'Google Map': 'N/A',
      'Assigned Staff': 'Nget Monioudom',
      'Staff ID': '222222',
      'Current Status': 'New',
      'Remarks': 'Please adding POS stand and USB too',
      'Telegram Group': '@pos_integration_core',
      'UAT Terminal Loaned': 'No',
    },
    {
      'Merchant Company': 'KHUN Virakboth',
      'Merchant Outlet': 'VB Coffee',
      'POS S/N': 'WP555555Q55555',
      'MID': '55555555555',
      'TID': '555555',
      'Integration Type': 'Serial Port',
      'Merchant Business': 'F&B / Restaurant & Cafe',
      'Contact Person': 'Mr.Vibol',
      'Phone Number': '012 5555 55',
      'Address': 'Phnom Penh',
      'Google Map': 'https://maps.app.goo.gl/phnompenh_vbcoffee',
      'Assigned Staff': 'Nget Monioudom',
      'Staff ID': '222222',
      'Current Status': 'New',
      'Remarks': 'Merchant Request Completed Set within Today.',
      'UAT Terminal Loaned': 'No',
    },
    {
      'Merchant Company': 'STARBUCK',
      'Merchant Outlet': 'Starbuck BKK (PP)',
      'POS S/N': 'SN5555555555',
      'MID': '12345678876',
      'TID': '78876',
      'Integration Type': 'Serial Port',
      'Merchant Business': 'F&B / Restaurant & Cafe',
      'Contact Person': 'Leng Rotha',
      'Phone Number': '015834661',
      'Address': 'Phnom Penh',
      'Google Map': 'N/A',
      'Assigned Staff': 'KIM samart',
      'Staff ID': '1042',
      'Current Status': 'Completed',
      'Remarks': 'Standard integration onboarding request.',
      'UAT Terminal Loaned': 'No',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Merchant Requests Template');
  XLSX.writeFile(wb, 'merchant_integration_import_template.xlsx');
}

/**
 * Standardize key names for fuzzy column matching
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parse an uploaded file (.xlsx, .xls, .csv, .json) and return structured MerchantRequest records
 */
export async function parseExistingDataFile(file: File): Promise<{
  requests: MerchantRequest[];
  errors: string[];
}> {
  const errors: string[] = [];
  const filename = file.name.toLowerCase();

  try {
    let rawRows: Record<string, any>[] = [];

    if (filename.endsWith('.json')) {
      const text = await file.text();
      const parsed = JSON.parse(text);
      rawRows = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      // Excel or CSV file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('Workbook contains no sheets.');
      }
      const worksheet = workbook.Sheets[firstSheetName];
      rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    }

    if (!rawRows.length) {
      return { requests: [], errors: ['The uploaded file contains no data rows.'] };
    }

    const nowIso = new Date().toISOString();
    const parsedRequests: MerchantRequest[] = [];

    rawRows.forEach((row, idx) => {
      const normalizedRow: Record<string, string> = {};
      Object.entries(row).forEach(([k, v]) => {
        normalizedRow[normalizeKey(k)] = String(v ?? '').trim();
      });

      // Find fields with flexible column naming
      const merchantName =
        normalizedRow['merchantcompany'] ||
        normalizedRow['merchantname'] ||
        normalizedRow['company'] ||
        normalizedRow['merchant'] ||
        normalizedRow['businessname'] ||
        '';

      const outletName =
        normalizedRow['merchantoutlet'] ||
        normalizedRow['outletname'] ||
        normalizedRow['outlet'] ||
        normalizedRow['branch'] ||
        normalizedRow['store'] ||
        '';

      const serialNumber =
        normalizedRow['possn'] ||
        normalizedRow['posserialnumber'] ||
        normalizedRow['serialnumber'] ||
        normalizedRow['sn'] ||
        normalizedRow['posserial'] ||
        '';

      if (!merchantName && !outletName && !serialNumber) {
        // Skip empty row
        return;
      }

      const mid =
        normalizedRow['mid'] ||
        normalizedRow['merchantid'] ||
        '';

      const tid =
        normalizedRow['tid'] ||
        normalizedRow['terminalid'] ||
        '';

      let integrationType: IntegrationType = 'IP';
      const rawType = (
        normalizedRow['integrationtype'] ||
        normalizedRow['type'] ||
        ''
      ).toLowerCase();

      if (rawType.includes('serial')) {
        integrationType = 'Serial Port';
      } else if (rawType.includes('wireless') || rawType.includes('wifi') || rawType.includes('sim') || rawType.includes('4g')) {
        integrationType = 'Wireless';
      } else {
        integrationType = 'IP';
      }

      const businessType =
        normalizedRow['merchantbusiness'] ||
        normalizedRow['businesstype'] ||
        normalizedRow['business'] ||
        normalizedRow['category'] ||
        'F&B / Restaurant & Cafe';

      const contactPerson =
        normalizedRow['contactperson'] ||
        normalizedRow['contact'] ||
        normalizedRow['person'] ||
        'Store Manager';

      const phoneNumber =
        normalizedRow['phonenumber'] ||
        normalizedRow['phone'] ||
        normalizedRow['tel'] ||
        normalizedRow['mobile'] ||
        '-';

      const address =
        normalizedRow['address'] ||
        normalizedRow['location'] ||
        'Phnom Penh';

      const googleMap =
        normalizedRow['googlemap'] ||
        normalizedRow['map'] ||
        normalizedRow['mapurl'] ||
        'N/A';

      const assignedStaff =
        normalizedRow['assignedstaff'] ||
        normalizedRow['staff'] ||
        normalizedRow['engineer'] ||
        'Nget Monioudom';

      const staffId =
        normalizedRow['staffid'] ||
        normalizedRow['staffcode'] ||
        '222222';

      let status: RequestStatus = 'New';
      const rawStatus = (
        normalizedRow['currentstatus'] ||
        normalizedRow['status'] ||
        ''
      ).toLowerCase();

      if (rawStatus.includes('prog')) status = 'In Progress';
      else if (rawStatus.includes('test')) status = 'Testing';
      else if (rawStatus.includes('comp') || rawStatus.includes('done')) status = 'Completed';
      else if (rawStatus.includes('pend')) status = 'Pending';
      else if (rawStatus.includes('reject') || rawStatus.includes('cancel')) status = 'Rejected / Cancelled';
      else status = 'New';

      const remarks =
        normalizedRow['remarks'] ||
        normalizedRow['remark'] ||
        normalizedRow['notes'] ||
        normalizedRow['note'] ||
        'Imported existing merchant data file.';

      const telegramGroup =
        normalizedRow['telegramgroup'] ||
        normalizedRow['telegram'] ||
        normalizedRow['telegramchannel'] ||
        normalizedRow['chatid'] ||
        normalizedRow['group'] ||
        undefined;

      const isUatLoan =
        (normalizedRow['uatterminalloaned'] || normalizedRow['isposterminaluat'] || '').toLowerCase().startsWith('y');

      const uatStatus: UatTerminalStatus = isUatLoan ? 'Pending Return' : 'Not Applicable';

      // Request ID: if already provided, use it; else generate clean sequential ID
      const existingId = normalizedRow['requestid'] || normalizedRow['id'];
      const reqId = existingId && existingId.startsWith('REQ-')
        ? existingId
        : `REQ-2026-${String(100 + idx + Math.floor(Math.random() * 800))}`;

      const newRequest: MerchantRequest = {
        id: reqId,
        merchantName: merchantName || `Merchant ${idx + 1}`,
        outletName: outletName || `Main Outlet`,
        serialNumber: serialNumber || `SN-${Date.now()}-${idx + 1}`,
        mid,
        tid,
        address,
        googleMap: googleMap === 'N/A' || !googleMap ? undefined : googleMap,
        businessType,
        contactPerson,
        phoneNumber,
        integrationType,
        assignedStaff,
        staffId,
        status,
        telegramGroup: telegramGroup ? String(telegramGroup).trim() : undefined,
        isPosTerminalUat: isUatLoan,
        posTerminalUatStatus: uatStatus,
        posModel: isUatLoan ? 'PAX A920 Pro SmartPOS' : undefined,
        remarks,
        createdAt: nowIso,
        updatedAt: nowIso,
        statusLogs: [
          {
            id: `LOG-IMP-${idx + 1}`,
            previousStatus: status,
            newStatus: status,
            person: assignedStaff,
            staffId,
            timestamp: nowIso,
            remarks: `Imported from existing data file: ${file.name}`,
          },
        ],
      };

      parsedRequests.push(newRequest);
    });

    return { requests: parsedRequests, errors };
  } catch (err: any) {
    return { requests: [], errors: [err?.message || 'Failed to read or parse data file.'] };
  }
}
