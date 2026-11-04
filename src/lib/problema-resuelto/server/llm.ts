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
  temperature?: number;
}

export type LlmResult = { ok: true; text: string; stopReason: string | null } | { ok: false; code: string };

export interface LlmClient {
  model: string;
  complete(request: LlmRequest): Promise<LlmResult>;
}

const ENDPOINT = "https://api.anthropic.com/v1/messages";
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
            max_tokens: request.maxTokens,
            temperature: request.temperature ?? 0.3,
            system: request.system,
            messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: AbortSignal.timeout(request.timeoutMs),
        });
        if (!response.ok) return { ok: false, code: `llm_http_${response.status}` };
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
