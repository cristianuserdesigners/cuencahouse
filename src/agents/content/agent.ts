import { claude, DEFAULT_MODEL } from "@/agents/shared/claude";
import { logAgentCall } from "@/agents/shared/logger";
import type { ContentInput, GeneratedContent } from "./types";

const PRECIO_LABELS: Record<string, string> = {
  sale: "venta", rent: "arriendo", both: "venta o arriendo",
};

const TIPO_LABELS: Record<string, string> = {
  house: "casa", apartment: "departamento", office: "oficina",
  land: "terreno", commercial: "local comercial",
};

function buildPrompt(p: ContentInput): string {
  const precio = p.operacion === "rent"
    ? `$${p.precio.toLocaleString("es-EC")}/mes`
    : `$${p.precio.toLocaleString("es-EC")}`;

  const specs = [
    p.area_m2 ? `${p.area_m2} m²` : null,
    p.habitaciones ? `${p.habitaciones} hab` : null,
    p.banos ? `${p.banos} baños` : null,
  ].filter(Boolean).join(", ");

  const ubicacion = [p.sector, p.ciudad].filter(Boolean).join(", ");

  return `Eres el agente de contenido de Cuenca House, inmobiliaria en Ecuador. Genera copy profesional, moderno y cercano — tono Revolut/Wise adaptado al mercado ecuatoriano.

PROPIEDAD:
- Título: ${p.titulo}
- Tipo: ${TIPO_LABELS[p.tipo] ?? p.tipo}
- Operación: ${PRECIO_LABELS[p.operacion] ?? p.operacion}
- Precio: ${precio}
- Características: ${specs || "sin especificar"}
- Ubicación: ${ubicacion}
${p.descripcion ? `- Info adicional: ${p.descripcion}` : ""}
${p.linea === "vip" ? "- NOTA: Es una propiedad VIP/premium — tono exclusivo" : ""}

Genera exactamente estos 4 formatos en JSON:

{
  "descripcion_listing": "Descripción completa para el listing (150-200 palabras). Empieza por el beneficio principal, luego specs, luego ubicación y precio. Tono profesional pero humano. Sin bullets, en párrafos.",

  "hook_tiktok": "Hook para los primeros 3 segundos del video (máx 15 palabras). Debe generar curiosidad o sorpresa. Ejemplo de estructura: '¿Sabías que por $X puedes tener esto en [ciudad]? 👀'",

  "caption_instagram": "Caption completo para Instagram (80-120 palabras). Empieza con gancho, desarrolla los specs más atractivos, cierra con CTA ('Link en bio' o 'Escríbenos al WhatsApp'). Usa emojis con moderación. Incluye 8-10 hashtags relevantes al final en una línea separada.",

  "mensaje_whatsapp": "Mensaje directo y cálido para enviar a un prospecto interesado (50-70 palabras). Presenta la propiedad con los datos clave y una pregunta abierta para generar conversación. Sin formato markdown, solo texto plano."
}

Responde SOLO con el JSON, sin texto adicional.`;
}

export async function generatePropertyContent(
  property: ContentInput,
  workspaceId?: string
): Promise<GeneratedContent> {
  const prompt = buildPrompt(property);
  const startMs = Date.now();

  const response = await claude.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const latency = Date.now() - startMs;
  const rawText = response.content[0].type === "text" ? response.content[0].text : "";

  // Extraer JSON de la respuesta
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("El agente no devolvió JSON válido");

  const generated = JSON.parse(jsonMatch[0]) as GeneratedContent;

  await logAgentCall({
    agent: "content",
    input: { property, workspaceId },
    output: generated as unknown as Record<string, unknown>,
    model: DEFAULT_MODEL,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
    },
    latencyMs: latency,
  });

  return generated;
}
