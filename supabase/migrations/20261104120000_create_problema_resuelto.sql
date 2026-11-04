-- Programa «Problema Resuelto»: casos enviados desde /es/problema-resuelto/,
-- rate limit y reclamación de la notificación interna.
--
-- NO se aplica automáticamente. Ver docs/problema-resuelto.md («Aplicar la
-- migración»). Idempotente: se puede ejecutar dos veces sin error.
--
-- Principios:
-- - Escritura solo server-side con la service role
--   (src/pages/api/problema-resuelto/submit.ts). RLS activado y sin políticas;
--   anon y authenticated sin permisos de tabla ni de ejecución de funciones.
-- - Nada se guarda durante la conversación con el agente: la transcripción
--   viaja firmada (HMAC) entre navegador y servidor y solo se inserta aquí
--   cuando la persona envía el formulario con su consentimiento.
-- - Idempotencia: cada envío lleva un submission_id (UUID del navegador,
--   estable entre reintentos). UNIQUE(submission_id) evita casos duplicados.
-- - Notificación interna sin duplicados: problema_resuelto_claim_notification()
--   «reclama» el envío del email antes de mandarlo.
-- - Sin IP: el rate limit guarda solo un HMAC del ámbito y el identificador.
-- - La ficha la genera un modelo de lenguaje a partir de la conversación. Es
--   una sugerencia interna: la decisión (status) la toma siempre una persona.

create extension if not exists pgcrypto;

-- ===========================================================================
-- Casos
-- ===========================================================================

create table if not exists public.problema_resuelto_casos (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Estado del caso. Lo cambia Luiz a mano desde el editor de Supabase.
  status text not null default 'nuevo'
    check (status in ('nuevo', 'en_revision', 'aceptado', 'reducido', 'rechazado', 'en_construccion', 'entregado', 'convertido')),
  -- chat = triaje con el agente; form = formulario de respaldo (agente no disponible).
  mode text not null check (mode in ('chat', 'form')),

  name text not null check (char_length(name) between 2 and 120),
  email text not null check (
    email = lower(email)
    and char_length(email) between 6 and 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$'
  ),
  company text not null check (char_length(company) between 2 and 160),
  job_title text not null check (char_length(job_title) between 2 and 120),
  company_size text not null check (company_size in ('1-9', '10-49', '50-249', '250+')),
  manager_aware text not null check (manager_aware in ('si', 'no', 'todavia_no')),

  -- Primer mensaje (chat) o descripción de la situación (form), para leer de un vistazo.
  problem_text text not null check (char_length(problem_text) between 10 and 4000),
  transcript jsonb null check (
    transcript is null or (
      jsonb_typeof(transcript) = 'array'
      and jsonb_array_length(transcript) between 1 and 12
      and pg_column_size(transcript) <= 40000
    )
  ),
  answers jsonb null check (
    answers is null or (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 16000)
  ),
  -- true si el servidor ocultó emails, teléfonos, DNI/NIE o IBAN del texto.
  pii_masked boolean not null default false,

  ficha jsonb null check (ficha is null or (jsonb_typeof(ficha) = 'object' and pg_column_size(ficha) <= 16000)),
  ficha_status text not null default 'pending' check (ficha_status in ('pending', 'ok', 'failed', 'skipped')),
  ficha_error_code text null check (ficha_error_code is null or char_length(ficha_error_code) <= 80),
  prompt_version text not null check (char_length(prompt_version) between 1 and 40),
  llm_model text null check (llm_model is null or char_length(llm_model) <= 80),

  utm_source text null check (utm_source is null or char_length(utm_source) between 1 and 100),
  utm_medium text null check (utm_medium is null or char_length(utm_medium) between 1 and 100),
  utm_campaign text null check (utm_campaign is null or char_length(utm_campaign) between 1 and 100),
  utm_content text null check (utm_content is null or char_length(utm_content) between 1 and 100),
  utm_term text null check (utm_term is null or char_length(utm_term) between 1 and 100),
  landing_path text not null check (char_length(landing_path) <= 200 and landing_path ~ '^/es/problema-resuelto/'),
  referrer_host text null check (referrer_host is null or (char_length(referrer_host) <= 253 and referrer_host ~ '^[a-z0-9.-]+$')),

  consent_version text not null check (char_length(consent_version) between 1 and 60),
  bases_version text not null check (char_length(bases_version) between 1 and 60),
  consent_at timestamptz not null,

  -- Seguimiento manual.
  decision_notes text null check (decision_notes is null or char_length(decision_notes) <= 4000),
  responded_at timestamptz null,

  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sending', 'sent', 'failed', 'skipped')),
  notification_attempts integer not null default 0 check (notification_attempts between 0 and 20),
  notification_error_code text null check (notification_error_code is null or char_length(notification_error_code) <= 80),
  notification_claimed_at timestamptz null,
  notification_sent_at timestamptz null,

  constraint problema_resuelto_casos_mode_payload check (
    (mode = 'chat' and transcript is not null and answers is null)
    or (mode = 'form' and answers is not null and transcript is null)
  )
);

create index if not exists problema_resuelto_casos_created_at_idx on public.problema_resuelto_casos (created_at desc);
create index if not exists problema_resuelto_casos_status_idx on public.problema_resuelto_casos (status, created_at desc);
create index if not exists problema_resuelto_casos_email_idx on public.problema_resuelto_casos (email);
create index if not exists problema_resuelto_casos_notification_idx
  on public.problema_resuelto_casos (notification_status)
  where notification_status <> 'sent';

create or replace function public.problema_resuelto_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists problema_resuelto_casos_touch on public.problema_resuelto_casos;
create trigger problema_resuelto_casos_touch
  before update on public.problema_resuelto_casos
  for each row execute function public.problema_resuelto_touch_updated_at();

-- Reclama el envío de la notificación interna. Devuelve true solo a UNA
-- petición: la que pasa el caso de pending/failed (o de un 'sending'
-- abandonado hace más de 5 minutos) a 'sending'. Máximo 5 intentos.
create or replace function public.problema_resuelto_claim_notification(p_caso_id uuid)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  update public.problema_resuelto_casos
     set notification_status = 'sending',
         notification_attempts = notification_attempts + 1,
         notification_claimed_at = now()
   where id = p_caso_id
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
-- Tabla propia del programa. La clave es un HMAC (src/lib/commerce/tokens.ts,
-- rateLimitKeyWith): no se guarda ni la IP ni el email. También limita el
-- número total de turnos del agente al día (coste del modelo).

create table if not exists public.problema_resuelto_rate_limits (
  bucket_key text primary key check (bucket_key ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null default now(),
  hits integer not null default 0 check (hits >= 0)
);

create or replace function public.problema_resuelto_rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
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
  insert into public.problema_resuelto_rate_limits as rl (bucket_key, window_started_at, hits)
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

create or replace function public.problema_resuelto_rate_limits_prune()
returns integer
language sql
set search_path = ''
as $$
  with deleted as (
    delete from public.problema_resuelto_rate_limits
    where window_started_at < now() - interval '2 days'
    returning 1
  )
  select count(*)::integer from deleted;
$$;

-- ===========================================================================
-- Seguridad: solo service role
-- ===========================================================================

alter table public.problema_resuelto_casos enable row level security;
alter table public.problema_resuelto_rate_limits enable row level security;

revoke all on public.problema_resuelto_casos from anon, authenticated;
revoke all on public.problema_resuelto_rate_limits from anon, authenticated;
grant all on public.problema_resuelto_casos to service_role;
grant all on public.problema_resuelto_rate_limits to service_role;

-- Las funciones nacen ejecutables por PUBLIC: se revoca explícitamente.
revoke all on function public.problema_resuelto_touch_updated_at() from public, anon, authenticated;
revoke all on function public.problema_resuelto_claim_notification(uuid) from public, anon, authenticated;
revoke all on function public.problema_resuelto_rate_limit_hit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.problema_resuelto_rate_limits_prune() from public, anon, authenticated;

grant execute on function public.problema_resuelto_claim_notification(uuid) to service_role;
grant execute on function public.problema_resuelto_rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.problema_resuelto_rate_limits_prune() to service_role;

notify pgrst, 'reload schema';
