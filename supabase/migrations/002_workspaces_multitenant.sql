-- ─────────────────────────────────────────────────────────────
-- MIGRACIÓN 002 — Multi-tenant: Workspaces
-- Ejecutar en Supabase SQL Editor después de 001_initial_schema.sql
-- ─────────────────────────────────────────────────────────────

-- ── 1. WORKSPACES ─────────────────────────────────────────────
-- Un workspace = un agente inmobiliario (Cuenca House, otro broker, etc.)

create table workspaces (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,               -- "Cuenca House"
  slug                 text unique not null,         -- "cuenca-house"
  agent_name           text not null default 'Casa', -- nombre del bot en WhatsApp
  logo_url             text,
  primary_color        text default '#1a2744',
  accent_color         text default '#c9a84c',

  -- Google Sheets
  google_sheets_id     text,                         -- ID del spreadsheet de propiedades
  sheets_tab_vip       text default 'Proyectos VIP',
  sheets_tab_standard  text default 'Casas no VIP',
  last_sheets_sync     timestamptz,

  -- WhatsApp / Meta
  whatsapp_phone_id    text,                         -- Meta phone_number_id (identifica el workspace en el webhook)
  whatsapp_token       text,                         -- Meta access token
  meta_verify_token    text,                         -- webhook verify token

  -- Configuración del agente
  working_hours_start  text default '09:00',         -- hora local
  working_hours_end    text default '18:00',
  timezone             text default 'America/Guayaquil',
  commission_sale_pct  numeric default 3,            -- % comisión venta
  commission_rent_pct  numeric default 8.33,         -- % primer mes

  -- SaaS
  plan                 text default 'starter',       -- starter | pro | enterprise
  plan_expires_at      timestamptz,
  active               boolean default true,

  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

create trigger workspaces_updated_at before update on workspaces
  for each row execute function update_updated_at();

-- ── 2. WORKSPACE_MEMBERS ──────────────────────────────────────
-- Reemplaza la tabla `agents` como usuarios humanos del CRM

create table workspace_members (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name         text not null,
  email        text not null,
  phone        text,
  role         text default 'agent',     -- owner | agent | viewer
  specialty    text[] default '{}',
  active       boolean default true,
  created_at   timestamptz default now(),
  unique (workspace_id, email)
);

-- ── 3. AGREGAR workspace_id A TODAS LAS TABLAS CORE ───────────

alter table leads         add column workspace_id uuid references workspaces(id);
alter table properties    add column workspace_id uuid references workspaces(id);
alter table conversations add column workspace_id uuid references workspaces(id);
alter table deals         add column workspace_id uuid references workspaces(id);
alter table activities    add column workspace_id uuid references workspaces(id);
alter table agent_logs    add column workspace_id uuid references workspaces(id);
alter table agent_evals   add column workspace_id uuid references workspaces(id);
alter table agent_approvals add column workspace_id uuid references workspaces(id);
alter table alliances     add column workspace_id uuid references workspaces(id);

-- Índices para queries frecuentes por workspace
create index idx_leads_workspace         on leads(workspace_id);
create index idx_properties_workspace    on properties(workspace_id);
create index idx_conversations_workspace on conversations(workspace_id);
create index idx_deals_workspace         on deals(workspace_id);
create index idx_agent_logs_workspace    on agent_logs(workspace_id);

-- ── 4. TABLA PROPIEDADES — campos adicionales para Sheets sync ─

alter table properties
  add column if not exists sheets_row_id    text,          -- fila original en Google Sheets
  add column if not exists external_code    text,          -- ej. PROP-006
  add column if not exists photos_album_url text,          -- link al álbum de fotos
  add column if not exists line             text,          -- ya existe, verificar
  add column if not exists notes            text,          -- notas internas
  add column if not exists synced_at        timestamptz;   -- última vez que vino de Sheets

create index idx_properties_workspace_status on properties(workspace_id, status);
create index idx_properties_external_code    on properties(workspace_id, external_code);

-- ── 5. TABLA VISITS ───────────────────────────────────────────
-- Tour Scheduler — agendamiento de visitas con Google Calendar

create table visits (
  id                      uuid primary key default gen_random_uuid(),
  workspace_id            uuid references workspaces(id) not null,
  lead_id                 uuid references leads(id) not null,
  property_id             uuid references properties(id),
  property_external_code  text,                           -- si la propiedad no está en BD todavía
  scheduled_at            timestamptz not null,
  duration_minutes        int default 60,
  status                  text default 'scheduled',       -- scheduled | confirmed | done | cancelled | no_show
  google_calendar_event_id text,
  reminder_sent           boolean default false,
  notes                   text,
  assigned_member_id      uuid references workspace_members(id),
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create trigger visits_updated_at before update on visits
  for each row execute function update_updated_at();

create index idx_visits_workspace       on visits(workspace_id);
create index idx_visits_lead            on visits(lead_id);
create index idx_visits_scheduled_at    on visits(workspace_id, scheduled_at);

-- ── 6. RLS — workspaces y visits ─────────────────────────────

alter table workspaces        enable row level security;
alter table workspace_members enable row level security;
alter table visits            enable row level security;

create policy "authenticated_all" on workspaces        for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on workspace_members for all using (auth.role() = 'authenticated');
create policy "authenticated_all" on visits            for all using (auth.role() = 'authenticated');

-- ── 7. SEED — Workspace inicial: Cuenca House ─────────────────

insert into workspaces (
  name, slug, agent_name,
  primary_color, accent_color,
  sheets_tab_vip, sheets_tab_standard,
  meta_verify_token,
  working_hours_start, working_hours_end, timezone,
  commission_sale_pct, commission_rent_pct,
  plan
) values (
  'Cuenca House',
  'cuenca-house',
  'Casa',
  '#1a2744',
  '#c9a84c',
  'Proyectos VIP',
  'Casas no VIP',
  'cuencahouse-webhook-2024',
  '09:00', '18:00', 'America/Guayaquil',
  3, 8.33,
  'starter'
) returning id;

-- Nota: después de correr esto, tomar el ID del workspace creado
-- y asignarlo a los registros existentes de leads, conversations, etc.
-- con: UPDATE leads SET workspace_id = '<uuid>' WHERE workspace_id IS NULL;
