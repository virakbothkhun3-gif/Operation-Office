import { MerchantRequest, StatusLog, TelegramConfig, TelegramDeliveryLog } from '../types';

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '',
  chatIdOrUsername: '',
  autoNotifyOnNewRequest: true,
  autoNotifyOnStatusUpdate: true,
};

/**
 * Format notification for a newly inserted merchant request matching company standards
 */
export function formatNewRequestTelegramMessage(req: MerchantRequest): string {
  const contactStr = req.phoneNumber && req.phoneNumber !== '-'
    ? `${req.contactPerson} (${req.phoneNumber})`
    : req.contactPerson;

  const staffStr = req.staffId
    ? `${req.assignedStaff} (Staff ID: ${req.staffId})`
    : req.assignedStaff;

  const remarksStr = req.remarks && req.remarks.trim()
    ? req.remarks.trim()
    : 'Standard integration onboarding request.';

  const loggedTime = new Date(req.createdAt).toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const mapValue = req.googleMap && req.googleMap.trim() ? req.googleMap.trim() : 'N/A';
  const midLine = req.mid && req.mid.trim() ? `-MID : ${req.mid.trim()}` : '-MID ';
  const tidLine = req.tid && req.tid.trim() ? `-TID: ${req.tid.trim()}` : '-TID: ';

  return `📞NEW MERCHANT INTEGRATION REQUEST

 -Merchant Company : ${req.merchantName}
-Merchant Outlet: ${req.outletName}
-POS S/N : ${req.serialNumber}
${midLine}
${tidLine}
-Integration Type: ${req.integrationType}
-Merchant Business: ${req.businessType}
👤 Contact Person: ${contactStr}
-Address: ${req.address}
🗺️ Google Map: ${mapValue}
👨‍💼 Assigned Staff: ${staffStr}
-Current Status: ${req.status}
-Remarks: ${remarksStr}
-Logged At: ${loggedTime}`;
}

/**
 * Format notification for request status update
 */
export function formatStatusUpdateTelegramMessage(
  req: MerchantRequest,
  log: StatusLog
): string {
  const staffStr = log.staffId ? `${log.person} (Staff ID: ${log.staffId})` : log.person;
  const updateTime = new Date(log.timestamp).toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const uatNotice = log.uatStatusChange
    ? `\nUAT Terminal: ${log.uatStatusChange.from} -> ${log.uatStatusChange.to}`
    : '';

  return `MERCHANT INTEGRATION STATUS UPDATE
Merchant Company: ${req.merchantName}
Merchant Outlet: ${req.outletName}
POS S/N: ${req.serialNumber}
MID / TID: ${req.mid} / ${req.tid}

Status Transition:
  ${log.previousStatus} -> ${log.newStatus}${uatNotice}

👨‍💼 Updated By: ${staffStr}
Remarks: ${log.remarks}
Updated At: ${updateTime}
Internal Only`;
}

/**
 * Send message via Telegram Bot API or simulate if credentials are unconfigured
 */
export async function sendTelegramMessage(
  config: TelegramConfig,
  text: string,
  trigger: TelegramDeliveryLog['trigger'],
  summary: string
): Promise<{ success: boolean; log: TelegramDeliveryLog; error?: string }> {
  const cleanChatId = config.chatIdOrUsername.trim();
  const cleanToken = config.botToken.trim();

  // If credentials are provided, attempt real HTTP POST to Telegram Bot API
  if (cleanToken && cleanChatId) {
    try {
      const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: text,
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        const log: TelegramDeliveryLog = {
          id: `TG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          trigger,
          recipient: cleanChatId,
          status: 'Sent',
          messageSummary: summary,
          rawResponse: JSON.stringify(data.result),
        };
        return { success: true, log };
      } else {
        const errDesc = data.description || 'Failed to dispatch to Telegram API';
        const log: TelegramDeliveryLog = {
          id: `TG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          trigger,
          recipient: cleanChatId,
          status: 'Failed',
          messageSummary: `${summary} (Failed: ${errDesc})`,
          rawResponse: JSON.stringify(data),
        };
        return { success: false, log, error: errDesc };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Network error communicating with Telegram';
      const log: TelegramDeliveryLog = {
        id: `TG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        trigger,
        recipient: cleanChatId,
        status: 'Failed',
        messageSummary: `${summary} (Network Error: ${errorMessage})`,
      };
      return { success: false, log, error: errorMessage };
    }
  }

  // If no credentials configured yet, generate realistic simulated delivery log
  const log: TelegramDeliveryLog = {
    id: `TG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    trigger,
    recipient: cleanChatId || 'Not Configured (Demo Mode)',
    status: 'Simulated',
    messageSummary: `${summary} (Bot token not yet configured in settings)`,
  };

  return {
    success: true,
    log,
    error: 'Telegram Bot Token or Group ID not configured in settings. Message recorded in local Telegram log.',
  };
}
