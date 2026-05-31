# Cuenca House — CRM interno

## Qué es este proyecto
CRM interno para **Cuenca House** — inmobiliaria propia de Cris + Verónica en Cuenca, Ecuador.
Cuenca House NO es solo un cliente — es el negocio propio.

**Dominio:** cuenca.house | **Lanzamiento blando:** ~30 días desde 25/05/2026 (≈ 24 Jun 2026)

**Fundadores:**
- **Cristian** — tecnología, diseño, UX (usa este CRM + construye el producto)
- **Verónica** — experiencia inmobiliaria, comercial, asesoría crediticia y legal (usuario principal del CRM)

---

## Modelo de negocio (afecta el dominio del CRM)

**Comisiones:**
- Venta: 3% (mínimo 2% según constructora/valor) — en alianza: 1.5% cada uno
- Renta: % sobre primer mes + canon mensual
- Alianzas externas: 50/50 con otros corredores

**Líneas de servicio:**
- **Rentas** — corto, mediano y largo plazo
- **Proyectos** — venta de unidades en desarrollos nuevos
- **Casas de segunda** — inmuebles existentes
- **Proyectos VIP** — tasas preferenciales del Estado (BIESS, BanEcuador)

**Segmentos de clientes:**
- **Locales** — ingresos desde $1.200/mes, primer hogar, inversión
- **Extranjeros** — expats, retirados, nómadas digitales (requieren journey en inglés)
- **B2B** — constructoras, desarrolladores, propietarios con portafolio

---

## Stack

**Next.js 14 (App Router) · Supabase (Postgres + Auth + Realtime + Storage) · Tailwind + shadcn/ui · Claude API (claude-sonnet-4-6) · Vercel**

**Dev:** `npm run dev` → http://localhost:3000

---

## Dominio — Entidades principales

### Lead (Prospecto)
```
status: new | contacted | qualifying | qualified | negotiating | won | lost
intent: buy | sell | rent
property_type: apartment | house | office | land | commercial
urgency: immediate | 1_3m | 3_6m | 6m_plus
segment: local | expat | investor | b2b
language: es | en                          ← detectado por el agente
source: whatsapp | tiktok_dm | instagram_dm | web_form | referral | portal | manual
score: 0-100 (calculado por IA)
```

### Property (Propiedad)
```
operation: sale | rent | both
status: available | reserved | sold | rented
type: apartment | house | office | land | commercial
line: rentas | proyectos | segunda | vip    ← línea de servicio
```

### Alliance (Alianza con corredor externo)
```
broker_name, broker_phone, commission_split: 50    ← 50/50 default
deal_id → afecta cálculo de comisión en Deal
```

### Pipeline stages (Deal)
```
initial → visit_scheduled → visit_done → offer_sent → negotiation → closing → closed_won | closed_lost
```

### Observabilidad de agentes IA
- **`agent_logs`** — cada llamada a Claude se guarda completa (input, output, tokens, latencia)
- **`agent_evals`** — ejemplos buenos/malos etiquetados por Verónica o Cris para medir mejoras de prompt
- **`agent_approvals`** — cola HITL: acciones de alto impacto esperan aprobación antes de ejecutarse

### Canales de entrada de leads (por prioridad real)
1. **WhatsApp** — canal principal desde TikTok/Instagram → webhook Meta
2. **Instagram DM** — secundario (manual por ahora)
3. **TikTok DM** — secundario (manual por ahora)
4. **Web form** (cuenca.house) — cotizador como hook de entrada
5. **Portales** — Plusvalía, Properati (manual)
6. **Referidos** — programa de incentivos

---

## Agentes IA

### 1. Lead Qualifier (Fase 1 — prioritario)
Califica leads en WhatsApp y web chat. Detecta idioma (ES/EN), identifica segmento (local/expat), extrae los 5 datos clave. Asigna a Verónica.
Loggea en `agent_logs`. HITL para confirmar visitas y ofertas.

**Archivo:** `src/agents/lead-qualifier/`

### 2. Content Agent (Fase 2)
Genera: descripciones de propiedades, hooks TikTok, captions IG, mensajes WhatsApp. Input: datos propiedad → output: copy listo.

**Archivo:** `src/agents/content/`

### 3. Property Matcher (Fase 2)
Cruza perfil calificado con inventario → top 3-5 propiedades con justificación.

### 4. Tour Scheduler (Fase 3)
Agendamiento inteligente + reagendamiento automático.

---

## Estructura del proyecto
```
src/
  app/
    (dashboard)/           # CRM interno — protegido
      leads/
      properties/
      pipeline/
      content/
      approvals/           # Cola HITL — pendientes de aprobar
    (public)/              # cuenca.house cara al público
      [locale]/            # ES + EN
        cotizador/
        propiedades/
    api/
      webhooks/
        whatsapp/
      agents/
        qualify/
        content/
  agents/
    lead-qualifier/
      agent.ts
      prompts.ts
      types.ts
    content/
    shared/
      claude.ts
      logger.ts            # logAgentCall() — obligatorio en todos los agentes
      hitl.ts              # requestApproval() — para decisiones de alto impacto
  lib/
    supabase/
  components/
    ui/
    crm/
    public/
```

---

## Convenciones clave

- Server Actions para mutaciones — no API routes salvo webhooks externos
- RLS activado en todas las tablas de Supabase
- **Todo agente IA loggea en `agent_logs`** — sin excepción
- **HITL obligatorio** para: precios de oferta, confirmación de reserva, reasignación de leads (primeros 3 meses)
- Bilingüe: prompts del Qualifier en ES y EN, detectar idioma en primer mensaje
- `price` siempre en USD

---

## Brand
- **Color primario:** Azul marino `#1a2744` (aprox)
- **Acento dorado:** `#c9a84c` (aprox)
- Logo: wordmark "CUENC[A] HOUSE" con "A" en ícono dorado de torre/casa

---

## Skills disponibles
- `/crm-domain` — Contexto de dominio, reglas de negocio, mercado de Cuenca
- `/crm-agent` — Patterns para agentes IA, logging, evals, HITL
- `/crm-stack` — Convenciones de implementación y schema completo
- `/crm-content` — Content Agent: formatos TikTok, IG, listings, WhatsApp
