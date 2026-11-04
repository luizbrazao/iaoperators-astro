// Cliente mínimo de la API de mensajes de Anthropic (REST, sin SDK).
//
// El resto del código depende solo de la interfaz LlmClient: los tests usan un
// doble en memoria y cambiar de proveedor es escribir otro adaptador. Nunca
// lanza: devuelve un código estable, sin el mensaje del proveedor (que podría
// citar la entrada).

import type { ChatMessage } from "../types";
import type { LlmConfig } from "./env";

export interface LlmRequest {
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
  timeoutMs: number;
}

export type LlmResult = { ok: true; text: string; stopReason: string | null } | { ok: false; code: string };

export interface LlmClient {
  model: string;
  complete(request: LlmRequest): Promise<LlmResult>;
}

const ENDPOINT = "https://api.anthropic.com/v1/messages";

/**
 * Código estable a partir de un error de la API. El mensaje del proveedor no
 * se propaga (podría citar la entrada): solo se clasifica por palabras clave
 * conocidas. Ej.: llm_http_400_param_temperature, llm_http_400_no_credit.
 */
export function classifyApiError(status: number, body: unknown): string {
  const error = body && typeof body === "object" ? (body as { error?: { type?: unknown; message?: unknown } }).error : undefined;
  const message = typeof error?.message === "string" ? error.message.toLowerCase() : "";
  const base = `llm_http_${status}`;
  if (/credit balance/.test(message)) return `${base}_no_credit`;
  const param = /`([a-z_]{2,30})`/.exec(message)?.[1];
  if (param && /(deprecated|not supported|unsupported|unexpected|extra inputs)/.test(message)) return `${base}_param_${param}`;
  if (/model/.test(message)) return `${base}_model`;
  if (/(too long|context|max_tokens)/.test(message)) return `${base}_length`;
  const type = typeof error?.type === "string" && /^[a-z_]{2,40}$/.test(error.type) ? error.type : "";
  return type ? `${base}_${type}` : base;
}

const API_VERSION = "2023-06-01";

export function createAnthropicClient(config: LlmConfig, fetchImpl: typeof fetch = fetch): LlmClient {
  return {
    model: config.model,
    async complete(request) {
      try {
        const response = await fetchImpl(ENDPOINT, {
          method: "POST",
          headers: {
            "x-api-key": config.apiKey,
            "anthropic-version": API_VERSION,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: config.model,
            // Sin `temperature`: los modelos actuales lo rechazan con 400
            // ("`temperature` is deprecated for this model", 04/nov/2026).
            max_tokens: request.maxTokens,
            system: request.system,
            messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: AbortSignal.timeout(request.timeoutMs),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          return { ok: false, code: classifyApiError(response.status, body) };
        }
        const data = (await response.json().catch(() => null)) as {
          content?: { type?: string; text?: string }[];
          stop_reason?: string | null;
        } | null;
        const text = (data?.content ?? [])
          .filter((block) => block?.type === "text" && typeof block.text === "string")
          .map((block) => block.text)
          .join("")
          .trim();
        if (!text) return { ok: false, code: "llm_empty" };
        return { ok: true, text, stopReason: data?.stop_reason ?? null };
      } catch (error) {
        const name = error && typeof error === "object" && "name" in error ? String((error as { name: unknown }).name) : "";
        return { ok: false, code: name === "TimeoutError" || name === "AbortError" ? "llm_timeout" : "llm_network_error" };
      }
    },
  };
}
