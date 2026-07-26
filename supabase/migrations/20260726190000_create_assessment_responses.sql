-- Test de cumplimiento (Frente A: Ley 10/2025). Tabla genérica por assessment_key
-- para que el test de Verifactu (Frente B) reutilice la misma estructura.
--
-- Separada de survey_responses a propósito: distinta base de consentimiento
-- (lead comercial identificado vs. estudio exploratorio anónimo) y distinto ciclo
-- de vida del dato.

create extension if not exists pgcrypto;

create table if not exists public.assessment_responses (
  response_id uuid primary key default gen_random_uuid(),
  assessment_key text not null,
  version text not null,
  engine_version text not null default '',
  locale text not null default 'es',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_at timestamptz null,

  answers jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,

  -- Columnas derivadas del resultado, materializadas para poder segmentar sin
  -- desempaquetar el jsonb en cada consulta (cuántos obligados por sector, etc.).
  obligado text not null default 'no' check (obligado in ('si', 'probable', 'no')),
  risk_level text not null default 'bajo' check (risk_level in ('critico', 'alto', 'medio', 'bajo')),
  risk_score integer not null default 0,
  sector text not null default '',

  email text null,
  consent jsonb not null default '{}'::jsonb,

  duration_ms integer not null default 0,
  landing_path text not null default '',
  referrer text not null default '',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  utm_term text not null default '',
  utm_content text not null default '',
  user_agent_hash text not null default '',
  device_category text not null default 'unknown',
  fingerprint_hash text not null default ''
);

create index if not exists assessment_responses_key_idx
  on public.assessment_responses (assessment_key);

create index if not exists assessment_responses_created_at_idx
  on public.assessment_responses (created_at desc);

create index if not exists assessment_responses_obligado_idx
  on public.assessment_responses (assessment_key, obligado);

create index if not exists assessment_responses_sector_idx
  on public.assessment_responses (assessment_key, sector);

create index if not exists assessment_responses_utm_campaign_idx
  on public.assessment_responses (utm_campaign);

-- Lead cualificado = completó el test y dejó email. Índice parcial para la vista
-- comercial, que es la consulta que se va a hacer todos los días.
create index if not exists assessment_responses_leads_idx
  on public.assessment_responses (assessment_key, created_at desc)
  where email is not null;

create index if not exists assessment_responses_fingerprint_idx
  on public.assessment_responses (fingerprint_hash);

-- Reutiliza la función de timestamp ya creada por la migración de la encuesta.
create or replace function public.set_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_assessment_responses_set_updated_at on public.assessment_responses;
create trigger trg_assessment_responses_set_updated_at
before update on public.assessment_responses
for each row
execute function public.set_timestamp_updated_at();

-- Acceso solo por service role (los endpoints de Astro). Nada para anon.
alter table public.assessment_responses enable row level security;
revoke all on public.assessment_responses from anon, authenticated;
