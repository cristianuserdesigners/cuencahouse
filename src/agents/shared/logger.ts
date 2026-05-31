import { createAdminClient } from "@/lib/supabase/admin";

type AgentLogParams = {
  agent: string;
  conversationId?: string;
  leadId?: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  model: string;
  usage?: { input_tokens?: number; output_tokens?: number };
  latencyMs: number;
  error?: Error | null;
};

export async function logAgentCall(params: AgentLogParams): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("agent_logs").insert({
      agent: params.agent,
      conversation_id: params.conversationId ?? null,
      lead_id: params.leadId ?? null,
      input: params.input,
      output: params.output,
      model: params.model,
      prompt_tokens: params.usage?.input_tokens ?? null,
      completion_tokens: params.usage?.output_tokens ?? null,
      latency_ms: params.latencyMs,
      error: params.error?.message ?? null,
    });
  } catch (e) {
    // Logging nunca debe crashear el agente
    console.error("[logger] Failed to save agent log:", e);
  }
}
