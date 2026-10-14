-- Hotel Revenue Operator — Fase 1: leads de la calculadora y rate limit.
--
-- NO se aplica automáticamente. Ver docs/hotel-revenue-operator.md
-- («Aplicar la migración»). Idempotente: se puede ejecutar dos veces sin error.
--
-- Principios:
-- - Escritura solo server-side con la service role (src/pages/api/hotel-revenue/lead.ts).
--   RLS activado y sin políticas; anon y authenticated sin permisos de tabla
--   ni de ejecución de funciones.
-- - Idempotencia: cada envío del formulario lleva un submission_id (UUID del
--   navegador, estable entre reintentos). UNIQUE(submission_id) hace que un
--   doble clic o un reintento de red no creen dos leads.
-- - Notificación interna sin duplicados: el email se «reclama» con
--   hotel_revenue_claim_notification() antes de enviarse; dos peticiones
--   concurrentes del mismo envío no pueden reclamarlo a la vez.
-- - Los resultados financieros los calcula SIEMPRE el servidor
--   (src/lib/hotel-revenue/calculator.ts); calculator_version permite
--   reinterpretar leads antiguos si el modelo cambia.
-- - Sin IP: el rate limit guarda solo un HMAC del ámbito y el identificador.
-- - Sin datos de huéspedes: la tabla no tiene dónde guardarlos.

create extension if not exists pgcrypto;

-- ===========================================================================
-- Leads
-- ===========================================================================

create table if not exists public.hotel_revenue_leads (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'qualified', 'contacted', 'pilot', 'won', 'lost')),

  name text not null check (char_length(name) between 2 and 120),
  email text not null check (
    email = lower(email)
    and char_length(email) between 6 and 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'
  ),
  hotel_name text not null check (char_length(hotel_name) between 2 and 160),
  website text null check (website is null or (char_length(website) <= 200 and website ~ '^https?://[a-z0-9.-]+')),
  phone text null check (phone is null or (char_length(phone) <= 32 and phone ~ '^[0-9 ()+.-]+$')),
  property_count integer not null check (property_count between 1 and 200),
  room_count integer not null check (room_count between 1 and 20000),

  calculator_version text not null check (char_length(calculator_version) between 1 and 20),
  calculator_inputs jsonb not null check (
    jsonb_typeof(calculator_inputs) = 'object'
    and calculator_inputs ?& array['rooms', 'occupancyPct', 'adr', 'avgStayNights', 'otaSharePct', 'otaCommissionPct', 'upsellAvg']
    and pg_column_size(calculator_inputs) <= 2048
  ),
  calculator_results jsonb not null check (
    jsonb_typeof(calculator_results) = 'object'
    and calculator_results ? 'scenarios'
    and jsonb_typeof(calculator_results -> 'scenarios') = 'object'
    and (calculator_results -> 'scenarios') ?& array['conservative', 'realistic', 'potential']
    and pg_column_size(calculator_results) <= 8192
  ),

  utm_source text null check (utm_source is null or char_length(utm_source) between 1 and 100),
  utm_medium text null check (utm_medium is null or char_length(utm_medium) between 1 and 100),
  utm_campaign text null check (utm_campaign is null or char_length(utm_campaign) between 1 and 100),
  utm_content text null check (utm_content is null or char_length(utm_content) between 1 and 100),
  utm_term text null check (utm_term is null or char_length(utm_term) between 1 and 100),
  landing_path text not null check (char_length(landing_path) <= 200 and landing_path ~ '^/es/hoteles/'),
  referrer_host text null check (referrer_host is null or (char_length(referrer_host) <= 253 and referrer_host ~ '^[a-z0-9.-]+$')),
  cta_origin text not null default 'unknown' check (char_length(cta_origin) <= 40 and cta_origin ~ '^[a-z_]+$'),

  consent_version text not null check (char_length(consent_version) between 1 and 60),
  consent_at timestamptz not null,

  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  notification_attempts integer not null default 0 check (notification_attempts between 0 and 20),
  notification_error_code text null check (notification_error_code is null or char_length(notification_error_code) <= 80),
  notification_claimed_at timestamptz null,
  notification_sent_at timestamptz null
);

create index if not exists hotel_revenue_leads_created_at_idx on public.hotel_revenue_leads (created_at desc);
create index if not exists hotel_revenue_leads_status_idx on public.hotel_revenue_leads (status, created_at desc);
create index if not exists hotel_revenue_leads_email_idx on public.hotel_revenue_leads (email);
create index if not exists hotel_revenue_leads_notification_idx
  on public.hotel_revenue_leads (notification_status)
  where notification_status <> 'sent';

create or replace function public.hotel_revenue_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists hotel_revenue_leads_touch on public.hotel_revenue_leads;
create trigger hotel_revenue_leads_touch
  before update on public.hotel_revenue_leads
  for each row execute function public.hotel_revenue_touch_updated_at();

-- Reclama el envío de la notificación interna. Devuelve true solo a UNA
-- petición: la que pasa el lead de pending/failed (o de un 'sending'
-- abandonado hace más de 5 minutos) a 'sending'. Máximo 5 intentos.
create or replace function public.hotel_revenue_claim_notification(p_lead_id uuid)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  update public.hotel_revenue_leads
     set notification_status = 'sending',
         notification_attempts = notification_attempts + 1,
         notification_claimed_at = now()
   where id = p_lead_id
     and notification_attempts < 5
     and (
       notification_status in ('pending', 'failed')
       or (notification_status = 'sending' and notification_claimed_at < now() - interval '5 minutes')
     )
  returning id into v_id;
  return v_id is not null;
end;
$$;

-- ===========================================================================
-- Rate limit persistente (ventana fija atómica)
-- ===========================================================================
-- Tabla propia del producto: no depende de que la migración de RGPD Ops esté
-- aplicada. La clave es un HMAC (src/lib/commerce/tokens.ts, rateLimitKeyWith):
-- no se guarda ni la IP ni el email.

create table if not exists public.hotel_revenue_rate_limits (
  bucket_key text primary key check (bucket_key ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null default now(),
  hits integer not null default 0 check (hits >= 0)
);

create or replace function public.hotel_revenue_rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_hits integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit parameters' using errcode = '22023';
  end if;
  insert into public.hotel_revenue_rate_limits as rl (bucket_key, window_started_at, hits)
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

create or replace function public.hotel_revenue_rate_limits_prune()
returns integer
language sql
set search_path = ''
as $$
  with deleted as (
    delete from public.hotel_revenue_rate_limits
    where window_started_at < now() - interval '1 day'
    returning 1
  )
  select count(*)::integer from deleted;
$$;

-- ===========================================================================
-- Seguridad: solo service role
-- ===========================================================================

alter table public.hotel_revenue_leads enable row level security;
alter table public.hotel_revenue_rate_limits enable row level security;

revoke all on public.hotel_revenue_leads from anon, authenticated;
revoke all on public.hotel_revenue_rate_limits from anon, authenticated;
grant all on public.hotel_revenue_leads to service_role;
grant all on public.hotel_revenue_rate_limits to service_role;

-- Las funciones nacen ejecutables por PUBLIC: se revoca explícitamente.
revoke all on function public.hotel_revenue_touch_updated_at() from public, anon, authenticated;
revoke all on function public.hotel_revenue_claim_notification(uuid) from public, anon, authenticated;
revoke all on function public.hotel_revenue_rate_limit_hit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.hotel_revenue_rate_limits_prune() from public, anon, authenticated;

grant execute on function public.hotel_revenue_claim_notification(uuid) to service_role;
grant execute on function public.hotel_revenue_rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.hotel_revenue_rate_limits_prune() to service_role;

notify pgrst, 'reload schema';
