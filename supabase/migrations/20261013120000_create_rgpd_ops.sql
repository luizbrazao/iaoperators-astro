-- RGPD Ops Starter — pedidos, enlaces de acceso, eventos de Stripe, rate limit
-- y espacio de trabajo persistente.
--
-- NO se aplica automáticamente. Ver docs/rgpd-ops.md («Aplicar la migración»).
-- Idempotente: se puede ejecutar dos veces sin error (if not exists, create or
-- replace, drop trigger if exists).
--
-- Principios:
-- - Todo el acceso es server-side con la service role (endpoints de Astro en
--   Vercel). RLS activado y sin políticas: anon y authenticated no ven nada, y
--   las funciones no son ejecutables por ellos.
-- - Idempotencia en la base de datos: el mismo evento de Stripe o la misma
--   Checkout Session nunca generan dos pedidos, y un pedido nunca tiene dos
--   espacios de trabajo (UNIQUE(order_id)).
-- - El acceso a los datos del espacio de trabajo pasa por funciones que:
--     1. traducen el slug de la entidad a una tabla con una lista CERRADA;
--     2. aplican una lista blanca de columnas escribibles (mass assignment);
--     3. filtran SIEMPRE por workspace_id + id (IDOR);
--     4. exigen la versión que vio el cliente (concurrencia optimista);
--     5. escriben el evento de auditoría en la misma transacción.
-- - Minimización: ninguna tabla tiene columnas para nombres, emails o
--   documentos de titulares. Las referencias internas tienen un patrón que
--   rechaza "@" y espacios.
-- - Cascadas deliberadas:
--     orders ─(RESTRICT)─ workspaces: un pedido con espacio de trabajo no se
--       borra por accidente (los pedidos son documentación contable).
--     workspaces ─(CASCADE)─ entidades y auditoría: borrar un espacio de
--       trabajo (purga tras el fin del acceso) borra todo su contenido.
--     orders ─(CASCADE)─ access_tokens.

create extension if not exists pgcrypto;

-- ===========================================================================
-- Pago y acceso (mismo diseño que verifactu_kit_*, tablas propias)
-- ===========================================================================

create table if not exists public.rgpd_ops_orders (
  id uuid primary key default gen_random_uuid(),
  email text not null default '' check (email = lower(email) and char_length(email) <= 254),
  customer_name text null check (customer_name is null or char_length(customer_name) <= 200),
  company_name text null check (company_name is null or char_length(company_name) <= 200),
  stripe_customer_id text null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text null unique,
  stripe_price_id text not null default '',
  product_key text not null default 'rgpd-ops-starter',
  product_version text not null default '',
  amount_total integer not null default 0,
  currency text not null default 'eur',
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  access_status text not null default 'pending'
    check (access_status in ('pending', 'active', 'revoked')),
  assessment_response_id uuid null,
  access_granted_at timestamptz null,
  access_expires_at timestamptz null,
  access_email_status text not null default 'pending'
    check (access_email_status in ('pending', 'sent', 'failed')),
  access_email_sent_at timestamptz null,
  last_access_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz null,
  refunded_at timestamptz null
);

create index if not exists rgpd_ops_orders_email_idx on public.rgpd_ops_orders (email, created_at desc);
create index if not exists rgpd_ops_orders_status_idx on public.rgpd_ops_orders (payment_status, access_status);
create index if not exists rgpd_ops_orders_email_failed_idx
  on public.rgpd_ops_orders (created_at desc) where access_email_status = 'failed';
create index if not exists rgpd_ops_orders_expiry_idx on public.rgpd_ops_orders (access_expires_at);

create table if not exists public.rgpd_ops_access_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.rgpd_ops_orders (id) on delete cascade,
  token_hash text not null unique check (char_length(token_hash) = 64),
  purpose text not null check (purpose in ('purchase', 'resend', 'admin_resend')),
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists rgpd_ops_access_tokens_order_idx on public.rgpd_ops_access_tokens (order_id, created_at desc);

create table if not exists public.rgpd_ops_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  processing_status text not null default 'processing'
    check (processing_status in ('processing', 'processed', 'ignored', 'failed')),
  attempts integer not null default 1,
  processed_at timestamptz null,
  error_message text null check (error_message is null or char_length(error_message) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rgpd_ops_rate_limits (
  bucket_key text primary key,
  window_started_at timestamptz not null default now(),
  hits integer not null default 0
);

-- Ventana fija atómica: un solo INSERT ... ON CONFLICT, sin carreras entre
-- invocaciones concurrentes. Devuelve true si la petición está dentro del límite.
create or replace function public.rgpd_ops_rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_hits integer;
begin
  insert into public.rgpd_ops_rate_limits as rl (bucket_key, window_started_at, hits)
  values (p_key, now(), 1)
  on conflict (bucket_key) do update
    set hits = case
          when rl.window_started_at < now() - make_interval(secs => p_window_seconds) then 1
          else rl.hits + 1
        end,
        window_started_at = case
          when rl.window_started_at < now() - make_interval(secs => p_window_seconds) then now()
          else rl.window_started_at
        end
  returning hits into v_hits;
  return v_hits <= p_limit;
end;
$$;

create or replace function public.rgpd_ops_rate_limits_prune()
returns integer
language sql
set search_path = ''
as $$
  with deleted as (
    delete from public.rgpd_ops_rate_limits
    where window_started_at < now() - interval '1 day'
    returning 1
  )
  select count(*)::integer from deleted;
$$;

-- ===========================================================================
-- Espacio de trabajo
-- ===========================================================================

create table if not exists public.rgpd_ops_workspaces (
  id uuid primary key default gen_random_uuid(),
  -- Un espacio por pedido. RESTRICT: no se puede borrar un pedido que tiene
  -- espacio de trabajo; primero se purga el espacio (ver función de purga).
  order_id uuid not null unique references public.rgpd_ops_orders (id) on delete restrict,
  product_version text not null default '' check (char_length(product_version) <= 20),
  schema_version integer not null default 1,
  -- Versión optimista: la incrementa el trigger en cada UPDATE.
  version integer not null default 1 check (version >= 1),
  -- Perfil y alcance. Estructura validada en el servidor (src/lib/rgpd-ops/schema.ts).
  profile jsonb not null default '{}'::jsonb
    check (jsonb_typeof(profile) = 'object' and pg_column_size(profile) <= 16384),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Valores permitidos compartidos (también validados en TS).
-- interesados: clientes, leads, contactos_b2b, empleados, candidatos, proveedores,
--              usuarios_web, alumnos, pacientes, menores, otros
-- categorías:  identificativos, contacto, economicos, comerciales, navegacion,
--              comunicaciones, laborales, imagen_voz, ubicacion, salud,
--              otras_especiales, penales, otros

create table if not exists public.rgpd_ops_processing_activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rgpd_ops_workspaces (id) on delete cascade,
  version integer not null default 1 check (version >= 1),
  name text not null check (char_length(name) between 1 and 160),
  purpose text not null default '' check (char_length(purpose) <= 1000),
  data_subjects text[] not null default '{}' check (
    cardinality(data_subjects) <= 11 and data_subjects <@ array['clientes','leads','contactos_b2b','empleados','candidatos','proveedores','usuarios_web','alumnos','pacientes','menores','otros']::text[]
  ),
  data_categories text[] not null default '{}' check (
    cardinality(data_categories) <= 13 and data_categories <@ array['identificativos','contacto','economicos','comerciales','navegacion','comunicaciones','laborales','imagen_voz','ubicacion','salud','otras_especiales','penales','otros']::text[]
  ),
  recipients text not null default '' check (char_length(recipients) <= 1000),
  transfers text not null default 'por_determinar' check (transfers in ('no', 'si', 'por_determinar')),
  transfer_details text not null default '' check (char_length(transfer_details) <= 500),
  retention text not null default '' check (char_length(retention) <= 500),
  security_measures text not null default '' check (char_length(security_measures) <= 1000),
  -- Campo de TRABAJO, nunca una conclusión del sistema.
  legal_basis text not null default 'por_determinar' check (legal_basis in (
    'consentimiento','contrato','obligacion_legal','interes_vital','interes_publico','interes_legitimo','por_determinar')),
  legal_basis_note text not null default '' check (char_length(legal_basis_note) <= 500),
  status text not null default 'borrador' check (status in ('borrador', 'en_revision', 'revisado')),
  last_reviewed_on date null,
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rgpd_ops_activities_ws_idx on public.rgpd_ops_processing_activities (workspace_id, status);

create table if not exists public.rgpd_ops_processors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rgpd_ops_workspaces (id) on delete cascade,
  version integer not null default 1 check (version >= 1),
  name text not null check (char_length(name) between 1 and 120),
  service_category text not null default 'otro' check (service_category in (
    'crm','whatsapp','email','analitica','publicidad','hosting','automatizacion','ia','pagos','ofimatica','otro')),
  role_estimate text not null default 'por_determinar' check (role_estimate in (
    'encargado','responsable_independiente','corresponsable','por_determinar')),
  location text not null default 'desconocida' check (location in ('ue_eee','fuera_eee','mixta','desconocida')),
  transfer_mechanism text not null default 'por_determinar' check (transfer_mechanism in (
    'no_aplica','decision_adecuacion','clausulas_tipo','otra','por_determinar')),
  dpa_status text not null default 'pendiente' check (dpa_status in ('verificado','pendiente','no_aplica')),
  dpa_reference text not null default '' check (char_length(dpa_reference) <= 300),
  last_review_on date null,
  next_review_on date null,
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rgpd_ops_processors_ws_idx on public.rgpd_ops_processors (workspace_id, dpa_status);
create index if not exists rgpd_ops_processors_review_idx on public.rgpd_ops_processors (workspace_id, next_review_on);

create table if not exists public.rgpd_ops_collection_points (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rgpd_ops_workspaces (id) on delete cascade,
  version integer not null default 1 check (version >= 1),
  name text not null check (char_length(name) between 1 and 120),
  kind text not null default 'otro' check (kind in (
    'formulario','landing','whatsapp','cookies','newsletter','pixel','chat_ia','telefono','presencial','otro')),
  location_ref text not null default '' check (char_length(location_ref) <= 300),
  notice_status text not null default 'pendiente' check (notice_status in ('completo','parcial','pendiente','no_aplica')),
  layered_info text not null default 'no' check (layered_info in ('si','no','no_aplica')),
  consent_status text not null default 'por_determinar' check (consent_status in ('registrado','pendiente','no_aplica','por_determinar')),
  last_review_on date null,
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rgpd_ops_points_ws_idx on public.rgpd_ops_collection_points (workspace_id, notice_status);

create table if not exists public.rgpd_ops_rights_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rgpd_ops_workspaces (id) on delete cascade,
  version integer not null default 1 check (version >= 1),
  -- Referencia interna. NUNCA nombre ni email del solicitante: el patrón
  -- rechaza "@", espacios y cualquier carácter fuera de [A-Za-z0-9._/-].
  reference text not null check (reference ~ '^[A-Za-z0-9][A-Za-z0-9._/-]{0,39}$'),
  request_type text not null default 'acceso' check (request_type in (
    'acceso','rectificacion','supresion','oposicion','limitacion','portabilidad','decisiones_automatizadas','otro')),
  received_on date not null,
  -- Plazo orientativo calculado en el servidor (un mes desde la recepción).
  due_on date not null,
  extended boolean not null default false,
  extended_due_on date null,
  extension_notified_on date null,
  status text not null default 'recibida' check (status in ('recibida','en_curso','respondida','denegada','archivada')),
  responded_on date null,
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rgpd_ops_rights_extension_chk check (extended = false or extended_due_on is not null),
  constraint rgpd_ops_rights_due_chk check (due_on >= received_on),
  constraint rgpd_ops_rights_reference_uq unique (workspace_id, reference)
);
create index if not exists rgpd_ops_rights_ws_idx on public.rgpd_ops_rights_requests (workspace_id, status, due_on);

create table if not exists public.rgpd_ops_incidents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rgpd_ops_workspaces (id) on delete cascade,
  version integer not null default 1 check (version >= 1),
  reference text not null check (reference ~ '^[A-Za-z0-9][A-Za-z0-9._/-]{0,39}$'),
  -- Momento en que la empresa tuvo constancia (inicio del reloj orientativo de 72 h).
  detected_at timestamptz not null,
  data_categories text[] not null default '{}' check (
    cardinality(data_categories) <= 13 and data_categories <@ array['identificativos','contacto','economicos','comerciales','navegacion','comunicaciones','laborales','imagen_voz','ubicacion','salud','otras_especiales','penales','otros']::text[]
  ),
  -- Alcance aproximado, nunca los registros afectados.
  affected_scope text not null default 'desconocido' check (affected_scope in ('desconocido','pocos','decenas','cientos','miles_o_mas')),
  description text not null default '' check (char_length(description) <= 1000),
  -- Valoración INTERNA de la empresa. El sistema no la calcula.
  internal_assessment text not null default 'sin_evaluar' check (internal_assessment in (
    'sin_evaluar','riesgo_improbable','riesgo','alto_riesgo')),
  -- Decisión de la empresa. El sistema no decide ni notifica.
  escalation_decision text not null default 'pendiente' check (escalation_decision in (
    'pendiente','no_notificar_documentado','notificar_aepd','notificar_aepd_y_afectados')),
  decision_reason text not null default '' check (char_length(decision_reason) <= 1000),
  measures text not null default '' check (char_length(measures) <= 1000),
  aepd_notified_at timestamptz null,
  subjects_communicated_at timestamptz null,
  status text not null default 'abierto' check (status in ('abierto','cerrado')),
  closed_at timestamptz null,
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rgpd_ops_incidents_reference_uq unique (workspace_id, reference)
);
create index if not exists rgpd_ops_incidents_ws_idx on public.rgpd_ops_incidents (workspace_id, status, detected_at desc);

create table if not exists public.rgpd_ops_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rgpd_ops_workspaces (id) on delete cascade,
  version integer not null default 1 check (version >= 1),
  title text not null check (char_length(title) between 1 and 200),
  area text not null default 'general' check (area in (
    'perfil','tratamientos','proveedores','captacion','solicitudes','incidentes','plan','general')),
  -- Rol funcional ("Marketing", "Dirección"), no el nombre de una persona.
  owner_role text not null default '' check (char_length(owner_role) <= 60),
  priority text not null default 'media' check (priority in ('alta','media','baja')),
  due_on date null,
  status text not null default 'pendiente' check (status in ('pendiente','en_curso','hecha','descartada')),
  completed_at timestamptz null,
  -- Clave de las tareas sembradas al crear el espacio (idempotencia).
  seed_key text null check (seed_key is null or char_length(seed_key) <= 60),
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rgpd_ops_tasks_ws_idx on public.rgpd_ops_tasks (workspace_id, status, due_on);
create unique index if not exists rgpd_ops_tasks_seed_uq on public.rgpd_ops_tasks (workspace_id, seed_key) where seed_key is not null;

create table if not exists public.rgpd_ops_evidence_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rgpd_ops_workspaces (id) on delete cascade,
  version integer not null default 1 check (version >= 1),
  title text not null check (char_length(title) between 1 and 200),
  area text not null default 'general' check (area in (
    'perfil','tratamientos','proveedores','captacion','solicitudes','incidentes','plan','general')),
  kind text not null default 'documento' check (kind in (
    'documento','contrato','registro','captura','politica','formacion','acta','otro')),
  -- Dónde está guardada la evidencia (referencia). Sin subida de archivos.
  location_ref text not null default '' check (char_length(location_ref) <= 300),
  evidence_date date null,
  review_due_on date null,
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rgpd_ops_evidence_ws_idx on public.rgpd_ops_evidence_items (workspace_id, review_due_on);

create table if not exists public.rgpd_ops_review_cycles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rgpd_ops_workspaces (id) on delete cascade,
  version integer not null default 1 check (version >= 1),
  period text not null check (period ~ '^[0-9]{4}-T[1-4]$'),
  status text not null default 'en_curso' check (status in ('en_curso','completada')),
  checklist jsonb not null default '{}'::jsonb check (jsonb_typeof(checklist) = 'object' and pg_column_size(checklist) <= 4096),
  summary text not null default '' check (char_length(summary) <= 2000),
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rgpd_ops_review_period_uq unique (workspace_id, period),
  constraint rgpd_ops_review_completed_chk check (status <> 'completada' or completed_at is not null)
);
create index if not exists rgpd_ops_reviews_ws_idx on public.rgpd_ops_review_cycles (workspace_id, status, completed_at desc);

-- Historial append-only. Metadatos mínimos: acción, entidad, id y NOMBRES de
-- los campos cambiados. Nunca valores.
create table if not exists public.rgpd_ops_audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.rgpd_ops_workspaces (id) on delete cascade,
  occurred_at timestamptz not null default now(),
  actor text not null default 'comprador' check (actor in ('comprador','sistema','soporte')),
  action text not null check (action in (
    'workspace_created','profile_updated','entity_created','entity_updated','entity_deleted','review_completed','export','access')),
  entity text null check (entity is null or entity in (
    'tratamientos','proveedores','captacion','solicitudes','incidentes','tareas','evidencias','revisiones')),
  entity_id uuid null,
  fields text[] not null default '{}' check (cardinality(fields) <= 40),
  detail text null check (detail is null or detail ~ '^[a-z0-9_:.-]{1,40}$')
);
create index if not exists rgpd_ops_audit_ws_idx on public.rgpd_ops_audit_events (workspace_id, occurred_at desc);

-- ===========================================================================
-- Triggers
-- ===========================================================================

create or replace function public.set_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_rgpd_ops_orders_set_updated_at on public.rgpd_ops_orders;
create trigger trg_rgpd_ops_orders_set_updated_at
before update on public.rgpd_ops_orders
for each row execute function public.set_timestamp_updated_at();

drop trigger if exists trg_rgpd_ops_webhook_events_set_updated_at on public.rgpd_ops_webhook_events;
create trigger trg_rgpd_ops_webhook_events_set_updated_at
before update on public.rgpd_ops_webhook_events
for each row execute function public.set_timestamp_updated_at();

-- Versión optimista del espacio: la incrementa la BD, no el cliente. El
-- pedido al que pertenece no puede cambiar.
create or replace function public.rgpd_ops_bump_workspace_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.version := old.version + 1;
  new.updated_at := now();
  new.created_at := old.created_at;
  new.order_id := old.order_id;
  return new;
end;
$$;

drop trigger if exists trg_rgpd_ops_workspaces_version on public.rgpd_ops_workspaces;
create trigger trg_rgpd_ops_workspaces_version
before update on public.rgpd_ops_workspaces
for each row execute function public.rgpd_ops_bump_workspace_version();

-- Versión optimista de las entidades. Una fila no puede cambiar de espacio
-- de trabajo ni de id.
create or replace function public.rgpd_ops_bump_entity_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.version := old.version + 1;
  new.updated_at := now();
  new.created_at := old.created_at;
  new.workspace_id := old.workspace_id;
  new.id := old.id;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'rgpd_ops_processing_activities','rgpd_ops_processors','rgpd_ops_collection_points',
    'rgpd_ops_rights_requests','rgpd_ops_incidents','rgpd_ops_tasks','rgpd_ops_evidence_items','rgpd_ops_review_cycles'
  ] loop
    execute format('drop trigger if exists trg_%s_version on public.%I', t, t);
    execute format('create trigger trg_%s_version before update on public.%I for each row execute function public.rgpd_ops_bump_entity_version()', t, t);
  end loop;
end;
$$;

-- Auditoría append-only: UPDATE prohibido siempre; DELETE solo en cascada
-- desde el espacio de trabajo (pg_trigger_depth() > 1 dentro de la acción
-- referencial). Un DELETE directo falla.
create or replace function public.rgpd_ops_audit_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    raise exception 'rgpd_ops_audit_events es de solo inserción' using errcode = '42501';
  end if;
  if tg_op = 'DELETE' and pg_trigger_depth() <= 1 then
    raise exception 'rgpd_ops_audit_events solo se borra con su espacio de trabajo' using errcode = '42501';
  end if;
  return old;
end;
$$;

drop trigger if exists trg_rgpd_ops_audit_guard on public.rgpd_ops_audit_events;
create trigger trg_rgpd_ops_audit_guard
before update or delete on public.rgpd_ops_audit_events
for each row execute function public.rgpd_ops_audit_guard();

-- ===========================================================================
-- Listas blancas de entidades y columnas
-- ===========================================================================

create or replace function public.rgpd_ops_entity_table(p_entity text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case p_entity
    when 'tratamientos' then 'rgpd_ops_processing_activities'
    when 'proveedores' then 'rgpd_ops_processors'
    when 'captacion' then 'rgpd_ops_collection_points'
    when 'solicitudes' then 'rgpd_ops_rights_requests'
    when 'incidentes' then 'rgpd_ops_incidents'
    when 'tareas' then 'rgpd_ops_tasks'
    when 'evidencias' then 'rgpd_ops_evidence_items'
    when 'revisiones' then 'rgpd_ops_review_cycles'
    else null
  end;
$$;

-- Columnas que un comprador puede escribir. Nunca: id, workspace_id, version,
-- created_at, updated_at, seed_key.
create or replace function public.rgpd_ops_entity_columns(p_entity text)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select case p_entity
    when 'tratamientos' then array['name','purpose','data_subjects','data_categories','recipients','transfers','transfer_details','retention','security_measures','legal_basis','legal_basis_note','status','last_reviewed_on','notes']
    when 'proveedores' then array['name','service_category','role_estimate','location','transfer_mechanism','dpa_status','dpa_reference','last_review_on','next_review_on','notes']
    when 'captacion' then array['name','kind','location_ref','notice_status','layered_info','consent_status','last_review_on','notes']
    when 'solicitudes' then array['reference','request_type','received_on','due_on','extended','extended_due_on','extension_notified_on','status','responded_on','notes']
    when 'incidentes' then array['reference','detected_at','data_categories','affected_scope','description','internal_assessment','escalation_decision','decision_reason','measures','aepd_notified_at','subjects_communicated_at','status','closed_at','notes']
    when 'tareas' then array['title','area','owner_role','priority','due_on','status','completed_at','notes']
    when 'evidencias' then array['title','area','kind','location_ref','evidence_date','review_due_on','notes']
    when 'revisiones' then array['period','status','checklist','summary','completed_at','notes']
    else null
  end::text[];
$$;

-- Valida las claves de un jsonb contra la lista blanca. Devuelve las claves.
create or replace function public.rgpd_ops_checked_keys(p_entity text, p_values jsonb)
returns text[]
language plpgsql
stable
set search_path = ''
as $$
declare
  v_allowed text[] := public.rgpd_ops_entity_columns(p_entity);
  v_keys text[] := '{}';
  k text;
begin
  if v_allowed is null then
    raise exception 'unknown_entity' using errcode = '22023';
  end if;
  if p_values is null or jsonb_typeof(p_values) <> 'object' then
    raise exception 'invalid_values' using errcode = '22023';
  end if;
  for k in select jsonb_object_keys(p_values) loop
    if not (k = any (v_allowed)) then
      raise exception 'field_not_allowed:%', k using errcode = '22023';
    end if;
    v_keys := v_keys || k;
  end loop;
  return v_keys;
end;
$$;

-- ===========================================================================
-- Operaciones del espacio de trabajo
-- ===========================================================================

-- Crea el espacio de un pedido con acceso activo. Idempotente: un segundo
-- intento (reintento del webhook, petición concurrente) devuelve el existente
-- y no vuelve a sembrar tareas.
create or replace function public.rgpd_ops_ensure_workspace(
  p_order_id uuid,
  p_product_version text,
  p_seed_tasks jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not exists (
    select 1 from public.rgpd_ops_orders o
    where o.id = p_order_id
      and o.access_status = 'active'
      and o.payment_status in ('paid', 'partially_refunded')
  ) then
    raise exception 'order_not_active' using errcode = 'P0001';
  end if;

  insert into public.rgpd_ops_workspaces (order_id, product_version)
  values (p_order_id, coalesce(left(p_product_version, 20), ''))
  on conflict (order_id) do nothing
  returning id into v_id;

  if v_id is null then
    select w.id into v_id from public.rgpd_ops_workspaces w where w.order_id = p_order_id;
    return jsonb_build_object('workspace_id', v_id, 'created', false);
  end if;

  insert into public.rgpd_ops_tasks (workspace_id, title, area, priority, owner_role, due_on, seed_key)
  select v_id, s.title, s.area, coalesce(s.priority, 'media'), coalesce(s.owner_role, ''),
         case when s.due_in_days is null then null else current_date + s.due_in_days end,
         s.seed_key
  from jsonb_to_recordset(coalesce(p_seed_tasks, '[]'::jsonb))
    as s(seed_key text, title text, area text, priority text, owner_role text, due_in_days integer)
  on conflict (workspace_id, seed_key) where seed_key is not null do nothing;

  insert into public.rgpd_ops_audit_events (workspace_id, actor, action)
  values (v_id, 'sistema', 'workspace_created');

  return jsonb_build_object('workspace_id', v_id, 'created', true);
end;
$$;

-- Alta de una entidad. Bloquea la fila del espacio (serializa altas
-- concurrentes) para que el límite de filas sea exacto.
create or replace function public.rgpd_ops_entity_create(
  p_workspace uuid,
  p_entity text,
  p_values jsonb,
  p_max_rows integer default 500
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_table text := public.rgpd_ops_entity_table(p_entity);
  v_keys text[];
  v_count integer;
  v_row jsonb;
  v_cols text;
  v_vals text;
begin
  if v_table is null then
    raise exception 'unknown_entity' using errcode = '22023';
  end if;
  v_keys := public.rgpd_ops_checked_keys(p_entity, p_values);

  perform 1 from public.rgpd_ops_workspaces w where w.id = p_workspace for update;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  execute format('select count(*)::integer from public.%I where workspace_id = $1', v_table)
    into v_count using p_workspace;
  if v_count >= p_max_rows then
    return jsonb_build_object('status', 'limit');
  end if;

  if cardinality(v_keys) = 0 then
    raise exception 'empty_values' using errcode = '22023';
  end if;

  select string_agg(format('%I', k), ', '), string_agg(format('r.%I', k), ', ')
    into v_cols, v_vals
  from unnest(v_keys) as k;

  execute format(
    'insert into public.%I as t (workspace_id, %s) select $1, %s from jsonb_populate_record(null::public.%I, $2) r returning to_jsonb(t.*)',
    v_table, v_cols, v_vals, v_table
  ) into v_row using p_workspace, p_values;

  insert into public.rgpd_ops_audit_events (workspace_id, action, entity, entity_id, fields)
  values (p_workspace, 'entity_created', p_entity, (v_row ->> 'id')::uuid, v_keys);

  return jsonb_build_object('status', 'ok', 'row', v_row);
end;
$$;

-- Modificación con versión optimista. Devuelve:
--   ok        → la fila nueva
--   conflict  → la fila actual (otra pestaña la cambió)
--   not_found → no existe EN ESTE espacio (mismo resultado que si no existiera)
create or replace function public.rgpd_ops_entity_update(
  p_workspace uuid,
  p_entity text,
  p_id uuid,
  p_version integer,
  p_patch jsonb
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_table text := public.rgpd_ops_entity_table(p_entity);
  v_keys text[];
  v_set text;
  v_row jsonb;
  v_current jsonb;
  v_action text := 'entity_updated';
begin
  if v_table is null then
    raise exception 'unknown_entity' using errcode = '22023';
  end if;
  v_keys := public.rgpd_ops_checked_keys(p_entity, p_patch);
  if cardinality(v_keys) = 0 then
    raise exception 'empty_values' using errcode = '22023';
  end if;

  select string_agg(format('%I = r.%I', k, k), ', ') into v_set from unnest(v_keys) as k;

  execute format(
    'update public.%I t set %s from jsonb_populate_record(null::public.%I, $1) r where t.id = $2 and t.workspace_id = $3 and t.version = $4 returning to_jsonb(t.*)',
    v_table, v_set, v_table
  ) into v_row using p_patch, p_id, p_workspace, p_version;

  if v_row is null then
    execute format('select to_jsonb(t.*) from public.%I t where t.id = $1 and t.workspace_id = $2', v_table)
      into v_current using p_id, p_workspace;
    if v_current is null then
      return jsonb_build_object('status', 'not_found');
    end if;
    return jsonb_build_object('status', 'conflict', 'current', v_current);
  end if;

  if p_entity = 'revisiones' and (p_patch ->> 'status') = 'completada' then
    v_action := 'review_completed';
  end if;

  insert into public.rgpd_ops_audit_events (workspace_id, action, entity, entity_id, fields)
  values (p_workspace, v_action, p_entity, p_id, v_keys);

  return jsonb_build_object('status', 'ok', 'row', v_row);
end;
$$;

create or replace function public.rgpd_ops_entity_delete(
  p_workspace uuid,
  p_entity text,
  p_id uuid,
  p_version integer
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_table text := public.rgpd_ops_entity_table(p_entity);
  v_deleted uuid;
  v_current jsonb;
begin
  if v_table is null then
    raise exception 'unknown_entity' using errcode = '22023';
  end if;

  execute format(
    'delete from public.%I t where t.id = $1 and t.workspace_id = $2 and t.version = $3 returning t.id',
    v_table
  ) into v_deleted using p_id, p_workspace, p_version;

  if v_deleted is null then
    execute format('select to_jsonb(t.*) from public.%I t where t.id = $1 and t.workspace_id = $2', v_table)
      into v_current using p_id, p_workspace;
    if v_current is null then
      return jsonb_build_object('status', 'not_found');
    end if;
    return jsonb_build_object('status', 'conflict', 'current', v_current);
  end if;

  insert into public.rgpd_ops_audit_events (workspace_id, action, entity, entity_id)
  values (p_workspace, 'entity_deleted', p_entity, p_id);

  return jsonb_build_object('status', 'ok', 'id', v_deleted);
end;
$$;

-- Perfil y alcance, con la versión del espacio. Audita los NOMBRES de las
-- claves que cambian, no sus valores.
create or replace function public.rgpd_ops_update_profile(
  p_workspace uuid,
  p_version integer,
  p_profile jsonb
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_old jsonb;
  v_row jsonb;
  v_fields text[];
  v_exists boolean;
begin
  if p_profile is null or jsonb_typeof(p_profile) <> 'object' then
    raise exception 'invalid_values' using errcode = '22023';
  end if;

  select w.profile into v_old from public.rgpd_ops_workspaces w
  where w.id = p_workspace and w.version = p_version
  for update;

  if not found then
    select exists (select 1 from public.rgpd_ops_workspaces w where w.id = p_workspace) into v_exists;
    if not v_exists then
      return jsonb_build_object('status', 'not_found');
    end if;
    return jsonb_build_object(
      'status', 'conflict',
      'current', (select to_jsonb(w.*) from public.rgpd_ops_workspaces w where w.id = p_workspace)
    );
  end if;

  update public.rgpd_ops_workspaces w set profile = p_profile
  where w.id = p_workspace
  returning to_jsonb(w.*) into v_row;

  select coalesce(array_agg(key order by key), '{}') into v_fields
  from (
    select coalesce(n.key, o.key) as key
    from jsonb_each(p_profile) n
    full join jsonb_each(coalesce(v_old, '{}'::jsonb)) o on o.key = n.key
    where n.value is distinct from o.value
  ) changed;

  insert into public.rgpd_ops_audit_events (workspace_id, action, fields)
  values (p_workspace, 'profile_updated', v_fields[1:40]);

  return jsonb_build_object('status', 'ok', 'row', v_row);
end;
$$;

-- Evento de auditoría sin cambio de datos (exportación, acceso).
create or replace function public.rgpd_ops_log_event(p_workspace uuid, p_action text, p_detail text default null)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if p_action not in ('export', 'access') then
    raise exception 'invalid_action' using errcode = '22023';
  end if;
  insert into public.rgpd_ops_audit_events (workspace_id, action, detail)
  values (p_workspace, p_action, p_detail);
end;
$$;

-- Lectura completa del espacio en una sola llamada. p_limit acota cada lista.
create or replace function public.rgpd_ops_workspace_snapshot(p_workspace uuid, p_limit integer default 500)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select case when w.id is null then null else jsonb_build_object(
    'workspace', to_jsonb(w.*),
    'tratamientos', coalesce((select jsonb_agg(to_jsonb(x.*) order by x.created_at) from (select * from public.rgpd_ops_processing_activities where workspace_id = w.id order by created_at limit p_limit) x), '[]'::jsonb),
    'proveedores', coalesce((select jsonb_agg(to_jsonb(x.*) order by x.created_at) from (select * from public.rgpd_ops_processors where workspace_id = w.id order by created_at limit p_limit) x), '[]'::jsonb),
    'captacion', coalesce((select jsonb_agg(to_jsonb(x.*) order by x.created_at) from (select * from public.rgpd_ops_collection_points where workspace_id = w.id order by created_at limit p_limit) x), '[]'::jsonb),
    'solicitudes', coalesce((select jsonb_agg(to_jsonb(x.*) order by x.received_on desc, x.created_at desc) from (select * from public.rgpd_ops_rights_requests where workspace_id = w.id order by received_on desc, created_at desc limit p_limit) x), '[]'::jsonb),
    'incidentes', coalesce((select jsonb_agg(to_jsonb(x.*) order by x.detected_at desc) from (select * from public.rgpd_ops_incidents where workspace_id = w.id order by detected_at desc limit p_limit) x), '[]'::jsonb),
    'tareas', coalesce((select jsonb_agg(to_jsonb(x.*) order by x.created_at) from (select * from public.rgpd_ops_tasks where workspace_id = w.id order by created_at limit p_limit) x), '[]'::jsonb),
    'evidencias', coalesce((select jsonb_agg(to_jsonb(x.*) order by x.created_at) from (select * from public.rgpd_ops_evidence_items where workspace_id = w.id order by created_at limit p_limit) x), '[]'::jsonb),
    'revisiones', coalesce((select jsonb_agg(to_jsonb(x.*) order by x.period desc) from (select * from public.rgpd_ops_review_cycles where workspace_id = w.id order by period desc limit p_limit) x), '[]'::jsonb),
    'auditoria', coalesce((select jsonb_agg(to_jsonb(x.*) order by x.occurred_at desc) from (select id, occurred_at, actor, action, entity, entity_id, fields, detail from public.rgpd_ops_audit_events where workspace_id = w.id order by occurred_at desc limit 200) x), '[]'::jsonb)
  ) end
  from (select 1) one
  left join public.rgpd_ops_workspaces w on w.id = p_workspace;
$$;

-- Política de conservación: borra los espacios cuyo acceso terminó (o se
-- revocó) hace más de p_grace_days días. Los pedidos se conservan
-- (documentación contable). Ejecutar al menos una vez al mes (docs §Operación).
create or replace function public.rgpd_ops_purge_expired_workspaces(p_grace_days integer default 90)
returns integer
language sql
set search_path = ''
as $$
  with deleted as (
    delete from public.rgpd_ops_workspaces w
    using public.rgpd_ops_orders o
    where w.order_id = o.id
      and (
        (o.access_expires_at is not null and o.access_expires_at < now() - make_interval(days => p_grace_days))
        or (o.access_status = 'revoked' and coalesce(o.refunded_at, o.updated_at) < now() - make_interval(days => p_grace_days))
      )
    returning 1
  )
  select count(*)::integer from deleted;
$$;

-- ===========================================================================
-- Seguridad: solo service role
-- ===========================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'rgpd_ops_orders','rgpd_ops_access_tokens','rgpd_ops_webhook_events','rgpd_ops_rate_limits',
    'rgpd_ops_workspaces','rgpd_ops_processing_activities','rgpd_ops_processors','rgpd_ops_collection_points',
    'rgpd_ops_rights_requests','rgpd_ops_incidents','rgpd_ops_tasks','rgpd_ops_evidence_items',
    'rgpd_ops_review_cycles','rgpd_ops_audit_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end;
$$;

-- Las funciones nacen ejecutables por PUBLIC: se revoca explícitamente.
revoke all on function public.rgpd_ops_rate_limit_hit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.rgpd_ops_rate_limits_prune() from public, anon, authenticated;
revoke all on function public.rgpd_ops_bump_workspace_version() from public, anon, authenticated;
revoke all on function public.rgpd_ops_bump_entity_version() from public, anon, authenticated;
revoke all on function public.rgpd_ops_audit_guard() from public, anon, authenticated;
revoke all on function public.rgpd_ops_entity_table(text) from public, anon, authenticated;
revoke all on function public.rgpd_ops_entity_columns(text) from public, anon, authenticated;
revoke all on function public.rgpd_ops_checked_keys(text, jsonb) from public, anon, authenticated;
revoke all on function public.rgpd_ops_ensure_workspace(uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.rgpd_ops_entity_create(uuid, text, jsonb, integer) from public, anon, authenticated;
revoke all on function public.rgpd_ops_entity_update(uuid, text, uuid, integer, jsonb) from public, anon, authenticated;
revoke all on function public.rgpd_ops_entity_delete(uuid, text, uuid, integer) from public, anon, authenticated;
revoke all on function public.rgpd_ops_update_profile(uuid, integer, jsonb) from public, anon, authenticated;
revoke all on function public.rgpd_ops_log_event(uuid, text, text) from public, anon, authenticated;
revoke all on function public.rgpd_ops_workspace_snapshot(uuid, integer) from public, anon, authenticated;
revoke all on function public.rgpd_ops_purge_expired_workspaces(integer) from public, anon, authenticated;

grant execute on function public.rgpd_ops_rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.rgpd_ops_rate_limits_prune() to service_role;
grant execute on function public.rgpd_ops_entity_table(text) to service_role;
grant execute on function public.rgpd_ops_entity_columns(text) to service_role;
grant execute on function public.rgpd_ops_checked_keys(text, jsonb) to service_role;
grant execute on function public.rgpd_ops_ensure_workspace(uuid, text, jsonb) to service_role;
grant execute on function public.rgpd_ops_entity_create(uuid, text, jsonb, integer) to service_role;
grant execute on function public.rgpd_ops_entity_update(uuid, text, uuid, integer, jsonb) to service_role;
grant execute on function public.rgpd_ops_entity_delete(uuid, text, uuid, integer) to service_role;
grant execute on function public.rgpd_ops_update_profile(uuid, integer, jsonb) to service_role;
grant execute on function public.rgpd_ops_log_event(uuid, text, text) to service_role;
grant execute on function public.rgpd_ops_workspace_snapshot(uuid, integer) to service_role;
grant execute on function public.rgpd_ops_purge_expired_workspaces(integer) to service_role;

notify pgrst, 'reload schema';
