-- Cuenca House CRM — Schema inicial
-- Ejecutar en Supabase SQL Editor (supabase.com > Project > SQL Editor)

-- ─────────────────────────────────────────────
-- TABLAS CORE
-- ─────────────────────────────────────────────

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
  source text default 'manual',           -- whatsapp | tiktok_dm | instagram_dm | web_form | referral | portal | manual
  status text default 'new',              -- new | contacted | qualifying | qualified | negotiating | won | lost
  segment text,                           -- local | expat | investor | b2b
  language text default 'es',            -- es | en (detectado por el agente)
  intent text,                            -- buy | sell | rent
  property_type text,                     -- apartment | house | office | land | commercial
  location_preference text,
  budget_min numeric,
  budget_max numeric,
  urgency text,                           -- immediate | 1_3m | 3_6m | 6m_plus
  score int default 0,                    -- 0-100 calculado por IA
  ai_summary text,
  ai_qualification jsonb,
  assigned_agent_id uuid references agents(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,                       -- texto original de Verónica
  ai_description text,                    -- generado por Content Agent
  type text not null,                     -- apartment | house | office | land | commercial
  operation text not null,               -- sale | rent | both
  line text not null default 'segunda',  -- rentas | proyectos | segunda | vip
  status text default 'available',       -- available | reserved | sold | rented
  price numeric not null,                -- siempre en USD
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

create table alliances (
  id uuid primary key default gen_random_uuid(),
  broker_name text not null,
  broker_phone text,
  broker_email text,
  commission_split int default 50,       -- % para el aliado (50 = 50/50)
  active boolean default true,
  created_at timestamptz default now()
);

create table deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) not null,
  property_id uuid references properties(id) not null,
  agent_id uuid references agents(id) not null,
  alliance_id uuid references alliances(id), -- null si es deal directo
  stage text default 'initial',
  -- initial | visit_scheduled | visit_done | offer_sent | negotiation | closing | closed_won | closed_lost
  offer_price numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  channel text not null,                 -- whatsapp | web
  phone text,
  state jsonb default '{}',             -- {step, collected, turn_count}
  messages jsonb default '[]',          -- [{role, content, timestamp}]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) not null,
  type text not null,                    -- call | visit | whatsapp | email | note
  content text,
  created_by uuid references agents(id),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- OBSERVABILIDAD DE AGENTES IA
-- ─────────────────────────────────────────────

-- Log de cada llamada a Claude. Crítico para debuggear comportamientos raros.
create table agent_logs (
  id uuid primary key default gen_random_uuid(),
  agent text not null,                   -- lead-qualifier | content | matcher
  conversation_id uuid references conversations(id),
  lead_id uuid references leads(id),
  input jsonb not null,                  -- {messages, state, metadata}
  output jsonb not null,                 -- {action, message, extracted_data}
  model text not null,
  prompt_tokens int,
  completion_tokens int,
  latency_ms int,
  error text,                            -- null si exitoso
  created_at timestamptz default now()
);

-- Eval set: ejemplos etiquetados para medir si un nuevo prompt mejora o empeora.
create table agent_evals (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  log_id uuid references agent_logs(id),
  label text not null,                   -- good | bad | edge_case
  note text,
  expected_output jsonb,                 -- output ideal cuando el actual era malo
  tagged_by text,                        -- cris | veronica
  created_at timestamptz default now()
);

-- Cola HITL: acciones de alto impacto que esperan aprobación humana.
create table agent_approvals (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  lead_id uuid references leads(id),
  deal_id uuid references deals(id),
  action text not null,                  -- send_offer | update_price | confirm_reservation | reassign_lead
  payload jsonb not null,
  reason text,
  status text default 'pending',         -- pending | approved | rejected | expired
  reviewed_by text,
  reviewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- TRIGGERS — updated_at automático
-- ─────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at before update on leads
  for each row execute function update_updated_at();

create trigger deals_updated_at before update on deals
  for each row execute function update_updated_at();

create trigger conversations_updated_at before update on conversations
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- RLS — Row Level Security (activar en producción)
-- ─────────────────────────────────────────────

alter table leads enable row level security;
alter table properties enable row level security;
alter table agents enable row level security;
alter table deals enable row level security;
alter table conversations enable row level security;
alter table activities enable row level security;
alter table agent_logs enable row level security;
alter table agent_evals enable row level security;
alter table agent_approvals enable row level security;
alter table alliances enable row level security;

-- Política temporal (desarrollo): usuarios autenticados ven todo
-- Reemplazar con políticas por rol antes de producción
create policy "authenticated_all" on leads for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on properties for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on agents for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on deals for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on conversations for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on activities for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on agent_logs for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on agent_evals for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on agent_approvals for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on alliances for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- SEED — Agentes iniciales
-- ─────────────────────────────────────────────

insert into agents (name, email, phone, specialty) values
  ('Verónica', 'veronica@cuenca.house', '+593999000001', '{"residential", "commercial", "vip"}'),
  ('Cristian', 'cris@cuenca.house', '+593999000002', '{"proyectos", "expat"}');
