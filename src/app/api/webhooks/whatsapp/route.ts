import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runLeadQualifier, buildAiSummary } from "@/agents/lead-qualifier";
import type { ConversationMessage, ConversationState } from "@/agents/lead-qualifier";
import { logAgentCall } from "@/agents/shared/logger";
import {
  sendWhatsAppMessage,
  markAsRead,
  extractInboundMessage,
  verifyWebhookSignature,
} from "@/lib/whatsapp";
import { DEFAULT_MODEL } from "@/agents/shared/claude";

// GET — Meta webhook verification challenge
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// POST — incoming WhatsApp messages
export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();

  // Verify signature in production
  if (process.env.NODE_ENV === "production") {
    const valid = await verifyWebhookSignature(req, rawBody);
    if (!valid) return new Response("Unauthorized", { status: 401 });
  }

  const body = JSON.parse(rawBody) as Record<string, unknown>;

  // Meta sends test pings with no messages — return 200 immediately
  const inbound = extractInboundMessage(body);
  if (!inbound) return NextResponse.json({ ok: true });

  // Mark as read so the sender sees the double blue tick
  markAsRead(inbound.messageId).catch(() => {});

  const supabase = await createClient();

  // ── 1. Find or create conversation ─────────────────────────────────────────
  const { data: existingConvo } = await supabase
    .from("conversations")
    .select("*")
    .eq("phone", inbound.phone)
    .eq("channel", "whatsapp")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const initialState: ConversationState = {
    step: "greeting",
    collected: {},
    turn_count: 0,
    language: "es",
  };

  const state: ConversationState =
    (existingConvo?.state as ConversationState) ?? initialState;
  const history: ConversationMessage[] =
    (existingConvo?.messages as ConversationMessage[]) ?? [];

  // ── 2. Find or create lead ─────────────────────────────────────────────────
  let leadId: string | undefined;
  const { data: existingLead } = await supabase
    .from("leads")
    .select("id")
    .eq("phone", inbound.phone)
    .maybeSingle();

  if (!existingLead) {
    const { data: newLead } = await supabase
      .from("leads")
      .insert({ phone: inbound.phone, source: "whatsapp", status: "new" })
      .select("id")
      .single();
    leadId = newLead?.id;
  } else {
    leadId = existingLead.id;
  }

  // ── 3. Append inbound message ──────────────────────────────────────────────
  const updatedMessages: ConversationMessage[] = [
    ...history,
    { role: "user", content: inbound.text, timestamp: inbound.timestamp },
  ];

  // ── 4. Run agent ───────────────────────────────────────────────────────────
  const conversationId = existingConvo?.id;
  const start = Date.now();
  let agentResult:
    | Awaited<ReturnType<typeof runLeadQualifier>>
    | undefined;
  let agentError: Error | undefined;

  try {
    agentResult = await runLeadQualifier({
      conversationId: conversationId ?? "pending",
      leadId,
      phone: inbound.phone,
      channel: "whatsapp",
      source: "whatsapp",
      messages: updatedMessages,
      state,
    });
  } catch (e) {
    agentError = e as Error;
  }

  const output = agentResult?.output ?? {
    action: "escalate" as const,
    message:
      state.language === "en"
        ? "I'll connect you with an advisor right away."
        : "Te conecto con un asesor ahora mismo.",
    extracted_data: {},
    updated_state: { ...state, turn_count: state.turn_count + 1 },
    score: 0,
  };

  // ── 5. Persist conversation state ──────────────────────────────────────────
  const replyMessage: ConversationMessage = {
    role: "assistant",
    content: output.message,
    timestamp: new Date().toISOString(),
  };
  const finalMessages = [...updatedMessages, replyMessage];

  const convoPayload = {
    lead_id: leadId,
    channel: "whatsapp" as const,
    phone: inbound.phone,
    state: output.updated_state as unknown as Record<string, unknown>,
    messages: finalMessages as unknown[],
  };

  let savedConvoId = conversationId;
  if (existingConvo) {
    await supabase
      .from("conversations")
      .update({ ...convoPayload, updated_at: new Date().toISOString() })
      .eq("id", existingConvo.id);
  } else {
    const { data } = await supabase
      .from("conversations")
      .insert(convoPayload)
      .select("id")
      .single();
    savedConvoId = data?.id;
  }

  // ── 6. Log agent call ──────────────────────────────────────────────────────
  await logAgentCall({
    agent: "lead-qualifier",
    conversationId: savedConvoId,
    leadId,
    input: {
      messages: updatedMessages as unknown as Record<string, unknown>[],
      state: state as unknown as Record<string, unknown>,
    },
    output: output as unknown as Record<string, unknown>,
    model: DEFAULT_MODEL,
    usage: agentResult?.rawResponse.usage,
    latencyMs: Date.now() - start,
    error: agentError,
  });

  // ── 7. Handle "qualified" ──────────────────────────────────────────────────
  if (output.action === "qualified" && leadId) {
    const summary = buildAiSummary(
      output.updated_state.collected,
      output.updated_state.language
    );
    await supabase
      .from("leads")
      .update({
        status: "qualified",
        language: output.updated_state.language,
        segment: output.updated_state.collected.segment ?? "local",
        intent: output.updated_state.collected.intent,
        property_type: output.updated_state.collected.property_type,
        location_preference: output.updated_state.collected.location_preference,
        budget_min: output.updated_state.collected.budget_min ?? null,
        budget_max: output.updated_state.collected.budget_max ?? null,
        urgency: output.updated_state.collected.urgency,
        score: output.score,
        ai_summary: summary,
        ai_qualification: output.updated_state.collected as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId);
  }

  // ── 8. Send WhatsApp reply ─────────────────────────────────────────────────
  try {
    await sendWhatsAppMessage(inbound.phone, output.message);
  } catch (e) {
    console.error("[whatsapp webhook] Failed to send reply:", e);
  }

  return NextResponse.json({ ok: true });
}
