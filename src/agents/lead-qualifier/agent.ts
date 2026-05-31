import Anthropic from "@anthropic-ai/sdk";
import { claude, DEFAULT_MODEL } from "../shared/claude";
import { buildSystemPrompt, QUALIFIER_SYSTEM_PROMPT } from "./prompts";
import { calculateLeadScore, isQualified } from "./scoring";
import { formatPropertiesForAgent } from "@/lib/sheets";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  QualifierInput,
  QualifierOutput,
  ConversationState,
  RawQualifierResponse,
  LeadQualificationData,
} from "./types";

async function buildContextualSystemPrompt(input: QualifierInput): Promise<string> {
  // Si no hay workspaceId, usar el prompt base
  if (!input.workspaceId) return QUALIFIER_SYSTEM_PROMPT;

  const supabase = createAdminClient();

  // Fetch workspace config + available properties in parallel
  const [{ data: workspace }, { data: properties }] = await Promise.all([
    supabase
      .from("workspaces")
      .select("name, agent_name")
      .eq("id", input.workspaceId)
      .single(),
    supabase
      .from("properties")
      .select("external_code, title, type, operation, line, price, area_m2, bedrooms, bathrooms, neighborhood, city, photos_album_url, description")
      .eq("workspace_id", input.workspaceId)
      .eq("status", "available")
      .order("price", { ascending: true }),
  ]);

  return buildSystemPrompt({
    agentName: workspace?.agent_name ?? "Casa",
    workspaceName: workspace?.name ?? "Cuenca House",
    propertiesJson: properties?.length
      ? formatPropertiesForAgent(properties)
      : undefined,
  });
}

export async function runLeadQualifier(
  input: QualifierInput
): Promise<{ output: QualifierOutput; rawResponse: Anthropic.Message }> {
  const systemPrompt = await buildContextualSystemPrompt(input);

  const response = (await claude.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 600,
    system: systemPrompt,
    messages: input.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })) as Anthropic.Message;

  const text =
    response.content[0].type === "text" ? response.content[0].text : "{}";

  const raw = parseRawResponse(text);
  const output = buildOutput(raw, input);

  return { output, rawResponse: response };
}

// ─── Parser ──────────────────────────────────────────────────────────────────

function parseRawResponse(text: string): RawQualifierResponse {
  let jsonStr = text.trim();

  // Strip markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) jsonStr = fenceMatch[1].trim();

  // Extract first JSON object if there's surrounding prose
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) jsonStr = objectMatch[0];

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      message:
        typeof parsed.message === "string"
          ? parsed.message
          : "¿Me podría contar un poco más sobre lo que busca?",
      action: isValidAction(parsed.action) ? parsed.action : "ask_next",
      extracted_data:
        typeof parsed.extracted_data === "object" ? parsed.extracted_data : {},
    };
  } catch {
    return {
      message: "¿Me podría contar un poco más sobre lo que busca?",
      action: "ask_next",
      extracted_data: {},
    };
  }
}

function isValidAction(action: unknown): action is RawQualifierResponse["action"] {
  return ["ask_next", "qualified", "show_properties", "schedule_visit", "escalate", "needs_clarification"].includes(
    action as string
  );
}

// ─── State builder ────────────────────────────────────────────────────────────

function buildOutput(
  raw: RawQualifierResponse,
  input: QualifierInput
): QualifierOutput {
  // Merge newly extracted data with what was already collected
  const merged: Partial<LeadQualificationData> = {
    ...input.state.collected,
    ...Object.fromEntries(
      Object.entries(raw.extracted_data).filter(([, v]) => v != null)
    ),
  };

  const detectedLanguage =
    (raw.extracted_data.language as "es" | "en") ??
    input.state.language ??
    "es";

  const qualified = isQualified(merged);
  const action = qualified && raw.action !== "escalate" ? "qualified" : raw.action;

  const updatedState: ConversationState = {
    step:
      action === "qualified"
        ? "qualified"
        : action === "escalate"
        ? "handoff"
        : "qualifying",
    collected: merged,
    turn_count: input.state.turn_count + 1,
    language: detectedLanguage,
  };

  const score = calculateLeadScore(merged, input.source ?? "whatsapp");

  return {
    action,
    message: raw.message,
    extracted_data: raw.extracted_data,
    updated_state: updatedState,
    score,
  };
}
