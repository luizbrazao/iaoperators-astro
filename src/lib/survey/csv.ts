import type { SurveyRecord } from "./types";
import { surveyQuestions } from "./questions";
import { escapeCsvCell } from "./utils";

export function recordsToCsv(records: SurveyRecord[], options?: { anonymized?: boolean }) {
  const baseHeaders = [
    "response_id",
    "status",
    "review_status",
    "started_at",
    "submitted_at",
    "duration_ms",
    "locale",
    "questionnaire_version",
    "landing_path",
    "referrer",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "device_category",
    "optional_email_provided",
    "quality_flags",
  ];

  const questionHeaders = surveyQuestions.map((question) => question.id);
  const extraHeaders = options?.anonymized ? [] : ["email_storage"];
  const headers = [...baseHeaders, ...questionHeaders, ...extraHeaders];

  const rows = records.map((record) => {
    const qualityFlags = record.qualityFlags.map((flag) => flag.code).join("|");
    const questionValues = surveyQuestions.map((question) => {
      const value = record.answers[question.id];
      return Array.isArray(value) ? value.join("|") : value ?? "";
    });

    const emailColumn = options?.anonymized ? [] : [record.optionalEmailProvided ? "stored-separately" : ""];

    const baseValues = [
      record.responseId,
      record.status,
      record.reviewStatus,
      record.startedAt,
      record.submittedAt ?? "",
      String(record.durationMs),
      record.locale,
      record.questionnaireVersion,
      record.source.landingPath,
      record.source.referrer,
      record.source.utms.source,
      record.source.utms.medium,
      record.source.utms.campaign,
      record.source.utms.term,
      record.source.utms.content,
      record.source.deviceCategory,
      record.optionalEmailProvided ? "yes" : "no",
      qualityFlags,
    ];

    return [...baseValues, ...questionValues, ...emailColumn].map(escapeCsvCell).join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
