import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type {
  ReviewStatus,
  SurveyEmailRecord,
  SurveyRecord,
  SurveySessionCreateInput,
  SurveySessionPatchInput,
  SurveySubmissionInput,
} from "./types";
import { SURVEY_SLUG, SURVEY_TITLE, SURVEY_VERSION } from "./types";
import { answerSignature, safeJsonParse, sha256 } from "./utils";
import { deriveQualityFlags } from "./validation";

const LOCAL_ROOT =
  import.meta.env.SURVEY_LOCAL_STORAGE_DIR || join(process.cwd(), "work", "survey-data", SURVEY_SLUG);

const AIRTABLE_API_KEY = import.meta.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.AIRTABLE_BASE_ID;
const AIRTABLE_RESPONSES_TABLE = import.meta.env.SURVEY_AIRTABLE_RESPONSES_TABLE;
const AIRTABLE_EMAILS_TABLE = import.meta.env.SURVEY_AIRTABLE_EMAILS_TABLE;
const STORAGE_DRIVER =
  import.meta.env.SURVEY_STORAGE_DRIVER ||
  (AIRTABLE_API_KEY && AIRTABLE_BASE_ID && AIRTABLE_RESPONSES_TABLE && AIRTABLE_EMAILS_TABLE
    ? "airtable"
    : "local");

const RESPONSES_DIR = join(LOCAL_ROOT, "responses");
const EMAILS_DIR = join(LOCAL_ROOT, "emails");

function nowIso() {
  return new Date().toISOString();
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

function getAirtableHeaders() {
  return {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function airtableRequest(path: string, init?: RequestInit) {
  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...getAirtableHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Airtable request failed (${response.status}): ${text}`);
  }

  return response;
}

function serializeFlags(record: SurveyRecord) {
  return JSON.stringify(record.qualityFlags);
}

function serializeNotes(notes: string[]) {
  return JSON.stringify(notes);
}

function responseToAirtableFields(record: SurveyRecord) {
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
    submitted_at: record.submittedAt ?? "",
    abandoned_at: record.abandonedAt ?? "",
    completion_step: record.completionStep,
    total_steps: record.totalSteps,
    duration_ms: record.durationMs,
    optional_email_provided: record.optionalEmailProvided ? "yes" : "no",
    review_status: record.reviewStatus,
    review_notes_json: serializeNotes(record.reviewNotes),
    quality_flags_json: serializeFlags(record),
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
    professional_role: Array.isArray(record.answers.professional_role)
      ? record.answers.professional_role.join(", ")
      : record.answers.professional_role ?? "",
    company_size: Array.isArray(record.answers.company_size)
      ? record.answers.company_size.join(", ")
      : record.answers.company_size ?? "",
    sector: Array.isArray(record.answers.sector) ? record.answers.sector.join(", ") : record.answers.sector ?? "",
    country_region: Array.isArray(record.answers.country_region)
      ? record.answers.country_region.join(", ")
      : record.answers.country_region ?? "",
    ai_usage_frequency: Array.isArray(record.answers.ai_usage_frequency)
      ? record.answers.ai_usage_frequency.join(", ")
      : record.answers.ai_usage_frequency ?? "",
    work_account_usage: Array.isArray(record.answers.work_account_usage)
      ? record.answers.work_account_usage.join(", ")
      : record.answers.work_account_usage ?? "",
    supplier_dependency_resilience: Array.isArray(record.answers.supplier_dependency_resilience)
      ? record.answers.supplier_dependency_resilience.join(", ")
      : record.answers.supplier_dependency_resilience ?? "",
    risk_perception: Array.isArray(record.answers.risk_perception)
      ? record.answers.risk_perception.join(", ")
      : record.answers.risk_perception ?? "",
    responses_json: JSON.stringify(record.answers),
    consent_json: JSON.stringify(record.consent),
  };
}

function emailToAirtableFields(record: SurveyEmailRecord) {
  return {
    response_id: record.responseId,
    email: record.email,
    created_at: record.createdAt,
    locale: record.locale,
    questionnaire_version: record.questionnaireVersion,
    email_marketing_accepted: record.emailMarketingAccepted ? "yes" : "no",
  };
}

function airtableFieldsToRecord(fields: Record<string, unknown>): SurveyRecord {
  return {
    responseId: String(fields.response_id ?? ""),
    slug: SURVEY_SLUG,
    title: SURVEY_TITLE,
    questionnaireVersion: SURVEY_VERSION,
    status: String(fields.status ?? "started") as SurveyRecord["status"],
    locale: String(fields.locale ?? "es"),
    questionnaireLanguage: String(fields.questionnaire_language ?? "es-ES"),
    createdAt: String(fields.created_at ?? nowIso()),
    updatedAt: String(fields.updated_at ?? nowIso()),
    startedAt: String(fields.started_at ?? nowIso()),
    submittedAt: String(fields.submitted_at ?? "") || undefined,
    abandonedAt: String(fields.abandoned_at ?? "") || undefined,
    completionStep: Number(fields.completion_step ?? 0),
    totalSteps: Number(fields.total_steps ?? 12),
    answers: safeJsonParse(String(fields.responses_json ?? "{}"), {}),
    consent: safeJsonParse(String(fields.consent_json ?? "{}"), {
      accepted: false,
      confidentialityNoticeAccepted: false,
      aggregateUseAccepted: false,
      deletionRightsRead: false,
      emailMarketingAccepted: false,
    }),
    optionalEmailProvided: String(fields.optional_email_provided ?? "no") === "yes",
    qualityFlags: safeJsonParse(String(fields.quality_flags_json ?? "[]"), []),
    reviewStatus: String(fields.review_status ?? "clean") as ReviewStatus,
    reviewNotes: safeJsonParse(String(fields.review_notes_json ?? "[]"), []),
    fingerprintHash: String(fields.fingerprint_hash ?? ""),
    answerSignature: String(fields.answer_signature ?? ""),
    source: {
      landingPath: String(fields.landing_path ?? ""),
      referrer: String(fields.referrer ?? ""),
      originLabel: String(fields.origin_label ?? "direct"),
      utms: {
        source: String(fields.utm_source ?? ""),
        medium: String(fields.utm_medium ?? ""),
        campaign: String(fields.utm_campaign ?? ""),
        term: String(fields.utm_term ?? ""),
        content: String(fields.utm_content ?? ""),
      },
      userAgentHash: String(fields.user_agent_hash ?? ""),
      deviceCategory: String(fields.device_category ?? "unknown") as SurveyRecord["source"]["deviceCategory"],
      locale: String(fields.locale ?? "es"),
    },
    durationMs: Number(fields.duration_ms ?? 0),
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

async function airtableListRecords() {
  const records: SurveyRecord[] = [];
  let offset = "";

  do {
    const query = new URLSearchParams({ pageSize: "100" });
    if (offset) query.set("offset", offset);
    const response = await airtableRequest(`/${encodeURIComponent(AIRTABLE_RESPONSES_TABLE)}?${query.toString()}`);
    const payload = (await response.json()) as {
      records: Array<{ fields: Record<string, unknown> }>;
      offset?: string;
    };
    records.push(...payload.records.map((record) => airtableFieldsToRecord(record.fields)));
    offset = payload.offset ?? "";
  } while (offset);

  return records.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

async function localGetRecord(responseId: string) {
  return readJson<SurveyRecord | null>(getResponsePath(responseId), null);
}

async function airtableGetRecord(responseId: string) {
  const formula = encodeURIComponent(`{response_id}="${responseId}"`);
  const response = await airtableRequest(`/${encodeURIComponent(AIRTABLE_RESPONSES_TABLE)}?filterByFormula=${formula}`);
  const payload = (await response.json()) as { records: Array<{ fields: Record<string, unknown> }> };
  if (!payload.records[0]) return null;
  return airtableFieldsToRecord(payload.records[0].fields);
}

async function localUpsertRecord(record: SurveyRecord) {
  await writeJson(getResponsePath(record.responseId), record);
  return record;
}

async function airtableUpsertRecord(record: SurveyRecord) {
  const existing = await airtableGetRecord(record.responseId);
  const fields = responseToAirtableFields(record);
  if (existing) {
    const formula = encodeURIComponent(`{response_id}="${record.responseId}"`);
    const lookup = await airtableRequest(`/${encodeURIComponent(AIRTABLE_RESPONSES_TABLE)}?filterByFormula=${formula}`);
    const payload = (await lookup.json()) as { records: Array<{ id: string }> };
    const recordId = payload.records[0]?.id;
    if (!recordId) throw new Error(`Unable to update Airtable record ${record.responseId}`);
    await airtableRequest(`/${encodeURIComponent(AIRTABLE_RESPONSES_TABLE)}/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify({ fields }),
    });
    return record;
  }

  await airtableRequest(`/${encodeURIComponent(AIRTABLE_RESPONSES_TABLE)}`, {
    method: "POST",
    body: JSON.stringify({ fields }),
  });

  return record;
}

async function localSaveEmail(record: SurveyEmailRecord) {
  await writeJson(getEmailPath(record.responseId), record);
}

async function airtableSaveEmail(record: SurveyEmailRecord) {
  const formula = encodeURIComponent(`{response_id}="${record.responseId}"`);
  const lookup = await airtableRequest(`/${encodeURIComponent(AIRTABLE_EMAILS_TABLE)}?filterByFormula=${formula}`);
  const payload = (await lookup.json()) as { records: Array<{ id: string }> };
  const existingId = payload.records[0]?.id;
  const fields = emailToAirtableFields(record);

  if (existingId) {
    await airtableRequest(`/${encodeURIComponent(AIRTABLE_EMAILS_TABLE)}/${existingId}`, {
      method: "PATCH",
      body: JSON.stringify({ fields }),
    });
    return;
  }

  await airtableRequest(`/${encodeURIComponent(AIRTABLE_EMAILS_TABLE)}`, {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
}

function getStorageMode() {
  return STORAGE_DRIVER === "airtable" ? "airtable" : "local";
}

async function listAllRecords() {
  return getStorageMode() === "airtable" ? airtableListRecords() : localListRecords();
}

async function getRecord(responseId: string) {
  return getStorageMode() === "airtable" ? airtableGetRecord(responseId) : localGetRecord(responseId);
}

async function upsertRecord(record: SurveyRecord) {
  return getStorageMode() === "airtable" ? airtableUpsertRecord(record) : localUpsertRecord(record);
}

async function saveEmail(record: SurveyEmailRecord) {
  return getStorageMode() === "airtable" ? airtableSaveEmail(record) : localSaveEmail(record);
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

  const allRecords = await listAllRecords();
  const possibleDuplicate = allRecords.some(
    (record) =>
      record.responseId !== input.responseId &&
      record.fingerprintHash &&
      record.fingerprintHash === input.fingerprintHash &&
      Math.abs(Date.parse(record.startedAt) - Date.parse(existing.startedAt)) < 1000 * 60 * 60 * 24,
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
  const records = await listAllRecords();
  return records.filter((record) => {
    if (filters?.status && record.status !== filters.status) return false;
    if (filters?.reviewStatus && record.reviewStatus !== filters.reviewStatus) return false;
    if (filters?.version && record.questionnaireVersion !== filters.version) return false;
    if (filters?.campaign && record.source.utms.campaign !== filters.campaign) return false;
    return true;
  });
}

export async function getSurveySummary() {
  const records = await listAllRecords();
  const started = records.filter((record) => record.status === "started" || record.status === "abandoned" || record.status === "completed").length;
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
    hasAirtableConfig: Boolean(AIRTABLE_API_KEY && AIRTABLE_BASE_ID && AIRTABLE_RESPONSES_TABLE && AIRTABLE_EMAILS_TABLE),
  };
}
