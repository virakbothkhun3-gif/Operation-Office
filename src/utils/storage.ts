import { 
  MerchantRequest, 
  TelegramConfig, 
  TelegramDeliveryLog, 
  UserProfile, 
  GroupNotification, 
  NotificationKeyword 
} from '../types';
import { DEFAULT_TELEGRAM_CONFIG } from './telegram';

const STORAGE_KEY_REQUESTS = 'system_integration_requests_v5';
const STORAGE_KEY_TELEGRAM_CONFIG = 'system_integration_telegram_cfg_v1';
const STORAGE_KEY_TELEGRAM_LOGS = 'system_integration_telegram_logs_v1';
const STORAGE_KEY_CURRENT_USER = 'system_integration_active_user_v1';
const STORAGE_KEY_NOTIFICATIONS = 'system_integration_notifications_v2';

export const INITIAL_REQUESTS: MerchantRequest[] = [
  {
    id: 'REQ-2026-098',
    merchantName: 'COFFEE CONCEPTS (CAMBODIA) LIMITED',
    outletName: 'STARBUCKS 313 QUAYSIDE',
    serialNumber: 'SN555555Q2222',
    mid: '',
    tid: '',
    address: 'HKL Ounalom River Side Mall, Preah Sisowath Quay, Village 1, PP',
    googleMap: 'N/A',
    businessType: 'F&B / Restaurant & Cafe',
    contactPerson: 'Seth Daka',
    phoneNumber: '012345678',
    integrationType: 'IP',
    assignedStaff: 'Nget Monioudom',
    staffId: '222222',
    status: 'New',
    telegramGroup: '@pos_integration_core',
    isPosTerminalUat: false,
    posTerminalUatStatus: 'Not Applicable',
    posModel: 'IP POS Terminal',
    remarks: 'Please adding POS stand and USB too',
    createdAt: '2026-11-02T13:50:06.000Z',
    updatedAt: '2026-11-02T13:50:06.000Z',
    statusLogs: [
      {
        id: 'LOG-098',
        previousStatus: 'New',
        newStatus: 'New',
        person: 'Nget Monioudom',
        staffId: '222222',
        timestamp: '2026-11-02T13:50:06.000Z',
        remarks: 'Please adding POS stand and USB too',
      },
    ],
  },
  {
    id: 'REQ-2026-099',
    merchantName: 'KHUN Virakboth',
    outletName: 'VB Coffee',
    serialNumber: 'WP555555Q55555',
    mid: '55555555555',
    tid: '555555',
    address: 'Phnom Penh',
    googleMap: 'https://maps.app.goo.gl/phnompenh_vbcoffee',
    businessType: 'F&B / Restaurant & Cafe',
    contactPerson: 'Mr.Vibol',
    phoneNumber: '012 5555 55',
    integrationType: 'Serial Port',
    assignedStaff: 'Nget Monioudom',
    staffId: '222222',
    status: 'New',
    isPosTerminalUat: false,
    posTerminalUatStatus: 'Not Applicable',
    posModel: 'Verifone / PAX Serial POS',
    remarks: 'Merchant Request Completed Set within Today.',
    createdAt: '2026-11-01T11:21:05.000Z',
    updatedAt: '2026-11-01T11:21:05.000Z',
    statusLogs: [
      {
        id: 'LOG-099',
        previousStatus: 'New',
        newStatus: 'New',
        person: 'Nget Monioudom',
        staffId: '222222',
        timestamp: '2026-11-01T11:21:05.000Z',
        remarks: 'Merchant Request Completed Set within Today.',
      },
    ],
  },
  {
    id: 'REQ-2026-100',
    merchantName: 'STARBUCK',
    outletName: 'Starbuck BKK (PP)',
    serialNumber: 'SN5555555555',
    mid: '12345678876',
    tid: '78876',
    address: 'Phnom Penh',
    businessType: 'F&B / Restaurant & Cafe',
    contactPerson: 'Leng Rotha',
    phoneNumber: '015834661',
    integrationType: 'Serial Port',
    assignedStaff: 'KIM samart',
    staffId: '1042',
    status: 'New',
    isPosTerminalUat: false,
    posTerminalUatStatus: 'Not Applicable',
    posModel: 'Castles VEGA3000 Serial PinPad',
    remarks: 'Standard integration onboarding request.',
    createdAt: '2026-11-01T11:21:05.000Z',
    updatedAt: '2026-11-01T11:21:05.000Z',
    statusLogs: [
      {
        id: 'LOG-100',
        previousStatus: 'New',
        newStatus: 'New',
        person: 'KIM samart',
        staffId: '1042',
        timestamp: '2026-11-01T11:21:05.000Z',
        remarks: 'Standard integration onboarding request.',
      },
    ],
  },
  {
    id: 'REQ-2026-101',
    merchantName: 'Starbucks Reserve - Jewel Flagship',
    outletName: 'Jewel Changi Airport #02-204',
    serialNumber: 'SN-PAX920-883921',
    mid: 'MID-77291044',
    tid: 'TID-09281',
    address: '78 Airport Boulevard, #02-204 Jewel Changi, Singapore 819666',
    businessType: 'F&B / Speciality Cafe',
    contactPerson: 'David Chen',
    phoneNumber: '+65 9123 4567',
    integrationType: 'IP',
    assignedStaff: 'Alexander Wong',
    staffId: '1042',
    status: 'In Progress',
    isPosTerminalUat: true,
    posTerminalUatStatus: 'Pending Return',
    posModel: 'PAX A920 Pro SmartPOS',
    uatLoanDate: '2026-10-24',
    uatExpectedReturnDate: '2026-11-05',
    remarks: 'Dual LAN IP configuration with Oracle Symphony POS. UAT terminal loaned for till integration test.',
    createdAt: '2026-10-24T09:15:00.000Z',
    updatedAt: '2026-10-28T14:20:00.000Z',
    statusLogs: [
      {
        id: 'LOG-1',
        previousStatus: 'New',
        newStatus: 'In Progress',
        person: 'Alexander Wong',
        staffId: '1042',
        timestamp: '2026-10-28T14:20:00.000Z',
        remarks: 'Network subnet configured. Testing IP communication port 8080 with merchant till.',
      },
      {
        id: 'LOG-0',
        previousStatus: 'New',
        newStatus: 'New',
        person: 'Operations Intake',
        staffId: '1001',
        timestamp: '2026-10-24T09:15:00.000Z',
        remarks: 'Merchant request submitted. Loaned PAX A920 Pro terminal for testing.',
      },
    ],
  },
  {
    id: 'REQ-2026-102',
    merchantName: 'Uniqlo Global Flagship',
    outletName: 'Orchard Central Outlet 1-3F',
    serialNumber: 'SN-VF200T-449102',
    mid: 'MID-88391029',
    tid: 'TID-04419',
    address: '181 Orchard Rd, #01-01 to 04/23-25 Orchard Central, Singapore 238896',
    businessType: 'Retail & Fashion',
    contactPerson: 'Jessica Tan',
    phoneNumber: '+65 8234 5678',
    integrationType: 'Serial Port',
    assignedStaff: 'Marcus Vance',
    staffId: '1088',
    status: 'Testing',
    isPosTerminalUat: true,
    posTerminalUatStatus: 'Pending Return',
    posModel: 'Verifone V200t ECR',
    uatLoanDate: '2026-10-20',
    uatExpectedReturnDate: '2026-11-02',
    remarks: 'Direct RS-232 serial cable link to self-checkout counter. Baud rate 115200.',
    createdAt: '2026-10-20T11:30:00.000Z',
    updatedAt: '2026-10-29T16:45:00.000Z',
    statusLogs: [
      {
        id: 'LOG-202',
        previousStatus: 'In Progress',
        newStatus: 'Testing',
        person: 'Marcus Vance',
        staffId: '1088',
        timestamp: '2026-10-29T16:45:00.000Z',
        remarks: 'Serial connection confirmed. Performing end-to-end card payment simulation on ECR.',
      },
      {
        id: 'LOG-201',
        previousStatus: 'New',
        newStatus: 'In Progress',
        person: 'Marcus Vance',
        staffId: '1088',
        timestamp: '2026-10-22T10:00:00.000Z',
        remarks: 'Began RS-232 protocol integration test with Toshiba self-checkout kiosk.',
      },
      {
        id: 'LOG-200',
        previousStatus: 'New',
        newStatus: 'New',
        person: 'Operations Intake',
        staffId: '1001',
        timestamp: '2026-10-20T11:30:00.000Z',
        remarks: 'Request entered for new self-checkout pod.',
      },
    ],
  },
  {
    id: 'REQ-2026-103',
    merchantName: 'FairPrice Finest Supermarket',
    outletName: 'Scotts Square Basement 1',
    serialNumber: 'SN-ING5000-112093',
    mid: 'MID-55419082',
    tid: 'TID-07721',
    address: '6 Scotts Road, #B1-03 to 07 Scotts Square, Singapore 228209',
    businessType: 'Supermarket & Grocery',
    contactPerson: 'Raymond Teo',
    phoneNumber: '+65 9345 6789',
    integrationType: 'Wireless',
    assignedStaff: 'Clara Oswald',
    staffId: '1055',
    status: 'Completed',
    isPosTerminalUat: true,
    posTerminalUatStatus: 'Returned',
    posModel: 'Ingenico Move 5000 4G/WiFi',
    uatLoanDate: '2026-10-10',
    uatExpectedReturnDate: '2026-10-22',
    uatActualReturnDate: '2026-10-22',
    remarks: 'Wireless 4G fallback enabled with WPA3 enterprise WiFi roaming.',
    createdAt: '2026-10-10T08:00:00.000Z',
    updatedAt: '2026-10-22T17:00:00.000Z',
    statusLogs: [
      {
        id: 'LOG-303',
        previousStatus: 'Testing',
        newStatus: 'Completed',
        person: 'Clara Oswald',
        staffId: '1055',
        timestamp: '2026-10-22T17:00:00.000Z',
        remarks: 'Integration verified in production. UAT test terminal returned in good condition.',
        uatStatusChange: {
          from: 'Pending Return',
          to: 'Returned',
          returnDate: '2026-10-22',
        },
      },
      {
        id: 'LOG-302',
        previousStatus: 'In Progress',
        newStatus: 'Testing',
        person: 'Clara Oswald',
        staffId: '1055',
        timestamp: '2026-10-15T14:10:00.000Z',
        remarks: 'Signal strength test passed on all grocery aisles.',
      },
      {
        id: 'LOG-301',
        previousStatus: 'New',
        newStatus: 'In Progress',
        person: 'Clara Oswald',
        staffId: '1055',
        timestamp: '2026-10-11T09:30:00.000Z',
        remarks: 'SIM card provisioned and APN profile loaded.',
      },
    ],
  },
  {
    id: 'REQ-2026-104',
    merchantName: 'Marina Bay Sands - Spago Dining Room',
    outletName: 'Sands SkyPark Tower 2, Level 57',
    serialNumber: 'SN-PAX920-771249',
    mid: 'MID-99201948',
    tid: 'TID-01824',
    address: '10 Bayfront Avenue, Level 57 Hotel Tower 2, Singapore 018956',
    businessType: 'Hospitality & Fine Dining',
    contactPerson: 'Chef Laurent Michel',
    phoneNumber: '+65 6688 9955',
    integrationType: 'Wireless',
    assignedStaff: 'Alexander Wong',
    staffId: '1042',
    status: 'In Progress',
    isPosTerminalUat: true,
    posTerminalUatStatus: 'Pending Return',
    posModel: 'PAX A920 Pro SmartPOS',
    uatLoanDate: '2026-10-25',
    uatExpectedReturnDate: '2026-11-08',
    remarks: 'Pay-at-table wireless integration with Infrasys cloud POS.',
    createdAt: '2026-10-25T13:40:00.000Z',
    updatedAt: '2026-10-29T11:20:00.000Z',
    statusLogs: [
      {
        id: 'LOG-401',
        previousStatus: 'New',
        newStatus: 'In Progress',
        person: 'Alexander Wong',
        staffId: '1042',
        timestamp: '2026-10-29T11:20:00.000Z',
        remarks: 'Testing cloud table-bill sync webhook over 5GHz WiFi.',
      },
      {
        id: 'LOG-400',
        previousStatus: 'New',
        newStatus: 'New',
        person: 'Operations Intake',
        staffId: '1001',
        timestamp: '2026-10-25T13:40:00.000Z',
        remarks: 'New request logged for poolside rooftop dining tables.',
      },
    ],
  },
  {
    id: 'REQ-2026-105',
    merchantName: 'Raffles Medical Group',
    outletName: 'Raffles Hospital Medical Centre',
    serialNumber: 'SN-CASTLE-990184',
    mid: 'MID-33190284',
    tid: 'TID-05512',
    address: '585 North Bridge Road, Level 2 Pharmacy, Singapore 188770',
    businessType: 'Healthcare & Clinic',
    contactPerson: 'Grace Lim',
    phoneNumber: '+65 6311 1111',
    integrationType: 'IP',
    assignedStaff: 'Sarah Jenkins',
    staffId: '1070',
    status: 'New',
    isPosTerminalUat: false,
    posTerminalUatStatus: 'Not Applicable',
    posModel: 'Castles VEGA3000 PinPad',
    remarks: 'Clinic management system (CMS) integration for outpatient pharmacy counter.',
    createdAt: '2026-10-31T09:00:00.000Z',
    updatedAt: '2026-10-31T09:00:00.000Z',
    statusLogs: [
      {
        id: 'LOG-500',
        previousStatus: 'New',
        newStatus: 'New',
        person: 'Sarah Jenkins',
        staffId: '1070',
        timestamp: '2026-10-31T09:00:00.000Z',
        remarks: 'Initial ticket intake. Awaiting network IP assignment from Raffles IT team.',
      },
    ],
  },
  {
    id: 'REQ-2026-106',
    merchantName: 'Shell Select Express Mart',
    outletName: 'Shell Tampines Ave 2',
    serialNumber: 'SN-VF200T-881923',
    mid: 'MID-44102931',
    tid: 'TID-03391',
    address: '9 Tampines Avenue 2, Singapore 529731',
    businessType: 'Automotive & Fuel',
    contactPerson: 'Ahmad bin Zakaria',
    phoneNumber: '+65 9456 7890',
    integrationType: 'Serial Port',
    assignedStaff: 'Marcus Vance',
    staffId: '1088',
    status: 'Pending',
    isPosTerminalUat: true,
    posTerminalUatStatus: 'Pending Return',
    posModel: 'Verifone V200t ECR',
    uatLoanDate: '2026-10-27',
    uatExpectedReturnDate: '2026-11-04',
    remarks: 'Forecourt pump controller RS-485 to RS-232 converter bridge required.',
    createdAt: '2026-10-27T10:15:00.000Z',
    updatedAt: '2026-10-30T15:00:00.000Z',
    statusLogs: [
      {
        id: 'LOG-601',
        previousStatus: 'In Progress',
        newStatus: 'Pending',
        person: 'Marcus Vance',
        staffId: '1088',
        timestamp: '2026-10-30T15:00:00.000Z',
        remarks: 'Pending merchant replacement of serial cable port on Gilbarco pump console.',
      },
    ],
  },
  {
    id: 'REQ-2026-107',
    merchantName: 'Old Chang Kee',
    outletName: 'Bugis Junction B1 Kiosk',
    serialNumber: 'SN-PAX920-554109',
    mid: 'MID-66291048',
    tid: 'TID-08819',
    address: '200 Victoria St, #B1-K02 Bugis Junction, Singapore 188021',
    businessType: 'F&B / Quick Service',
    contactPerson: 'Tan Mei Ling',
    phoneNumber: '+65 9567 8901',
    integrationType: 'Wireless',
    assignedStaff: 'Sarah Jenkins',
    staffId: '1070',
    status: 'Completed',
    isPosTerminalUat: false,
    posTerminalUatStatus: 'Not Applicable',
    posModel: 'PAX A920 Compact',
    remarks: 'Compact POS integration with Raptor POS terminal over 4G SIM.',
    createdAt: '2026-10-18T14:00:00.000Z',
    updatedAt: '2026-10-21T18:00:00.000Z',
    statusLogs: [
      {
        id: 'LOG-701',
        previousStatus: 'Testing',
        newStatus: 'Completed',
        person: 'Sarah Jenkins',
        staffId: '1070',
        timestamp: '2026-10-21T18:00:00.000Z',
        remarks: 'Live payment successfully processed. Staff trained on settlement sequence.',
      },
    ],
  },
  {
    id: 'REQ-2026-108',
    merchantName: 'Kinokuniya Bookstores',
    outletName: 'Ngee Ann City Main Store',
    serialNumber: 'SN-CASTLE-229104',
    mid: 'MID-11928471',
    tid: 'TID-02293',
    address: '391 Orchard Road, #04-20/20B/20C Takashimaya S.C., Singapore 238872',
    businessType: 'Retail & Bookstore',
    contactPerson: 'Kenji Sato',
    phoneNumber: '+65 6737 5021',
    integrationType: 'IP',
    assignedStaff: 'Alexander Wong',
    staffId: '1042',
    status: 'Rejected / Cancelled',
    isPosTerminalUat: true,
    posTerminalUatStatus: 'Returned',
    posModel: 'Castles VEGA3000 PinPad',
    uatLoanDate: '2026-10-05',
    uatExpectedReturnDate: '2026-10-18',
    uatActualReturnDate: '2026-10-19',
    remarks: 'Merchant postponed ERP upgrade to Q2 next year. Cancelled integration request.',
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-19T11:00:00.000Z',
    statusLogs: [
      {
        id: 'LOG-801',
        previousStatus: 'In Progress',
        newStatus: 'Rejected / Cancelled',
        person: 'Alexander Wong',
        staffId: '1042',
        timestamp: '2026-10-19T11:00:00.000Z',
        remarks: 'Cancelled by merchant management. UAT test terminal returned and inspected.',
        uatStatusChange: {
          from: 'Pending Return',
          to: 'Returned',
          returnDate: '2026-10-19',
        },
      },
    ],
  },
];

export function getStoredRequests(): MerchantRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored requests:', err);
    return INITIAL_REQUESTS;
  }
}

export function saveStoredRequests(requests: MerchantRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save requests:', err);
  }
}

export function getStoredTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TELEGRAM_CONFIG);
    if (!raw) return DEFAULT_TELEGRAM_CONFIG;
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_TELEGRAM_CONFIG;
  }
}

export function saveStoredTelegramConfig(cfg: TelegramConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_TELEGRAM_CONFIG, JSON.stringify(cfg));
  } catch (err) {
    console.error('Failed to save telegram config:', err);
  }
}

export function getStoredTelegramLogs(): TelegramDeliveryLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TELEGRAM_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function appendTelegramLog(log: TelegramDeliveryLog) {
  try {
    const existing = getStoredTelegramLogs();
    const updated = [log, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem(STORAGE_KEY_TELEGRAM_LOGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save telegram log:', err);
  }
}

export const DEFAULT_STAFF_USERS: UserProfile[] = [
  {
    id: 'USR-222222',
    name: 'Nget Monioudom',
    staffId: '222222',
    email: 'monioudom.n@pos-integration.com',
    role: 'Lead Integration Engineer',
    avatarInitials: 'NM',
    department: 'POS Core Integration & UAT',
  },
  {
    id: 'USR-1042',
    name: 'KIM samart',
    staffId: '1042',
    email: 'samart.kim@pos-integration.com',
    role: 'POS Integration Specialist',
    avatarInitials: 'KS',
    department: 'Merchant Engineering',
  },
  {
    id: 'USR-1088',
    name: 'Marcus Vance',
    staffId: '1088',
    email: 'marcus.v@pos-integration.com',
    role: 'Technical Support',
    avatarInitials: 'MV',
    department: 'Hardware Support & Serial ECR',
  },
  {
    id: 'USR-1001',
    name: 'Operations Supervisor',
    staffId: '1001',
    email: 'ops.lead@pos-integration.com',
    role: 'Operations Supervisor',
    avatarInitials: 'OS',
    department: 'Central Clearing & Intake Desk',
  },
  {
    id: 'USR-000001',
    name: 'System Admin',
    staffId: '000001',
    email: 'admin@pos-integration.com',
    role: 'System Admin',
    avatarInitials: 'SA',
    department: 'IT Infrastructure & Security',
  },
];

export function getStoredCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw === 'signed_out') {
      return null;
    }
    if (!raw) {
      // Default to the primary staff member (Nget Monioudom) so it's ready out of the box
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(DEFAULT_STAFF_USERS[0]));
      return DEFAULT_STAFF_USERS[0];
    }
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_STAFF_USERS[0];
  }
}

export function saveStoredCurrentUser(user: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save current user:', err);
  }
}

export function removeStoredCurrentUser() {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, 'signed_out');
  } catch (err) {
    console.error('Failed to clear current user:', err);
  }
}

export const INITIAL_NOTIFICATIONS: GroupNotification[] = [
  {
    id: 'NOTIF-101',
    senderName: 'Seth Daka',
    senderAvatar: 'SD',
    senderRole: 'Store Manager',
    groupName: '@pos_integration_core',
    message: '@Nget Monioudom Urgent: The Starbucks 313 Quayside installation requires IP dual-homing setup and POS stand today!',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isRead: false,
    isMention: true,
    keywords: ['POS', 'Installation', 'Urgent'],
    relatedRequestId: 'REQ-2026-098',
  },
  {
    id: 'NOTIF-102',
    senderName: 'KIM samart',
    senderAvatar: 'KS',
    senderRole: 'POS Specialist',
    groupName: '@pos_integration_core',
    message: 'Routine maintenance and firmware update patch deployed for PAX A920 POS terminals across all retail outlets.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false,
    isMention: false,
    keywords: ['POS', 'Maintenance'],
  },
  {
    id: 'NOTIF-103',
    senderName: 'Operations Supervisor',
    senderAvatar: 'OS',
    senderRole: 'Supervisor',
    groupName: 'Central Intake Desk',
    message: '@Nget Monioudom Please review the UAT POS terminal return schedule for VB Coffee before 5 PM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isRead: false,
    isMention: true,
    keywords: ['POS', 'Maintenance'],
    relatedRequestId: 'REQ-2026-099',
  },
  {
    id: 'NOTIF-104',
    senderName: 'Marcus Vance',
    senderAvatar: 'MV',
    senderRole: 'Hardware Support',
    groupName: '@cambodia_pos_alerts',
    message: 'Installation cable kits (RS-232 serial + USB adapters) are stocked in storage cabinet B.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    isRead: true,
    isMention: false,
    keywords: ['Installation'],
  },
];

export function detectKeywords(text: string): NotificationKeyword[] {
  const lower = text.toLowerCase();
  const keywords: NotificationKeyword[] = [];
  
  if (lower.includes('pos') || lower.includes('terminal') || lower.includes('smartpos') || lower.includes('ecr')) {
    keywords.push('POS');
  }
  if (lower.includes('install') || lower.includes('setup') || lower.includes('deploy') || lower.includes('cable') || lower.includes('commissioning')) {
    keywords.push('Installation');
  }
  if (lower.includes('maintain') || lower.includes('maintenance') || lower.includes('repair') || lower.includes('firmware') || lower.includes('patch') || lower.includes('fix')) {
    keywords.push('Maintenance');
  }
  if (lower.includes('urgent') || lower.includes('critical') || lower.includes('asap') || lower.includes('emergency') || lower.includes('alert') || lower.includes('immediately')) {
    keywords.push('Urgent');
  }
  if (keywords.length === 0) {
    keywords.push('General');
  }
  return keywords;
}

export function checkIsMention(text: string, userName?: string): boolean {
  if (!userName || !userName.trim()) return false;
  const lowerText = text.toLowerCase();
  const lowerName = userName.toLowerCase().trim();
  
  if (lowerText.includes(lowerName) || lowerText.includes(`@${lowerName.replace(/\s+/g, '')}`)) {
    return true;
  }
  
  const parts = lowerName.split(' ').filter((p) => p.length >= 3);
  for (const part of parts) {
    if (lowerText.includes(part)) {
      return true;
    }
  }
  
  if (lowerText.includes('@here') || lowerText.includes('@all') || lowerText.includes('@everyone')) {
    return true;
  }
  
  return false;
}

export function getStoredNotifications(): GroupNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: GroupNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifs));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}
