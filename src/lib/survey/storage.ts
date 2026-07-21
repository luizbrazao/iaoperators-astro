import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  ReviewStatus,
  SurveyEmailRecord,
  SurveyRecord,
  SurveySessionCreateInput,
  SurveySessionPatchInput,
  SurveySubmissionInput,
} from "./types";
import { SURVEY_SLUG, SURVEY_TITLE, SURVEY_VERSION } from "./types";
import { answerSignature, safeJsonParse } from "./utils";
import { deriveQualityFlags } from "./validation";

function readEnv(name: string) {
  const importMetaEnv =
    typeof import.meta !== "undefined" &&
    typeof import.meta.env !== "undefined" &&
    import.meta.env
      ? (import.meta.env as Record<string, string | undefined>)
      : undefined;
  return importMetaEnv?.[name] ?? process.env[name];
}

const LOCAL_ROOT =
  readEnv("SURVEY_LOCAL_STORAGE_DIR") || join(process.cwd(), "work", "survey-data", SURVEY_SLUG);

const SUPABASE_URL = readEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = readEnv("SUPABASE_SERVICE_ROLE_KEY");
const STORAGE_DRIVER =
  readEnv("SURVEY_STORAGE_DRIVER") ||
  (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "local");
const RESPONSES_TABLE = readEnv("SURVEY_SUPABASE_RESPONSES_TABLE") || "survey_responses";
const EMAILS_TABLE = readEnv("SURVEY_SUPABASE_EMAILS_TABLE") || "survey_response_emails";

const RESPONSES_DIR = join(LOCAL_ROOT, "responses");
const EMAILS_DIR = join(LOCAL_ROOT, "emails");

let supabaseAdminClient: SupabaseClient | null = null;

type SurveyResponseRow = {
  response_id: string;
  slug: string;
  title: string;
  questionnaire_version: string;
  status: string;
  locale: string;
  questionnaire_language: string;
  created_at: string;
  updated_at: string;
  started_at: string;
  submitted_at: string | null;
  abandoned_at: string | null;
  completion_step: number;
  total_steps: number;
  answers: Record<string, unknown>;
  consent: Record<string, unknown>;
  optional_email_provided: boolean;
  quality_flags: Array<Record<string, unknown>>;
  review_status: string;
  review_notes: string[];
  fingerprint_hash: string;
  answer_signature: string;
  landing_path: string;
  referrer: string;
  origin_label: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  user_agent_hash: string;
  device_category: string;
  duration_ms: number;
};

function nowIso() {
  return new Date().toISOString();
}

function getStorageMode() {
  return STORAGE_DRIVER === "supabase" ? "supabase" : "local";
}

function getSupabaseAdminClient() {
  if (supabaseAdminClient) return supabaseAdminClient;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        "X-Client-Info": "iaoperators-survey-server",
      },
    },
  });

  return supabaseAdminClient;
}

async function ensureLocalDir(path: string) {
  await mkdir(path, { recursive: true });
}

async function writeJson(path: string, data: unknown) {
  await ensureLocalDir(dirname(path));
  await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  if (!existsSync(path)) return fallback;
  const content = await readFile(path, "utf-8");
  return safeJsonParse(content, fallback);
}

function getResponsePath(responseId: string) {
  return join(RESPONSES_DIR, `${responseId}.json`);
}

function getEmailPath(responseId: string) {
  return join(EMAILS_DIR, `${responseId}.json`);
}

function responseToRow(record: SurveyRecord): SurveyResponseRow {
  return {
    response_id: record.responseId,
    slug: record.slug,
    title: record.title,
    questionnaire_version: record.questionnaireVersion,
    status: record.status,
    locale: record.locale,
    questionnaire_language: record.questionnaireLanguage,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    started_at: record.startedAt,
    submitted_at: record.submittedAt ?? null,
    abandoned_at: record.abandonedAt ?? null,
    completion_step: record.completionStep,
    total_steps: record.totalSteps,
    answers: record.answers,
    consent: record.consent as unknown as Record<string, unknown>,
    optional_email_provided: record.optionalEmailProvided,
    quality_flags: record.qualityFlags as unknown as Array<Record<string, unknown>>,
    review_status: record.reviewStatus,
    review_notes: record.reviewNotes,
    fingerprint_hash: record.fingerprintHash,
    answer_signature: record.answerSignature,
    landing_path: record.source.landingPath,
    referrer: record.source.referrer,
    origin_label: record.source.originLabel,
    utm_source: record.source.utms.source,
    utm_medium: record.source.utms.medium,
    utm_campaign: record.source.utms.campaign,
    utm_term: record.source.utms.term,
    utm_content: record.source.utms.content,
    user_agent_hash: record.source.userAgentHash,
    device_category: record.source.deviceCategory,
    duration_ms: record.durationMs,
  };
}

function rowToRecord(row: SurveyResponseRow): SurveyRecord {
  return {
    responseId: row.response_id,
    slug: SURVEY_SLUG,
    title: SURVEY_TITLE,
    questionnaireVersion: row.questionnaire_version as typeof SURVEY_VERSION,
    status: row.status as SurveyRecord["status"],
    locale: row.locale,
    questionnaireLanguage: row.questionnaire_language,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at,
    submittedAt: row.submitted_at ?? undefined,
    abandonedAt: row.abandoned_at ?? undefined,
    completionStep: row.completion_step,
    totalSteps: row.total_steps,
    answers: (row.answers ?? {}) as SurveyRecord["answers"],
    consent: {
      accepted: Boolean((row.consent ?? {}).accepted),
      confidentialityNoticeAccepted: Boolean((row.consent ?? {}).confidentialityNoticeAccepted),
      aggregateUseAccepted: Boolean((row.consent ?? {}).aggregateUseAccepted),
      deletionRightsRead: Boolean((row.consent ?? {}).deletionRightsRead),
      emailMarketingAccepted: Boolean((row.consent ?? {}).emailMarketingAccepted),
    },
    optionalEmailProvided: Boolean(row.optional_email_provided),
    qualityFlags: Array.isArray(row.quality_flags) ? (row.quality_flags as SurveyRecord["qualityFlags"]) : [],
    reviewStatus: row.review_status as ReviewStatus,
    reviewNotes: Array.isArray(row.review_notes) ? row.review_notes : [],
    fingerprintHash: row.fingerprint_hash,
    answerSignature: row.answer_signature ?? "",
    source: {
      landingPath: row.landing_path ?? "",
      referrer: row.referrer ?? "",
      utms: {
        source: row.utm_source ?? "",
        medium: row.utm_medium ?? "",
        campaign: row.utm_campaign ?? "",
        term: row.utm_term ?? "",
        content: row.utm_content ?? "",
      },
      locale: row.locale ?? "es",
      originLabel: row.origin_label ?? "direct",
      userAgentHash: row.user_agent_hash ?? "",
      deviceCategory: (row.device_category ?? "unknown") as SurveyRecord["source"]["deviceCategory"],
    },
    durationMs: row.duration_ms ?? 0,
  };
}

async function localListRecords() {
  await ensureLocalDir(RESPONSES_DIR);
  const files = await readdir(RESPONSES_DIR);
  const records = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map((file) => readJson<SurveyRecord>(join(RESPONSES_DIR, file), null as unknown as SurveyRecord)),
  );
  return records.filter(Boolean).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

async function localGetRecord(responseId: string) {
  return readJson<SurveyRecord | null>(getResponsePath(responseId), null);
}

async function localUpsertRecord(record: SurveyRecord) {
  await writeJson(getResponsePath(record.responseId), record);
  return record;
}

async function localSaveEmail(record: SurveyEmailRecord) {
  await writeJson(getEmailPath(record.responseId), record);
}

async function localCountDuplicates(responseId: string, fingerprintHash: string, startedAt: string) {
  const allRecords = await localListRecords();
  return allRecords.some(
    (record) =>
      record.responseId !== responseId &&
      record.fingerprintHash === fingerprintHash &&
      Math.abs(Date.parse(record.startedAt) - Date.parse(startedAt)) < 1000 * 60 * 60 * 24,
  );
}

async function supabaseListRecords(filters?: {
  status?: string;
  reviewStatus?: string;
  version?: string;
  campaign?: string;
}) {
  let query = getSupabaseAdminClient()
    .from(RESPONSES_TABLE)
    .select("*")
    .order("started_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.reviewStatus) query = query.eq("review_status", filters.reviewStatus);
  if (filters?.version) query = query.eq("questionnaire_version", filters.version);
  if (filters?.campaign) query = query.eq("utm_campaign", filters.campaign);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => rowToRecord(row as SurveyResponseRow));
}

async function supabaseGetRecord(responseId: string) {
  const { data, error } = await getSupabaseAdminClient()
    .from(RESPONSES_TABLE)
    .select("*")
    .eq("response_id", responseId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToRecord(data as SurveyResponseRow) : null;
}

async function supabaseUpsertRecord(record: SurveyRecord) {
  const row = responseToRow(record);
  const { error } = await getSupabaseAdminClient()
    .from(RESPONSES_TABLE)
    .upsert(row, { onConflict: "response_id" });

  if (error) throw error;
  return record;
}

async function supabaseSaveEmail(record: SurveyEmailRecord) {
  const { error } = await getSupabaseAdminClient().from(EMAILS_TABLE).upsert(
    {
      response_id: record.responseId,
      email: record.email,
      created_at: record.createdAt,
      locale: record.locale,
      questionnaire_version: record.questionnaireVersion,
      email_marketing_accepted: record.emailMarketingAccepted,
    },
    { onConflict: "response_id" },
  );

  if (error) throw error;
}

async function supabaseCountDuplicates(responseId: string, fingerprintHash: string, startedAt: string) {
  const since = new Date(Date.parse(startedAt) - 1000 * 60 * 60 * 24).toISOString();
  const until = new Date(Date.parse(startedAt) + 1000 * 60 * 60 * 24).toISOString();

  const { count, error } = await getSupabaseAdminClient()
    .from(RESPONSES_TABLE)
    .select("response_id", { count: "exact", head: true })
    .eq("fingerprint_hash", fingerprintHash)
    .neq("response_id", responseId)
    .gte("started_at", since)
    .lte("started_at", until);

  if (error) throw error;
  return Boolean(count && count > 0);
}

async function listAllRecords() {
  return getStorageMode() === "supabase" ? supabaseListRecords() : localListRecords();
}

async function getRecord(responseId: string) {
  return getStorageMode() === "supabase" ? supabaseGetRecord(responseId) : localGetRecord(responseId);
}

async function upsertRecord(record: SurveyRecord) {
  return getStorageMode() === "supabase" ? supabaseUpsertRecord(record) : localUpsertRecord(record);
}

async function saveEmail(record: SurveyEmailRecord) {
  return getStorageMode() === "supabase" ? supabaseSaveEmail(record) : localSaveEmail(record);
}

async function hasPotentialDuplicate(responseId: string, fingerprintHash: string, startedAt: string) {
  return getStorageMode() === "supabase"
    ? supabaseCountDuplicates(responseId, fingerprintHash, startedAt)
    : localCountDuplicates(responseId, fingerprintHash, startedAt);
}

export async function createSurveySession(input: SurveySessionCreateInput) {
  const responseId = globalThis.crypto.randomUUID();
  const timestamp = nowIso();

  const record: SurveyRecord = {
    responseId,
    slug: SURVEY_SLUG,
    questionnaireVersion: SURVEY_VERSION,
    title: SURVEY_TITLE,
    status: "started",
    locale: input.locale,
    questionnaireLanguage: input.questionnaireLanguage,
    createdAt: timestamp,
    updatedAt: timestamp,
    startedAt: timestamp,
    completionStep: 0,
    totalSteps: 12,
    answers: {},
    consent: {
      accepted: false,
      confidentialityNoticeAccepted: false,
      aggregateUseAccepted: false,
      deletionRightsRead: false,
      emailMarketingAccepted: false,
    },
    optionalEmailProvided: false,
    qualityFlags: [],
    reviewStatus: "clean",
    reviewNotes: [],
    fingerprintHash: input.fingerprintHash,
    answerSignature: "",
    source: {
      landingPath: input.landingPath,
      referrer: input.referrer,
      utms: input.utms,
      locale: input.locale,
      originLabel: input.utms.source || (input.referrer ? "referral" : "direct"),
      userAgentHash: input.userAgentHash,
      deviceCategory: input.deviceCategory,
    },
    durationMs: 0,
  };

  await upsertRecord(record);
  return record;
}

export async function updateSurveySession(input: SurveySessionPatchInput) {
  const record = await getRecord(input.responseId);
  if (!record) throw new Error("Survey session not found.");

  const next: SurveyRecord = {
    ...record,
    status: input.status ?? record.status,
    completionStep: Math.max(record.completionStep, input.completionStep ?? record.completionStep),
    answers: input.answers ? { ...record.answers, ...input.answers } : record.answers,
    durationMs: input.durationMs ?? record.durationMs,
    qualityFlags: input.qualityFlags ?? record.qualityFlags,
    reviewStatus: input.reviewStatus ?? record.reviewStatus,
    reviewNotes: input.reviewNote ? [...record.reviewNotes, input.reviewNote] : record.reviewNotes,
    updatedAt: nowIso(),
    abandonedAt: input.status === "abandoned" ? nowIso() : record.abandonedAt,
  };

  await upsertRecord(next);
  return next;
}

export async function finalizeSurveySubmission(input: SurveySubmissionInput) {
  const existing = await getRecord(input.responseId);
  if (!existing) throw new Error("Survey session not found.");

  const possibleDuplicate = await hasPotentialDuplicate(
    input.responseId,
    input.fingerprintHash,
    existing.startedAt,
  );

  const baseFlags = deriveQualityFlags({
    answers: input.answers,
    durationMs: input.durationMs,
    fingerprintIsDuplicate: possibleDuplicate,
    status: "completed",
    userAgentMissing: !existing.source.userAgentHash,
  });

  const record: SurveyRecord = {
    ...existing,
    status: "completed",
    answers: input.answers,
    consent: input.consent,
    optionalEmailProvided: Boolean(input.email),
    qualityFlags: baseFlags,
    reviewStatus: baseFlags.length > 0 ? "needs_review" : "clean",
    answerSignature: answerSignature(input.answers),
    durationMs: input.durationMs,
    completionStep: input.completionStep,
    updatedAt: nowIso(),
    submittedAt: nowIso(),
  };

  await upsertRecord(record);

  if (input.email) {
    await saveEmail({
      responseId: record.responseId,
      email: input.email,
      createdAt: nowIso(),
      locale: record.locale,
      questionnaireVersion: SURVEY_VERSION,
      emailMarketingAccepted: input.consent.emailMarketingAccepted,
    });
  }

  return record;
}

export async function flagSurveySession(input: {
  responseId: string;
  reviewStatus: ReviewStatus;
  note?: string;
}) {
  const existing = await getRecord(input.responseId);
  if (!existing) throw new Error("Survey session not found.");

  existing.reviewStatus = input.reviewStatus;
  if (input.note) existing.reviewNotes = [...existing.reviewNotes, input.note];
  existing.updatedAt = nowIso();

  await upsertRecord(existing);
  return existing;
}

export async function listSurveyRecords(filters?: {
  status?: string;
  reviewStatus?: string;
  version?: string;
  campaign?: string;
}) {
  return getStorageMode() === "supabase" ? supabaseListRecords(filters) : localListRecords().then((records) => {
    return records.filter((record) => {
      if (filters?.status && record.status !== filters.status) return false;
      if (filters?.reviewStatus && record.reviewStatus !== filters.reviewStatus) return false;
      if (filters?.version && record.questionnaireVersion !== filters.version) return false;
      if (filters?.campaign && record.source.utms.campaign !== filters.campaign) return false;
      return true;
    });
  });
}

export async function getSurveySummary() {
  const records = await listAllRecords();
  const started = records.filter(
    (record) => record.status === "started" || record.status === "abandoned" || record.status === "completed",
  ).length;
  const completed = records.filter((record) => record.status === "completed").length;
  const abandoned = records.filter((record) => record.status === "abandoned").length;
  const needsReview = records.filter((record) => record.reviewStatus === "needs_review").length;
  const byVersion = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.questionnaireVersion] = (acc[record.questionnaireVersion] ?? 0) + 1;
    return acc;
  }, {});
  const byCampaign = records.reduce<Record<string, number>>((acc, record) => {
    const campaign = record.source.utms.campaign || "(sin campaña)";
    acc[campaign] = (acc[campaign] ?? 0) + 1;
    return acc;
  }, {});

  return {
    started,
    completed,
    abandoned,
    needsReview,
    completionRate: started > 0 ? Number(((completed / started) * 100).toFixed(1)) : 0,
    byVersion,
    byCampaign,
    storageDriver: getStorageMode(),
    records,
  };
}

export function getSurveyStorageConfig() {
  return {
    storageDriver: getStorageMode(),
    localRoot: LOCAL_ROOT,
    hasSupabaseConfig: Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY),
    responsesTable: RESPONSES_TABLE,
    emailsTable: EMAILS_TABLE,
  };
}
