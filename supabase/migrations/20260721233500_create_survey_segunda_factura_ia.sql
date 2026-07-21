create extension if not exists pgcrypto;

create table if not exists public.survey_responses (
  response_id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  questionnaire_version text not null,
  status text not null check (status in ('started', 'abandoned', 'completed', 'flagged')),
  locale text not null default 'es',
  questionnaire_language text not null default 'es-ES',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz not null default now(),
  submitted_at timestamptz null,
  abandoned_at timestamptz null,
  completion_step integer not null default 0,
  total_steps integer not null default 12,
  answers jsonb not null default '{}'::jsonb,
  consent jsonb not null default '{}'::jsonb,
  optional_email_provided boolean not null default false,
  quality_flags jsonb not null default '[]'::jsonb,
  review_status text not null default 'clean' check (review_status in ('clean', 'needs_review', 'reviewed')),
  review_notes jsonb not null default '[]'::jsonb,
  fingerprint_hash text not null,
  answer_signature text not null default '',
  landing_path text not null default '',
  referrer text not null default '',
  origin_label text not null default 'direct',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  utm_term text not null default '',
  utm_content text not null default '',
  user_agent_hash text not null default '',
  device_category text not null default 'unknown',
  duration_ms integer not null default 0
);

create table if not exists public.survey_response_emails (
  response_id uuid primary key references public.survey_responses(response_id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  locale text not null default 'es',
  questionnaire_version text not null,
  email_marketing_accepted boolean not null default false
);

create index if not exists survey_responses_slug_idx
  on public.survey_responses (slug);

create index if not exists survey_responses_status_idx
  on public.survey_responses (status);

create index if not exists survey_responses_review_status_idx
  on public.survey_responses (review_status);

create index if not exists survey_responses_version_idx
  on public.survey_responses (questionnaire_version);

create index if not exists survey_responses_started_at_idx
  on public.survey_responses (started_at desc);

create index if not exists survey_responses_submitted_at_idx
  on public.survey_responses (submitted_at desc);

create index if not exists survey_responses_utm_campaign_idx
  on public.survey_responses (utm_campaign);

create index if not exists survey_responses_fingerprint_hash_idx
  on public.survey_responses (fingerprint_hash);

create or replace function public.set_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_survey_responses_set_updated_at on public.survey_responses;
create trigger trg_survey_responses_set_updated_at
before update on public.survey_responses
for each row
execute function public.set_timestamp_updated_at();

alter table public.survey_responses enable row level security;
alter table public.survey_response_emails enable row level security;

revoke all on public.survey_responses from anon, authenticated;
revoke all on public.survey_response_emails from anon, authenticated;
