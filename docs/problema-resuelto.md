# Programa «Problema Resuelto»

Captación por un caso pequeño gratis. Una persona que trabaja en una empresa
cuenta un problema en `/es/problema-resuelto/`, un agente de triaje le hace unas
preguntas, deja sus datos y el caso llega a Luiz con una ficha sugerida. Hasta
10 casos al mes; la decisión la toma siempre una persona.

ES-only, indexable. Keyword primaria «proyecto de ia gratis»
(`src/data/keywords-primarias.ts`).

## 1. Piezas

| Pieza | Archivo |
| --- | --- |
| Configuración pública (nombre, rutas, cupo, bases, versiones de consentimiento) | `src/data/problema-resuelto.ts` |
| Landing | `src/pages/es/problema-resuelto/index.astro` |
| Estilos (prefijo `pr-`) | `src/styles/editorial-problema-resuelto.css` |
| Island del cuadro, chat y formularios | `src/islands/ProblemIntake.tsx` |
| Turno del agente | `POST /api/problema-resuelto/chat` → `src/pages/api/problema-resuelto/chat.ts` |
| Envío del caso | `POST /api/problema-resuelto/submit` → `src/pages/api/problema-resuelto/submit.ts` |
| Casos de uso (sin red, inyectables) | `src/lib/problema-resuelto/server/service.ts` |
| Prompts y `PROMPT_VERSION` | `src/lib/problema-resuelto/server/prompts.ts` |
| Firma de la conversación (HMAC) | `src/lib/problema-resuelto/server/transcript.ts` |
| Cliente de Anthropic (REST, sin SDK) | `src/lib/problema-resuelto/server/llm.ts` |
| Lectura robusta de la salida del modelo | `src/lib/problema-resuelto/parse.ts` |
| Limpieza de texto y ocultación de datos personales | `src/lib/problema-resuelto/text.ts` |
| Validación | `src/lib/problema-resuelto/validation.ts` |
| Supabase | `src/lib/problema-resuelto/server/store.ts` + `supabase/migrations/20261104120000_create_problema_resuelto.sql` |
| Email interno | `src/lib/problema-resuelto/server/email.ts` |
| Analítica (lista blanca) | `src/lib/problema-resuelto/analytics.ts` |
| og:image | `src/pages/og/es/problema-resuelto.png.ts` |

## 2. Flujo

1. La persona escribe el problema en el cuadro. El navegador llama a `/chat`
   con `{ message, transcript: [], state: null }`.
2. El servidor valida, comprueba rate limit (30 turnos por IP cada 10 min) y
   tope diario global (`PROBLEMA_DAILY_TURN_LIMIT`, 400 por defecto), oculta
   emails, teléfonos y otros números de 9+ dígitos, DNI/NIE e IBAN, y llama al
   modelo con `triageSystemPrompt(turno)`.
3. Devuelve la respuesta, la transcripción canónica (ya enmascarada) y un
   `state` = `<emitido>.<hmac>` que la firma. El turno siguiente solo se acepta
   si la firma coincide y tiene menos de 6 horas. Así nadie puede inventarse
   respuestas del agente ni inyectar instrucciones haciéndolas pasar por suyas.
4. Máximo 6 mensajes de la persona. El modelo marca `ready` cuando tiene lo
   necesario; en el sexto turno el servidor lo fuerza.
5. Con `ready`, la island muestra el formulario de contacto. El envío a
   `/submit` lleva la transcripción y el `state`; el servidor vuelve a verificar
   la firma, aplica rate limit (5 por IP cada 10 min, 3 por email al día),
   inserta de forma idempotente por `submission_id`, genera la ficha con
   `FICHA_SYSTEM_PROMPT` y manda el email interno.

**Nada se guarda durante la conversación.** Solo el contador del rate limit.
La conversación entra en la BD cuando la persona envía sus datos y acepta.

### Respaldo al formulario

La island pasa a un formulario con las mismas preguntas cuando `/chat`
responde `mode: "form"`: falta `ANTHROPIC_API_KEY` o la configuración, la BD
no responde (sin BD no hay límite de coste), el modelo falla o devuelve algo
ilegible, o se alcanza el tope diario. Lo que la persona ya escribió se copia
al primer campo. El caso se guarda igual, con `mode = 'form'` y la ficha
generada si el modelo está disponible en ese momento.

## 3. Variables de entorno

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `PROBLEMA_HMAC_SECRET` | Sí (≥ 32 caracteres) | Firma de la conversación y claves del rate limit. `openssl rand -hex 32` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Sí | Ya existen |
| `ANTHROPIC_API_KEY` | Para el agente | Sin ella, la página funciona solo con el formulario |
| `PROBLEMA_LLM_MODEL` | No | Por defecto `claude-haiku-5-5` |
| `PROBLEMA_DAILY_TURN_LIMIT` | No | Turnos del agente al día en total. Por defecto 400 |
| `PROBLEMA_ALLOWED_ORIGINS` | No | Orígenes extra separados por comas (previews) |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | No | Ya existen. Sin Resend el caso se guarda igual |

Ninguna lleva `PUBLIC_`. `npm run problema-resuelto:check-bundle` comprueba
tras el build que no llegan al navegador.

**Coste del modelo.** Cada turno manda la conversación entera; una
conversación completa son como mucho 6 llamadas de triaje + 1 de ficha. El tope
diario limita el gasto total aunque alguien abuse. Conviene poner además un
límite de gasto mensual en la consola de Anthropic.

**Duración de las funciones.** Los timeouts internos son 20 s (turno) y 25 s
(ficha). Si en la Vercel aparece `FUNCTION_INVOCATION_TIMEOUT`, subir
`maxDuration` en el adaptador.

## 4. Aplicar la migración

No se aplica desde código. Supabase Dashboard → SQL Editor → pegar
`supabase/migrations/20261104120000_create_problema_resuelto.sql` → Run. Es
idempotente. Después:

```sql
select relname, relrowsecurity from pg_class where relname like 'problema_resuelto_%' and relkind = 'r';
select public.problema_resuelto_rate_limit_hit(repeat('a', 64), 1, 60);
delete from public.problema_resuelto_rate_limits where bucket_key = repeat('a', 64);
```

Poda opcional: `select public.problema_resuelto_rate_limits_prune();`

## 5. Operación

- **Revisar casos.** Tabla `problema_resuelto_casos`, columna `status`:
  `nuevo → en_revision → aceptado | reducido | rechazado → en_construccion →
  entregado → convertido`. Anotar en `decision_notes` y fijar `responded_at`
  al contestar. El plazo público es de 3 días laborables.
- **La ficha es una sugerencia.** `ficha.encaje_sugerido` y `complejidad` las
  pone el modelo. No se toma ninguna decisión automática (lo dice también la
  política de privacidad).
- **Casos sin ficha** (`ficha_status = 'failed'` o `'skipped'`): leer
  `transcript` o `answers`.
- **Embudo.** GA4: `problem_start`, `triage_complete`, `problem_fallback`,
  `problem_submit`, `generate_lead` (lead_source `Problema_Resuelto`),
  `video_play`, `video_complete`. BD: `status`.
- **Cupo.** El código no corta en 10: el tope lo aplica Luiz al aceptar. Si
  se llena el mes, responder ofreciendo el mes siguiente.

## 6. Cambios

- Texto del agente o de la ficha → subir `PROMPT_VERSION`.
- Texto del consentimiento o finalidad → nueva `PROBLEMA_CONSENT.version` y
  añadirla a `ACCEPTED_PROBLEMA_CONSENT_VERSIONS`.
- Bases → nueva `PROBLEMA_BASES_VERSION` y añadirla a
  `ACCEPTED_PROBLEMA_BASES_VERSIONS`. Los casos ya aceptados siguen con las suyas.
- Vídeo → subir el MP4 y el póster a `public/video/` y rellenar `VIDEO.src`
  en la landing. Con `src: null` el hero se muestra sin vídeo.
- Cambiar de proveedor de modelo → nuevo adaptador con la interfaz `LlmClient`
  y actualizar el proveedor en `src/data/privacidad.ts` y el texto legal de la island.

## 7. Tests

```bash
npm run problema-resuelto:test         # sin red: texto, PII, firma, parser, flujos con dobles
npm run problema-resuelto:test-sql     # migración contra PGlite
npm run build && npm run problema-resuelto:check-bundle
```

## 8. Pendiente / no verificado

- `temperature` no se envía: `claude-haiku-5-5` lo rechaza con 400
  («deprecated for this model», comprobado el 04/nov/2026 en producción). Los
  errores de la API se registran clasificados (`llm_http_400_param_<x>`,
  `_no_credit`, `_model`…) sin el texto del proveedor.
- La política de privacidad declara a Anthropic como encargado con ubicación
  en Estados Unidos. Confirmar en la consola de Anthropic la entidad con la que
  se contrata y que el DPA aplica a la cuenta.
- Sin Turnstile en v1: protegen el rate limit por IP, el tope diario y la
  firma. Añadirlo si aparece abuso.
- Sin email de confirmación a la persona: la confirmación es la propia página.
