# CRM Stack — Next.js + Supabase

Convenciones de implementación para CuencaHouse CRM.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 App Router |
| UI | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + magic link) |
| Realtime | Supabase Realtime (canales de leads) |
| Storage | Supabase Storage (fotos de propiedades) |
| AI | Claude API — `@anthropic-ai/sdk` |
| Deployment | Vercel |
| Comms | Meta Cloud API (WhatsApp) · Resend (email) |

---

## Variables de entorno

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Solo server-side, nunca al cliente

ANTHROPIC_API_KEY=

META_WHATSAPP_TOKEN=
META_WHATSAPP_PHONE_ID=
META_WEBHOOK_VERIFY_TOKEN=

RESEND_API_KEY=
```

---

## Supabase — Schema base

```sql
-- Ejecutar en Supabase SQL editor

create table agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  specialty text[] default '{}',
  active_leads_count int default 0,
  created_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  source text default 'manual',
  status text default 'new',
  intent text,
  property_type text,
  location_preference text,
  budget_min numeric,
  budget_max numeric,
  urgency text,
  score int default 0,
  ai_summary text,
  ai_qualification jsonb,
  assigned_agent_id uuid references agents(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  ai_description text,
  type text not null,
  operation text not null,
  status text default 'available',
  price numeric not null,
  area_m2 numeric,
  bedrooms int,
  bathrooms int,
  parking int,
  address text,
  neighborhood text,
  city text default 'Cuenca',
  features text[] default '{}',
  agent_id uuid references agents(id),
  created_at timestamptz default now()
);

create table deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) not null,
  property_id uuid references properties(id) not null,
  agent_id uuid references agents(id) not null,
  stage text default 'initial',
  offer_price numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  channel text not null,
  phone text,
  state jsonb default '{}',
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) not null,
  type text not null,
  content text,
  created_by uuid references agents(id),
  created_at timestamptz default now()
);

-- Logs de cada llamada a un agente IA. Crítico para debuggear comportamientos raros.
create table agent_logs (
  id uuid primary key default gen_random_uuid(),
  agent text not null,                        -- 'lead-qualifier' | 'content' | 'matcher'
  conversation_id uuid references conversations(id),
  lead_id uuid references leads(id),
  input jsonb not null,                       -- {messages, state, metadata}
  output jsonb not null,                      -- {action, message, extracted_data}
  model text not null,                        -- 'claude-sonnet-4-6'
  prompt_tokens int,
  completion_tokens int,
  latency_ms int,
  error text,                                 -- null si exitoso
  created_at timestamptz default now()
);

-- Eval set: ejemplos reales para medir si un nuevo prompt mejora o empeora.
create table agent_evals (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  log_id uuid references agent_logs(id),      -- referencia al log original
  label text not null,                        -- 'good' | 'bad' | 'edge_case'
  note text,                                  -- ¿por qué es bueno o malo este ejemplo?
  expected_output jsonb,                      -- output ideal (si el actual era malo)
  tagged_by text,                             -- 'cris' | 'veronica'
  created_at timestamptz default now()
);

-- Cola de decisiones que requieren aprobación humana antes de ejecutar.
-- Human-in-the-loop para precios, ofertas, asignaciones críticas.
create table agent_approvals (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  lead_id uuid references leads(id),
  deal_id uuid references deals(id),
  action text not null,                       -- 'send_offer' | 'update_price' | 'reassign_lead'
  payload jsonb not null,                     -- datos de la acción propuesta
  reason text,                                -- por qué el agente pide aprobación
  status text default 'pending',              -- 'pending' | 'approved' | 'rejected' | 'expired'
  reviewed_by text,
  reviewed_at timestamptz,
  expires_at timestamptz,                     -- si nadie aprueba en X horas → acción alternativa
  created_at timestamptz default now()
);
```

---

## Supabase — Clients

```typescript
// src/lib/supabase/server.ts — RSC y Server Actions
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  );
}

// src/lib/supabase/client.ts — Client Components
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

---

## Next.js — Patrones

### Server Actions para mutaciones
```typescript
// src/app/(dashboard)/leads/actions.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLeadStatus(leadId: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId);
  
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
}
```

### API Routes solo para webhooks externos
```typescript
// src/app/api/webhooks/whatsapp/route.ts
export async function GET(req: Request) {
  // Verificación de webhook Meta
}

export async function POST(req: Request) {
  // Recibir mensajes de WhatsApp
}
```

### Loading states con Suspense
```typescript
// Siempre envolver fetch de datos en Suspense boundaries
<Suspense fallback={<LeadsTableSkeleton />}>
  <LeadsTable />
</Suspense>
```

---

## shadcn/ui — Instalación y uso

```bash
npx shadcn@latest init
npx shadcn@latest add table card badge button input select dialog sheet
```

Componentes CRM personalizados en `src/components/crm/`:
- `LeadCard` — card de prospecto con score + status badge
- `PipelineBoard` — kanban de deals por stage
- `PropertyCard` — card de propiedad con foto + precio
- `LeadTimeline` — actividades de un lead

---

## Realtime — Notificaciones de nuevos leads

```typescript
// src/app/(dashboard)/leads/page.tsx — Client Component
"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useNewLeadNotifications() {
  const supabase = createClient();
  
  useEffect(() => {
    const channel = supabase
      .channel("new-leads")
      .on("postgres_changes", 
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          // Mostrar toast de nuevo lead
          toast.info(`Nuevo prospecto: ${payload.new.name || payload.new.phone}`);
        }
      )
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, []);
}
```

---

## Comandos de desarrollo

```bash
npm run dev              # Desarrollo local
npx supabase start       # Supabase local (Docker)
npx supabase gen types typescript --local > src/lib/supabase/types.ts
npx supabase db push     # Aplicar migraciones
```
