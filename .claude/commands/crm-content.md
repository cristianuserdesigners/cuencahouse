# Content Agent — CuencaHouse

Guía para construir y usar el Content Agent. Genera copy listo para publicar a partir de datos de propiedades.

---

## Por qué existe este agente

Cuenca House opera con estrategia social-first: TikTok + Instagram + WhatsApp → leads.
Verónica graba los tours; el agente convierte los datos de la propiedad en copy para cada canal en segundos.

---

## Formatos soportados

| Formato | Output | Canal |
|---------|--------|-------|
| `listing_es` | Descripción completa (150-200 palabras) | Sitio web, Plusvalía |
| `listing_en` | Descripción en inglés para expats | Sitio web (ruta /en/) |
| `tiktok_hook` | Gancho de apertura (primeras 2 segundas del video) | TikTok |
| `tiktok_caption` | Caption + hashtags | TikTok |
| `instagram_caption` | Caption + emojis + hashtags | Instagram Reels/Feed |
| `whatsapp_intro` | Mensaje de presentación de propiedad para enviar al lead | WhatsApp |
| `whatsapp_followup` | Mensaje de seguimiento post-visita | WhatsApp |

---

## Input de la propiedad

```typescript
type ContentInput = {
  property: {
    title: string;
    type: "apartment" | "house" | "land" | "office" | "commercial";
    operation: "sale" | "rent";
    line: "rentas" | "proyectos" | "segunda" | "vip";
    price: number;
    area_m2?: number;
    bedrooms?: number;
    bathrooms?: number;
    neighborhood: string;
    features: string[];                // ["piscina", "parqueadero", "terraza", ...]
    highlights?: string;               // Nota libre de Verónica: "vista al río, remodelada 2025"
  };
  format: ContentFormat;
  tone?: "warm" | "premium" | "urgency";    // default: warm
  target?: "local" | "expat" | "investor";  // default: local
};
```

---

## Prompts por formato

### listing_es / listing_en

```typescript
export const LISTING_PROMPT = (lang: "es" | "en") => `
Eres el copywriter de Cuenca House, inmobiliaria en Cuenca, Ecuador.
Escribe una descripción de propiedad en ${lang === "es" ? "español" : "English"}.

REGLAS:
- 150-200 palabras
- Empieza con el beneficio o la emoción, no con los metros cuadrados
- Menciona el barrio y qué se vive ahí (no solo la dirección)
- Incluye los features más llamativos
- Termina con call to action suave: "Agenda tu visita hoy"
- Tono: cercano, confiable, sin tecnicismos
- NUNCA uses frases genéricas como "hermosa propiedad" o "excelente ubicación" sin justificarlo

DATOS DE LA PROPIEDAD:
{property_data}
`.trim();
```

### tiktok_hook

El hook es lo más crítico — determina si el video se ve completo.

```typescript
export const TIKTOK_HOOK_PROMPT = `
Genera 3 opciones de hook para TikTok (máximo 10 palabras cada uno).
El hook aparece como texto sobreimpreso en el primer segundo del video.

Tipos que funcionan:
- Pregunta sorpresa: "¿Sabías que puedes vivir aquí por $X/mes?"
- Dato impactante: "Esta casa en [barrio] bajó $30k esta semana"
- Comparación: "En Cuenca, con lo que pagas de arriendo en [ciudad], compras esto"
- Expectativa vs realidad: "[Barrio] no es lo que crees"

DATOS DE LA PROPIEDAD:
{property_data}

Devuelve JSON: { hooks: ["...", "...", "..."] }
`.trim();
```

### whatsapp_intro

```typescript
export const WHATSAPP_INTRO_PROMPT = `
Escribe un mensaje de WhatsApp para presentar una propiedad a un prospecto.

REGLAS:
- Máximo 5 líneas
- Tono conversacional, como si fuera Verónica escribiendo
- Incluye precio y 2-3 features clave
- Termina invitando a agendar visita o ver fotos
- NO uses bullet points ni formato markdown — WhatsApp es texto plano
- NO empieces con "Hola" si ya hay conversación previa

CONTEXTO DEL PROSPECTO:
{lead_context}

DATOS DE LA PROPIEDAD:
{property_data}
`.trim();
```

---

## Arquitectura del agente

```typescript
// src/agents/content/agent.ts
export async function runContentAgent(input: ContentInput): Promise<ContentOutput> {
  const prompt = buildPrompt(input.format, input.property, input.target);
  
  const response = await claude.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1024,
    system: getSystemPrompt(input.format, input.tone),
    messages: [{ role: "user", content: prompt }],
  });
  
  return {
    format: input.format,
    content: extractContent(response, input.format),
    property_id: input.property.id,
    generated_at: new Date().toISOString(),
  };
}
```

---

## UI en el CRM

En la ficha de cada propiedad (`/properties/[id]`), sección "Contenido":

```
[ Listing ES ]  [ Listing EN ]  [ TikTok ]  [ Instagram ]  [ WhatsApp ]
                            ↓
                  [Generar con IA]
                            ↓
             Copy generado — editable antes de copiar
```

- El agente genera el primer borrador
- Verónica edita en el CRM si quiere
- Botón "Copiar" para pegar directo en Instagram / TikTok / WhatsApp

---

## Patrones de contenido que funcionan (del benchmark)

Los formatos con mayor engagement en inmobiliarias LATAM:
1. **Property tour vertical** — 30-60s, voz de Verónica en off → el Content Agent genera el script
2. **Tips de inversión** — educa al seguidor joven → su familia decide → el agente genera la narrativa
3. **Glosario de barrio** — qué hay alrededor, cómo se vive → el agente lo incluye en la descripción
4. **Historias de cierre** — el cliente narra su experiencia → el agente lo formatea como caption

El hook de TikTok en 2 segundos es el factor más crítico de conversión.
