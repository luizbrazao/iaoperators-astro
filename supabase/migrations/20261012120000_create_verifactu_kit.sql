-- Kit de Preparación VERI*FACTU — pedidos, enlaces de acceso, eventos de Stripe
-- y rate limit persistente.
--
-- NO se aplica automáticamente. Ver docs/verifactu-kit.md («Aplicar la migración»).
--
-- Principios:
-- - Todo el acceso es server-side con la service role (endpoints de Astro en
--   Vercel). RLS activado y sin políticas: anon y authenticated no ven nada.
-- - Idempotencia en la base de datos, no en memoria: el mismo evento de Stripe
--   o la misma Checkout Session nunca generan dos pedidos.
-- - Nunca se guarda un token de acceso en claro: solo su SHA-256.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Pedidos
-- ---------------------------------------------------------------------------
create table if not exists public.verifactu_kit_orders (
  id uuid primary key default gen_random_uuid(),

  -- Email de la compra, normalizado en minúsculas. Es la clave para pedir un
  -- nuevo enlace de acceso.
  email text not null default '' check (email = lower(email)),
  customer_name text null,
  company_name text null,

  stripe_customer_id text null,
  stripe_checkout_session_id text not null unique,
  -- Único cuando existe. Postgres admite varios NULL en una columna unique, que
  -- es justo lo que hace falta para pagos con importe 0 (cupón del 100 %).
  stripe_payment_intent_id text null unique,
  stripe_price_id text not null default '',

  product_key text not null default 'verifactu-kit',
  product_version text not null default '',
  amount_total integer not null default 0,          -- céntimos, IVA incluido si lo hubo
  currency text not null default 'eur',

  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  access_status text not null default 'pending'
    check (access_status in ('pending', 'active', 'revoked')),

  -- Solo el identificador del test, nunca sus respuestas.
  assessment_response_id uuid null,

  -- Concesión de acceso: se marca una sola vez (UPDATE condicional sobre
  -- access_granted_at IS NULL). Es lo que garantiza un único email de compra
  -- aunque Stripe reenvíe el evento.
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

create index if not exists verifactu_kit_orders_email_idx
  on public.verifactu_kit_orders (email, created_at desc);

create index if not exists verifactu_kit_orders_status_idx
  on public.verifactu_kit_orders (payment_status, access_status);

-- Pedidos pagados cuyo email de acceso falló: la consulta de soporte diaria.
create index if not exists verifactu_kit_orders_email_failed_idx
  on public.verifactu_kit_orders (created_at desc)
  where access_email_status = 'failed';

-- ---------------------------------------------------------------------------
-- Enlaces de acceso (magic links)
-- ---------------------------------------------------------------------------
create table if not exists public.verifactu_kit_access_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.verifactu_kit_orders (id) on delete cascade,
  -- SHA-256 en hexadecimal del token aleatorio (32 bytes). El token en claro
  -- solo existe en el email del cliente.
  token_hash text not null unique check (char_length(token_hash) = 64),
  purpose text not null check (purpose in ('purchase', 'resend', 'admin_resend')),
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists verifactu_kit_access_tokens_order_idx
  on public.verifactu_kit_access_tokens (order_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Eventos de Stripe (idempotencia y protección contra replay)
-- ---------------------------------------------------------------------------
create table if not exists public.verifactu_kit_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  processing_status text not null default 'processing'
    check (processing_status in ('processing', 'processed', 'ignored', 'failed')),
  attempts integer not null default 1,
  processed_at timestamptz null,
  -- Código de error, nunca el payload ni datos personales.
  error_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Rate limit persistente (compatible con funciones serverless sin estado)
-- ---------------------------------------------------------------------------
create table if not exists public.verifactu_kit_rate_limits (
  -- HMAC del ámbito + identificador (IP o email). No guarda IPs ni emails.
  bucket_key text primary key,
  window_started_at timestamptz not null default now(),
  hits integer not null default 0
);

-- Ventana fija atómica: un solo INSERT ... ON CONFLICT, sin carreras entre
-- invocaciones concurrentes. Devuelve true si la petición está dentro del límite.
create or replace function public.verifactu_kit_rate_limit_hit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
as $$
declare
  v_hits integer;
begin
  insert into public.verifactu_kit_rate_limits as rl (bucket_key, window_started_at, hits)
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

-- Limpieza opcional (ver docs): borra contadores con más de un día.
create or replace function public.verifactu_kit_rate_limits_prune()
returns integer
language sql
as $$
  with deleted as (
    delete from public.verifactu_kit_rate_limits
    where window_started_at < now() - interval '1 day'
    returning 1
  )
  select count(*)::integer from deleted;
$$;

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_verifactu_kit_orders_set_updated_at on public.verifactu_kit_orders;
create trigger trg_verifactu_kit_orders_set_updated_at
before update on public.verifactu_kit_orders
for each row execute function public.set_timestamp_updated_at();

drop trigger if exists trg_verifactu_kit_webhook_events_set_updated_at on public.verifactu_kit_webhook_events;
create trigger trg_verifactu_kit_webhook_events_set_updated_at
before update on public.verifactu_kit_webhook_events
for each row execute function public.set_timestamp_updated_at();

-- ---------------------------------------------------------------------------
-- Seguridad: solo service role
-- ---------------------------------------------------------------------------
alter table public.verifactu_kit_orders enable row level security;
alter table public.verifactu_kit_access_tokens enable row level security;
alter table public.verifactu_kit_webhook_events enable row level security;
alter table public.verifactu_kit_rate_limits enable row level security;

revoke all on public.verifactu_kit_orders from anon, authenticated;
revoke all on public.verifactu_kit_access_tokens from anon, authenticated;
revoke all on public.verifactu_kit_webhook_events from anon, authenticated;
revoke all on public.verifactu_kit_rate_limits from anon, authenticated;

grant all on public.verifactu_kit_orders to service_role;
grant all on public.verifactu_kit_access_tokens to service_role;
grant all on public.verifactu_kit_webhook_events to service_role;
grant all on public.verifactu_kit_rate_limits to service_role;

revoke all on function public.verifactu_kit_rate_limit_hit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.verifactu_kit_rate_limits_prune() from public, anon, authenticated;
grant execute on function public.verifactu_kit_rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.verifactu_kit_rate_limits_prune() to service_role;

notify pgrst, 'reload schema';
