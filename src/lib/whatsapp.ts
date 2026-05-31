const META_API_VERSION = "v19.0";
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<void> {
  const phoneId = process.env.META_WHATSAPP_PHONE_ID!;
  const token = process.env.META_WHATSAPP_TOKEN!;

  const res = await fetch(`${BASE_URL}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`WhatsApp API error: ${res.status} — ${error}`);
  }
}

// Mark incoming message as read (improves UX — shows double blue tick)
export async function markAsRead(messageId: string): Promise<void> {
  const phoneId = process.env.META_WHATSAPP_PHONE_ID!;
  const token = process.env.META_WHATSAPP_TOKEN!;

  await fetch(`${BASE_URL}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  });
}

// Extract message data from Meta's webhook payload
export type WhatsAppInboundMessage = {
  phone: string;       // sender's phone number (with country code, no +)
  messageId: string;
  text: string;
  timestamp: string;
};

export function extractInboundMessage(
  body: Record<string, unknown>
): WhatsAppInboundMessage | null {
  try {
    const entry = (body.entry as unknown[])?.[0] as Record<string, unknown>;
    const change = (entry?.changes as unknown[])?.[0] as Record<string, unknown>;
    const value = change?.value as Record<string, unknown>;
    const messages = value?.messages as unknown[];
    const msg = messages?.[0] as Record<string, unknown>;

    if (!msg || msg.type !== "text") return null;

    return {
      phone: msg.from as string,
      messageId: msg.id as string,
      text: (msg.text as Record<string, unknown>)?.body as string,
      timestamp: new Date((Number(msg.timestamp) * 1000)).toISOString(),
    };
  } catch {
    return null;
  }
}

// Verify Meta webhook signature
export async function verifyWebhookSignature(
  req: Request,
  rawBody: string
): Promise<boolean> {
  const signature = req.headers.get("x-hub-signature-256");
  if (!signature) return false;

  const secret = process.env.META_APP_SECRET!;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(rawBody)
  );
  const computed =
    "sha256=" +
    Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  return computed === signature;
}
