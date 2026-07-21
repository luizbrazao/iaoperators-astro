export const SURVEY_SLUG = "segunda-factura-ia-2026";
export const SURVEY_VERSION = "2026-07-v1";
export const SURVEY_TITLE = "La Segunda Factura de la IA 2026";
export const SURVEY_PUBLIC_PATH = "/es/estudio/segunda-factura-ia/encuesta/";

export type SurveyStatus = "started" | "abandoned" | "completed" | "flagged";
export type ReviewStatus = "clean" | "needs_review" | "reviewed";

export type QuestionType = "single" | "multi" | "scale";

export interface SurveyQuestionOption {
  value: string;
  label: string;
  exclusive?: boolean;
}

export interface SurveyQuestionDefinition {
  id: SurveyQuestionId;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options: SurveyQuestionOption[];
  rationale: string;
  crossTabs: string[];
}

export type SurveyQuestionId =
  | "professional_role"
  | "company_size"
  | "sector"
  | "country_region"
  | "ai_usage_frequency"
  | "work_account_usage"
  | "shared_information_types"
  | "governance_maturity"
  | "vendor_and_safeguard_practices"
  | "monitoring_and_shadow_ai"
  | "supplier_dependency_resilience"
  | "risk_perception";

export type SurveyAnswerValue = string | string[];

export type SurveyAnswers = Partial<Record<SurveyQuestionId, SurveyAnswerValue>>;

export interface SurveyConsentPayload {
  accepted: boolean;
  confidentialityNoticeAccepted: boolean;
  aggregateUseAccepted: boolean;
  deletionRightsRead: boolean;
  emailMarketingAccepted: boolean;
}

export interface SurveyUtms {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

export interface SurveySourceContext {
  landingPath: string;
  referrer: string;
  utms: SurveyUtms;
  locale: string;
  originLabel: string;
  userAgentHash: string;
  deviceCategory: "mobile" | "tablet" | "desktop" | "unknown";
}

export interface SurveyQualityFlag {
  code:
    | "too_fast"
    | "possible_duplicate"
    | "incomplete"
    | "logic_inconsistency"
    | "bot_like"
    | "honeypot_triggered";
  severity: "low" | "medium" | "high";
  message: string;
}

export interface SurveyRecord {
  responseId: string;
  slug: typeof SURVEY_SLUG;
  questionnaireVersion: typeof SURVEY_VERSION;
  title: typeof SURVEY_TITLE;
  status: SurveyStatus;
  locale: string;
  createdAt: string;
  updatedAt: string;
  startedAt: string;
  submittedAt?: string;
  abandonedAt?: string;
  completionStep: number;
  totalSteps: number;
  answers: SurveyAnswers;
  consent: SurveyConsentPayload;
  optionalEmailProvided: boolean;
  qualityFlags: SurveyQualityFlag[];
  reviewStatus: ReviewStatus;
  reviewNotes: string[];
  fingerprintHash: string;
  answerSignature: string;
  source: SurveySourceContext;
  durationMs: number;
  questionnaireLanguage: string;
}

export interface SurveyEmailRecord {
  responseId: string;
  email: string;
  createdAt: string;
  locale: string;
  questionnaireVersion: typeof SURVEY_VERSION;
  emailMarketingAccepted: boolean;
}

export interface SurveySessionCreateInput {
  locale: string;
  landingPath: string;
  referrer: string;
  utms: SurveyUtms;
  userAgentHash: string;
  deviceCategory: SurveySourceContext["deviceCategory"];
  fingerprintHash: string;
  questionnaireLanguage: string;
}

export interface SurveySessionPatchInput {
  responseId: string;
  status?: SurveyStatus;
  completionStep?: number;
  durationMs?: number;
  answers?: SurveyAnswers;
  qualityFlags?: SurveyQualityFlag[];
  reviewStatus?: ReviewStatus;
  reviewNote?: string;
}

export interface SurveySubmissionInput {
  responseId: string;
  answers: SurveyAnswers;
  email?: string;
  consent: SurveyConsentPayload;
  durationMs: number;
  completionStep: number;
  fingerprintHash: string;
}
