export type IntegrationType = 'IP' | 'Serial Port' | 'Wireless';

export type RequestStatus = 
  | 'New'
  | 'Pending'
  | 'In Progress'
  | 'Testing'
  | 'Completed'
  | 'Rejected / Cancelled';

export type UatTerminalStatus = 'Pending Return' | 'Returned' | 'Not Applicable';

export interface StatusLog {
  id: string;
  previousStatus: RequestStatus;
  newStatus: RequestStatus;
  person: string;
  staffId: string;
  timestamp: string; // ISO format
  remarks: string;
  uatStatusChange?: {
    from: UatTerminalStatus;
    to: UatTerminalStatus;
    returnDate?: string;
  };
}

export interface MerchantRequest {
  id: string; // e.g. REQ-2026-001
  merchantName: string;
  outletName: string;
  serialNumber: string; // POS Terminal Serial Number
  mid: string; // Merchant ID
  tid: string; // Terminal ID
  address: string;
  googleMap?: string;
  businessType: string;
  contactPerson: string;
  phoneNumber: string;
  integrationType: IntegrationType;
  assignedStaff: string;
  staffId: string;
  status: RequestStatus;
  
  // POS UAT Terminal Details
  isPosTerminalUat: boolean;
  posTerminalUatStatus: UatTerminalStatus;
  posModel?: string;
  uatLoanDate?: string;
  uatExpectedReturnDate?: string;
  uatActualReturnDate?: string;

  // Telegram Group / Destination
  telegramGroup?: string;

  remarks: string;
  createdAt: string;
  updatedAt: string;
  statusLogs: StatusLog[];
}

export interface TelegramConfig {
  botToken: string;
  chatIdOrUsername: string; // e.g., @group_name or -100123456789
  autoNotifyOnNewRequest: boolean;
  autoNotifyOnStatusUpdate: boolean;
  fieldSeparator?: 'dash' | 'colon'; // whether to use " - " or ": "
  configuredAt?: string;
}

export interface TelegramDeliveryLog {
  id: string;
  timestamp: string;
  trigger: 'New Request' | 'Status Update' | 'Test Ping' | 'Manual Resend' | 'Manual Send';
  recipient: string;
  status: 'Sent' | 'Failed' | 'Simulated';
  messageSummary: string;
  rawResponse?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  staffId: string;
  email: string;
  role: 'Lead Integration Engineer' | 'POS Integration Specialist' | 'Technical Support' | 'Operations Supervisor' | 'System Admin';
  avatarInitials: string;
  department: string;
  lastLoginAt?: string;
}

export type NotificationKeyword = 'POS' | 'Installation' | 'Maintenance' | 'Urgent' | 'General';

export interface GroupNotification {
  id: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  groupName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isMention: boolean;
  keywords: NotificationKeyword[];
  relatedRequestId?: string;
}
