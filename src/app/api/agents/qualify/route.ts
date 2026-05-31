/**
 * Test endpoint — simula una conversación con el Lead Qualifier sin WhatsApp real.
 * Solo disponible fuera de producción.
 *
 * POST /api/agents/qualify
 * {
 *   "phone": "+593999000000",
 *   "message": "Hola, quiero comprar un departamento",
 *   "channel": "web",          // optional, default "web"
 *   "conversationId": "uuid"   // optional, omit to start fresh
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runLeadQualifier, buildAiSummary } from "@/agents/lead-qualifier";
import type { ConversationMessage, ConversationState } from "@/agents/lead-qualifier";
import { logAgentCall } from "@/agents/shared/logger";
import { DEFAULT_MODEL } from "@/agents/shared/claude";

export async function POST(req: NextRequest): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const body = await req.json() as {
    phone?: string;
    message: string;
    channel?: "whatsapp" | "web";
    conversationId?: string;
    source?: string;
  };

  if (!body.message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const channel = body.channel ?? "web";
  const phone = body.phone ?? "test-" + Date.now();
  const source = body.source ?? channel;

  // Load or init conversation
  let existingConvo = null;
  if (body.conversationId) {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", body.conversationId)
      .single();
    existingConvo = data;
  }

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

  // Find or create lead
  let leadId: string | undefined;
  if (phone && !phone.startsWith("test-")) {
    const { data: existingLead } = await supabase
      .from("leads")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (!existingLead) {
      const { data: newLead } = await supabase
        .from("leads")
        .insert({ phone, source, status: "new" })
        .select("id")
        .single();
      leadId = newLead?.id;
    } else {
      leadId = existingLead.id;
    }
  }

  const updatedMessages: ConversationMessage[] = [
    ...history,
    { role: "user", content: body.message, timestamp: new Date().toISOString() },
  ];

  // Run agent
  const start = Date.now();
  let agentResult: Awaited<ReturnType<typeof runLeadQualifier>> | undefined;
  let agentError: Error | undefined;

  try {
    agentResult = await runLeadQualifier({
      conversationId: existingConvo?.id ?? "test",
      leadId,
      phone,
      channel,
      source,
      messages: updatedMessages,
      state,
    });
  } catch (e) {
    agentError = e as Error;
    console.error("[qualify] Agent error:", e);
  }

  const output = agentResult?.output ?? {
    action: "escalate" as const,
    message: "Hubo un error. Te conecto con un asesor.",
    extracted_data: {},
    updated_state: { ...state, turn_count: state.turn_count + 1 },
    score: 0,
  };

  // Persist conversation
  const replyMessage: ConversationMessage = {
    role: "assistant",
    content: output.message,
    timestamp: new Date().toISOString(),
  };
  const finalMessages = [...updatedMessages, replyMessage];

  const convoPayload = {
    lead_id: leadId ?? null,
    channel,
    phone,
    state: output.updated_state as unknown as Record<string, unknown>,
    messages: finalMessages as unknown[],
  };

  let savedConvoId = existingConvo?.id;
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

  // Log
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

  // Update lead if qualified
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

  return NextResponse.json({
    conversationId: savedConvoId,
    reply: output.message,
    action: output.action,
    score: output.score,
    collected: output.updated_state.collected,
    turn: output.updated_state.turn_count,
    latencyMs: Date.now() - start,
  });
}
