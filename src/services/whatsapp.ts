/**
 * Parse WhatsApp session data from URL query parameters.
 *
 * Expected URL shape:
 *   /menu?wa_phone=905321234567&wa_name=John+Doe&wa_token=abc123
 *
 * In production the token would be verified server-side.
 * For now we simply extract the values if present.
 */

export interface WhatsAppSession {
  phone: string;   // e.g. "+905321234567"
  name?: string;    // e.g. "John Doe"
  token: string;    // opaque session token
}

export function getWhatsAppSession(): WhatsAppSession | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const phone = params.get('wa_phone');
    const token = params.get('wa_token');

    if (!phone || !token) return null;

    // Normalise phone — ensure it starts with +
    const normalisedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    return {
      phone: normalisedPhone,
      name: params.get('wa_name') || undefined,
      token,
    };
  } catch {
    return null;
  }
}
