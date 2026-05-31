# CRM Agent Patterns — CuencaHouse

Guía para construir, modificar y testear agentes IA en este proyecto.

---

## Arquitectura de agentes

Cada agente vive en `src/agents/<nombre>/` con esta estructura:
```
src/agents/lead-qualifier/
  agent.ts      # Orquestador principal — función pura, sin side effects
  prompts.ts    # System prompt y templates
  types.ts      # Tipos de input/output/estado
  index.ts      # Export público
```

El agente NO:
- Escribe a la BD directamente (eso lo hace el caller en `app/api/`)
- Maneja HTTP (eso es del webhook handler)
- Tiene estado global — recibe contexto y devuelve resultado

---

## Claude API — Patrón estándar

```typescript
// src/agents/shared/claude.ts
import Anthropic from "@anthropic-ai/sdk";

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Siempre usar claude-sonnet-4-6 salvo justificación explícita
export const DEFAULT_MODEL = "claude-sonnet-4-6";
```

```typescript
// src/agents/lead-qualifier/agent.ts
import { claude, DEFAULT_MODEL } from "../shared/claude";
import { QUALIFIER_SYSTEM_PROMPT } from "./prompts";
import type { QualifierInput, QualifierOutput, ConversationMessage } from "./types";

export async function runLeadQualifier(
  input: QualifierInput
): Promise<QualifierOutput> {
  const response = await claude.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    system: QUALIFIER_SYSTEM_PROMPT,
    messages: input.conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  
  // Siempre pedir JSON estructurado al modelo
  return parseQualifierResponse(text);
}
```

---

## Prompts — Reglas

1. **System prompt en archivo separado** (`prompts.ts`) — nunca inline en el agente
2. **Pedir siempre JSON estructurado** — incluir schema en el prompt
3. **Idioma:** El agente habla con prospectos en **español** (Cuenca, Ecuador)
4. **Tone:** Cálido, profesional, conciso. No robótico. Máximo 2 oraciones por respuesta al usuario.
5. **Incluir en el system prompt:** quién es el agente, qué datos debe recopilar, cuándo parar

### Template de system prompt para agentes conversacionales

```typescript
// src/agents/lead-qualifier/prompts.ts
export const QUALIFIER_SYSTEM_PROMPT = `
Eres un asistente de CuencaHouse, inmobiliaria en Cuenca, Ecuador.
Tu objetivo es calificar prospectos de forma natural y amigable.

DATOS A RECOPILAR (en este orden):
1. Intención: ¿comprar, vender o arrendar?
2. Tipo de propiedad: casa, departamento, terreno, local comercial
3. Zona preferida en Cuenca
4. Presupuesto aproximado (en USD)
5. Urgencia: ¿para cuándo lo necesita?

REGLAS:
- Haz UNA sola pregunta a la vez
- Sé natural — adapta la conversación al tono del prospecto
- Si ya tienes un dato, no lo vuelvas a preguntar
- Cuando tengas los 5 datos, responde con ACTION: "qualified"

RESPONDE SIEMPRE EN ESTE JSON:
{
  "message": "texto que le dices al prospecto",
  "action": "ask_next" | "qualified" | "needs_clarification",
  "extracted_data": {
    "intent": "buy" | "sell" | "rent" | null,
    "property_type": "apartment" | "house" | "land" | "commercial" | null,
    "location_preference": "string" | null,
    "budget_min": number | null,
    "budget_max": number | null,
    "urgency": "immediate" | "1_3m" | "3_6m" | "6m_plus" | null
  }
}
`.trim();
```

---

## State machine del agente conversacional

El estado de la conversación se persiste en `conversations` table de Supabase:

```typescript
type ConversationState = {
  step: "greeting" | "qualifying" | "qualified" | "handoff";
  collected: Partial<LeadQualificationData>;
  turn_count: number;
};
```

Flujo:
```
nueva_conversación
  → greeting (bienvenida + primera pregunta)
  → qualifying (loop: pregunta → respuesta → extrae dato → siguiente)
  → qualified (todos los datos recopilados → crea/actualiza Lead en BD)
  → handoff (notifica al agente humano)
```

---

## Webhook de WhatsApp (Meta Cloud API)

```typescript
// src/app/api/webhooks/whatsapp/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  
  // 1. Verificar signature de Meta
  // 2. Extraer mensaje del payload
  // 3. Cargar conversación existente o crear nueva
  // 4. Llamar a runLeadQualifier(input)
  // 5. Guardar estado actualizado en Supabase
  // 6. Enviar respuesta via Meta API
  // 7. Si action === "qualified": actualizar Lead + notificar agente
}
```

---

## Testing de agentes

Para testear sin WhatsApp real:
```bash
# En Postman o curl — simula una conversación
POST /api/agents/qualify
{
  "channel": "web",
  "phone": "+593999000000",
  "message": "Hola, quiero comprar un departamento"
}
```

Crear `src/agents/lead-qualifier/__tests__/agent.test.ts` con conversaciones de prueba:
- Prospecto que da todos los datos rápido
- Prospecto evasivo que no quiere dar presupuesto
- Prospecto que cambia de opinión a mitad

---

## Manejo de errores en agentes

```typescript
// Siempre envolver llamadas a Claude en try/catch
try {
  const result = await runLeadQualifier(input);
  return result;
} catch (error) {
  console.error("[lead-qualifier] Error:", { leadId, turn: input.turnCount, error });
  return { action: "escalate", message: "Lo conectaré con un asesor de inmediato." };
}
```

---

## Logging de agentes (OBLIGATORIO en todos los agentes)

Cada llamada a Claude debe guardarse en `agent_logs`. Esto es crítico para debuggear comportamientos raros.

```typescript
// src/agents/shared/logger.ts
import { createClient } from "@/lib/supabase/server";

export async function logAgentCall({
  agent,
  conversationId,
  leadId,
  input,
  output,
  model,
  usage,
  latencyMs,
  error,
}: AgentLogParams) {
  const supabase = createClient();
  await supabase.from("agent_logs").insert({
    agent,
    conversation_id: conversationId,
    lead_id: leadId,
    input,
    output,
    model,
    prompt_tokens: usage?.input_tokens,
    completion_tokens: usage?.output_tokens,
    latency_ms: latencyMs,
    error: error?.message ?? null,
  });
}
```

```typescript
// Uso en el agente — siempre loggear, incluso en errores
const start = Date.now();
let output, error;
try {
  output = await runLeadQualifier(input);
} catch (e) {
  error = e as Error;
  output = { action: "escalate", message: "Lo conectaré con un asesor." };
} finally {
  await logAgentCall({
    agent: "lead-qualifier",
    conversationId: input.conversationId,
    leadId: input.leadId,
    input: { messages: input.conversationHistory, state: input.state },
    output: output ?? {},
    model: DEFAULT_MODEL,
    usage: response?.usage,
    latencyMs: Date.now() - start,
    error,
  });
}
```

---

## Eval set — marcar ejemplos buenos y malos

En el CRM, en la vista de un lead, cada respuesta del agente tiene botones:
- 👍 (guardar como ejemplo bueno)
- 👎 (marcar como malo + opción de escribir qué debería haber respondido)

```typescript
// Server Action: etiquetar un log
export async function tagAgentLog(
  logId: string,
  label: "good" | "bad" | "edge_case",
  note?: string,
  expectedOutput?: object
) {
  const supabase = createClient();
  await supabase.from("agent_evals").insert({
    agent: "lead-qualifier",
    log_id: logId,
    label,
    note,
    expected_output: expectedOutput ?? null,
    tagged_by: "veronica", // o detectar usuario autenticado
  });
}
```

**Cómo usar el eval set para mejorar prompts:**
1. Cuando cambies el system prompt, corre el agente sobre todos los `agent_evals` con `label = 'bad'`
2. Compara si el output nuevo coincide con `expected_output`
3. Verifica que los `label = 'good'` sigan siendo buenos con el nuevo prompt
4. Si mejora sin regresar → merge del nuevo prompt

---

## Human-in-the-loop (HITL) — decisiones de alto impacto

Para acciones que el agente NO debe ejecutar solo: enviar precio de oferta, confirmar reserva, reasignar lead.

```typescript
// src/agents/shared/hitl.ts
export async function requestApproval({
  agent,
  leadId,
  dealId,
  action,
  payload,
  reason,
  expiresInHours = 2,
}: HitlRequest): Promise<{ approvalId: string }> {
  const supabase = createClient();
  const { data } = await supabase
    .from("agent_approvals")
    .insert({
      agent,
      lead_id: leadId,
      deal_id: dealId,
      action,
      payload,
      reason,
      expires_at: new Date(Date.now() + expiresInHours * 3_600_000).toISOString(),
    })
    .select("id")
    .single();

  // Notificar a Verónica (WhatsApp o push en el CRM)
  await notifyAgent({
    message: `⚠️ Acción pendiente de aprobación: ${action}\n${reason}`,
    approvalId: data.id,
  });

  return { approvalId: data.id };
}
```

**Regla: el agente llama a `requestApproval` y responde al lead:**
```
"Estoy revisando eso con mi equipo. Te confirmo en menos de 2 horas."
```

**Acciones que siempre requieren HITL (al menos en los primeros 3 meses):**
- Enviar precio de oferta o contraoferta
- Confirmar reserva de propiedad
- Comprometer una fecha de visita (agente puede sugerir, no confirmar)
- Compartir datos de aliados externos

**El dashboard del CRM muestra una sección "Pendientes de aprobar"** con los `agent_approvals` en status `pending`, ordenados por `expires_at`.
