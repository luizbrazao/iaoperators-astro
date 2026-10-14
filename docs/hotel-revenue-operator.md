# Hotel Revenue Operator — by IA Operators

Documento técnico del producto. Fase 1 implementada el 14/oct/2026; Fase 2
propuesta, **no implementada**.

> Fase 1 = validar adquisición y disposición a pagar antes de construir el SaaS
> operativo. No hay chatbot, ni login, ni integraciones, ni pagos.

---

## 1. Alcance de la Fase 1 (implementado)

| Pieza | Archivo |
|---|---|
| Landing indexable | `src/pages/es/hoteles/reservas-directas-ia/index.astro` |
| Calculadora en página propia (noindex, follow) | `src/pages/es/hoteles/calculadora-ingresos/index.astro` |
| Confirmación (noindex) | `src/pages/es/hoteles/reservas-directas-ia/gracias/index.astro` |
| Island calculadora + formulario | `src/islands/HotelRevenueCalculator.tsx` |
| Motor de cálculo (funciones puras) | `src/lib/hotel-revenue/calculator.ts` |
| Tipos | `src/lib/hotel-revenue/types.ts` |
| Validación del payload | `src/lib/hotel-revenue/validation.ts` |
| Analítica (dataLayer, sin PII) | `src/lib/hotel-revenue/analytics.ts` |
| Endpoint | `src/pages/api/hotel-revenue/lead.ts` |
| Caso de uso con dependencias inyectadas | `src/lib/hotel-revenue/server/service.ts` |
| Supabase (service role) | `src/lib/hotel-revenue/server/store.ts` |
| Email interno (Resend) | `src/lib/hotel-revenue/server/email.ts` |
| Configuración y Origin | `src/lib/hotel-revenue/server/env.ts` |
| Logs estructurados sin PII | `src/lib/hotel-revenue/server/log.ts` |
| Config pública (nombre, rutas, consentimiento, hipótesis comercial) | `src/data/hotel-revenue.ts` |
| Estilos (`hro-`, bajo `.editorial-shell`) | `src/styles/editorial-hotel-revenue.css` |
| OG image programática | `src/pages/og/es/hotel-revenue-operator.png.ts` |
| Migración | `supabase/migrations/20261014120000_create_hotel_revenue_leads.sql` |
| Tests | `scripts/test-hotel-revenue.ts`, `scripts/test-hotel-revenue-sql.mjs`, `scripts/check-hotel-revenue-bundle.mjs` |

Integración con la vertical: bloque de producto en `/es/hoteles/` (antes de
«Arquitectura»), que separa consultoría (Radiografía) de producto y enlaza a la
landing. La línea del bloque «No es este proyecto» que hablaba de «comprar un
chatbot» ahora redirige ese caso al producto. El resto de la página no cambia.

## 2. Hipótesis de producto

1. Un hotel independiente pierde reservas directas porque las dudas previas a la
   reserva no se resuelven a tiempo en su web.
2. Un asistente que responde y **lleva al motor de reservas** (sin confirmar
   precio ni disponibilidad) recupera una parte de esas reservas.
3. Ofrecer extras en el momento oportuno genera ingreso adicional por estancia.
4. El hotel paga por esto si puede ver la atribución (conversación → clic →
   reserva/extra).

Lo que la Fase 1 mide para validarlas: visitas por canal, inicio y finalización
de la calculadora, inicio de formulario, leads, y en las llamadas: si el hotel
acepta un piloto y qué precio considera razonable.

Hipótesis comercial: `PILOT_COMMERCIAL_HYPOTHESIS` en `src/data/hotel-revenue.ts`
con `display: false` e importes en `null`. **Pendiente de decidir** tras las
primeras llamadas. La web no publica precio.

## 3. ICP

Hoteles independientes, boutique, hostels, aparthoteles y pequeños grupos en
España, ~10–100 habitaciones por propiedad, con web y motor de reservas, que
reciben dudas repetitivas por web/email/WhatsApp y quieren más reserva directa e
ingreso por huésped.

## 4. Funnel de adquisición

```
Google Ads / Meta Ads / orgánico ("chatbot para hoteles") / /es/hoteles/
        │
        ▼
Landing ── hotel_revenue_cta_clicked
        │
        ▼
Calculadora (embebida o página propia)
  ├─ hotel_revenue_calculator_started   (primer cambio de un dato)
  └─ hotel_revenue_calculator_completed (resultado válido estable 1,2 s, una vez)
        │
        ▼
Formulario ── hotel_revenue_lead_started (primer foco)
        │ POST /api/hotel-revenue/lead (201/200)
        ▼
generate_lead (lead_source = Hotel_Revenue_Operator) → /gracias/
        │
        ▼
Email interno → llamada de diagnóstico → piloto (status en BD)
```

## 5. Modelo de la calculadora (versión `1.0.0`)

Mes de 30 días.

```
occupiedRoomNights     = rooms × 30 × ocupación
estimatedBookings      = occupiedRoomNights ÷ estancia media
estimatedOtaRevenue    = occupiedRoomNights × ADR × cuota OTA
estimatedOtaCommission = estimatedOtaRevenue × comisión OTA
ahorro (escenario)     = estimatedOtaCommission × % recuperado
extras (escenario)     = estimatedBookings × % adopción × ticket medio
mensual                = ahorro + extras      (céntimos enteros)
anual                  = mensual × 12
```

| Escenario | Reservas OTA → directa | Adopción de extras |
|---|---|---|
| Conservador | 3 % | 3 % |
| Realista | 7 % | 7 % |
| Potencial | 12 % | 12 % |

Límites: habitaciones 1–1.000 (entero) · ocupación 1–100 % · ADR 10–5.000 € ·
estancia 1–30 noches · OTA 0–100 % · comisión 0–40 % · extra 0–1.000 €.
Fuera de rango **se rechaza** (no se recorta). `clampInputs` es solo red de
seguridad para que `calculate()` nunca devuelva NaN/Infinity/negativos.

Limitaciones que la página declara: ahorro **bruto** (no descuenta el coste del
canal directo), sin estacionalidad, un extra por reserva (no por huésped), cuota
OTA aplicada a noches. Los porcentajes de escenario son hipótesis de trabajo, no
medias del sector.

Texto obligatorio, mostrado siempre: «Estimación orientativa basada en los datos
introducidos. No constituye una previsión ni una garantía de resultados.»

**Versionado:** cualquier cambio de fórmula, límite o escenario → subir
`CALCULATOR_VERSION`. Cada lead guarda la versión y los resultados con los que
se calculó.

## 6. Rutas

| Ruta | Indexación | Notas |
|---|---|---|
| `/es/hoteles/reservas-directas-ia/` | index | Primaria «chatbot para hoteles» |
| `/es/hoteles/calculadora-ingresos/` | noindex, follow | En `NOINDEX_PATHS`; canonical propio |
| `/es/hoteles/reservas-directas-ia/gracias/` | noindex, nofollow | En `NOINDEX_PATHS` |
| `POST /api/hotel-revenue/lead` | — | `prerender = false`; otros métodos → 405 |
| `/og/es/hotel-revenue-operator.png` | — | Generada en el build |

### Decisión sobre la calculadora: noindex, follow

- La misma island está en la landing; dos URLs indexables con la misma
  herramienta serían contenido funcional duplicado y podrían repartir la query.
- No hay demanda medida de «calculadora …» para hoteles (Ahrefs sin plan de
  Keywords Explorer, Semrush sin unidades) y la página no tiene contenido propio
  suficiente para rankear sola.
- Su papel es de destino de anuncios y enlaces directos.
- Canonical propio y no hacia la landing: noindex + canonical a otra URL son
  señales contradictorias.

Revisar si dentro de 60–90 días el GSC muestra impresiones de queries tipo
«calculadora comisión booking hotel»: entonces valdría una página indexable con
contenido propio (y una keyword distinta).

### Keyword

Registro en `src/data/keywords-primarias.ts`: `hoteles/reservas-directas-ia/` →
primaria «chatbot para hoteles», secundarias «asistente de reservas para
hoteles», «chatbot hotel whatsapp», «reservas directas hotel», «upselling hotel»,
«inteligencia artificial para reservas hoteleras». Sin conflicto con `hoteles/`
(«consultoría tecnológica para hoteles») ni con `servicios/chatbots/` («chatbot
para empresas», Jaccard 0,33). `faixa: "b"`, `estimada: true` (volumen sin
medir).

Tensión aceptada: la keyword dice «chatbot» y el posicionamiento dice que no es
un chatbot genérico. La keyword va en `<title>` y en `serviceType`; el H1 y el
copy explican que es una capa de conversación, captación e ingresos.

## 7. Datos recogidos

Tabla `public.hotel_revenue_leads`: `name`, `email` (minúsculas), `hotel_name`,
`website`, `phone`, `property_count`, `room_count`, `calculator_version`,
`calculator_inputs`, `calculator_results` (recalculados en servidor),
`utm_source|medium|campaign|content|term`, `landing_path` (solo ruta, dentro de
`/es/hoteles/`), `referrer_host` (solo host), `cta_origin`, `consent_version`,
`consent_at` (hora del servidor), `status`
(`new|qualified|contacted|pilot|won|lost`), `submission_id` (idempotencia) y el
estado de la notificación.

No se guardan: IP (el rate limit usa HMAC), datos de huéspedes, user agent,
referrer completo, query strings.

## 8. Consentimiento y privacidad

- Casilla obligatoria, no premarcada, con enlace a la política. Versión del
  texto: `HOTEL_REVENUE_CONSENT.version` (`hro-lead-2026-10-14`). El servidor
  solo acepta versiones de `ACCEPTED_CONSENT_VERSIONS`.
- La calculadora no envía ni guarda nada antes del envío (sin localStorage ni
  sessionStorage). El origen del CTA pulsado se pasa por
  `document.documentElement.dataset.hroCta`, sin almacenamiento.
- Política de privacidad (`src/data/privacidad.ts`, ES/EN/PT): nuevo tratamiento
  «Calculadora y solicitud del piloto Hotel Revenue Operator» y fecha al
  14/oct/2026. **Pendiente de validación jurídica**, igual que el resto.
- Base: medidas precontractuales (6.1.b) + interés legítimo para rate limit y
  medición agregada (6.1.f). Plazo: 12 meses desde el último contacto sin
  relación.
- Honeypot `hp_confirm` (no `website`: el autocompletado de Chrome y gestores de
  contraseñas lo rellena y descarta leads reales).

## 9. Eventos de analítica

Módulo `src/lib/hotel-revenue/analytics.ts`. Mismo patrón de consentimiento que
el resto del sitio: el evento se encola en `window.dataLayer`; GTM solo se carga
si la persona acepta cookies.

| Evento | Cuándo | Parámetros |
|---|---|---|
| `hotel_revenue_cta_clicked` | clic en `[data-hro-cta]` | `cta_origin` |
| `hotel_revenue_calculator_started` | primer cambio de un dato | `cta_origin` |
| `hotel_revenue_calculator_completed` | resultado válido estable, una vez | buckets + `scenario` + `cta_origin` |
| `hotel_revenue_lead_started` | primer foco en el formulario | buckets + `cta_origin` |
| `generate_lead` | 201/200 del endpoint, antes de ir a /gracias/ | buckets + `cta_origin` + `lead_source=Hotel_Revenue_Operator` |

Todos llevan `product_id=hotel-revenue-operator` y `calculator_version`.

Buckets: `rooms_bucket` (1-9, 10-29, 30-59, 60-100, 101-250, 251+),
`ota_share_bucket` (0-24, 25-49, 50-74, 75-100), `opportunity_bucket` sobre la
oportunidad mensual realista (0-499, 500-1999, 2000-4999, 5000-9999, 10000+),
`scenario` (siempre `realistic`).

Nunca: nombre, email, teléfono, hotel, web ni cifras exactas. Lista blanca de
claves y de valores (`cleanHotelRevenueParams`).

La navegación a /gracias/ espera a `eventCallback` de GTM con `eventTimeout`
1,2 s y un temporizador de respaldo (sin consentimiento GTM no existe y el
callback nunca llegaría).

## 10. Variables de entorno

| Variable | Obligatoria | Uso |
|---|---|---|
| `SUPABASE_URL` | sí (ya existe) | Proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | sí (ya existe) | Escritura server-side |
| `HOTEL_REVENUE_HMAC_SECRET` | **sí, nueva** | Claves HMAC del rate limit. ≥ 32 caracteres (`openssl rand -base64 48`) |
| `RESEND_API_KEY` | no (ya existe) | Sin ella el lead se guarda y la notificación queda `skipped` |
| `CONTACT_FROM_EMAIL` | no (ya existe) | Remitente |
| `CONTACT_TO_EMAIL` | no | Destinatario interno. Por defecto `info@iaoperators.com` |
| `HOTEL_REVENUE_ALLOWED_ORIGINS` | no | Orígenes extra separados por comas (p. ej. previews) |

Si falta alguna obligatoria el endpoint responde **503**
`lead_storage_not_configured` con un mensaje que dice que no se ha guardado nada
y da el email de contacto. Nunca devuelve éxito sin persistir.

## 11. Aplicar la migración

No se aplica desde código. Opciones:

1. Supabase Dashboard → SQL Editor → pegar
   `supabase/migrations/20261014120000_create_hotel_revenue_leads.sql` → Run.
2. CLI: `supabase db push` (si el proyecto está enlazado).

Es idempotente: se puede ejecutar dos veces. Después comprobar:

```sql
select relname, relrowsecurity from pg_class where relname like 'hotel_revenue_%' and relkind = 'r';
select public.hotel_revenue_rate_limit_hit(repeat('a', 64), 1, 60);
delete from public.hotel_revenue_rate_limits where bucket_key = repeat('a', 64);
```

Poda opcional (pg_cron o manual): `select public.hotel_revenue_rate_limits_prune();`

## 12. Tests

```bash
npm run hotel-revenue:test        # motor, validación, servicio, analítica, email, logs (sin red)
npm run hotel-revenue:test-sql    # migración contra PGlite (sin red)
npm run build
npm run hotel-revenue:check-bundle  # secretos, piezas de servidor, SEO, sitemap
```

Limitación conocida: en PGlite las llamadas «concurrentes» se serializan en una
única conexión. La atomicidad del claim y del rate limit la da el propio SQL
(un único `UPDATE … WHERE` / `INSERT … ON CONFLICT`), no el test.

## 13. Operación y troubleshooting

- **Localizar un lead:** el email interno incluye el `id` y la consulta SQL.
  `select * from public.hotel_revenue_leads order by created_at desc limit 20;`
- **Leads sin notificar:**
  `select id, notification_status, notification_error_code, notification_attempts from public.hotel_revenue_leads where notification_status <> 'sent';`
  Códigos: `resend_not_configured`, `resend_http_<status>`, `resend_timeout`,
  `resend_network_error`. Un reenvío del mismo formulario reintenta el email
  (máx. 5 intentos); si no, contactar al lead manualmente.
- **Pipeline:** cambiar `status` a mano (`qualified`, `contacted`, `pilot`,
  `won`, `lost`). `updated_at` se actualiza por trigger.
- **Logs Vercel:** líneas JSON con `"scope":"hotel-revenue"` y `request_id`.
  Sin PII. `status:"denied"` + `origin_not_allowed` = Origin fuera de la lista;
  `rate_limit` + `lead_ip|lead_email` = límite alcanzado (6/10 min por IP,
  5/24 h por email).
- **«El formulario dice OK pero no hay lead»:** primero el honeypot
  (`detail:"honeypot"`), luego `duplicate` (mismo `submission_id`).
- **503:** mirar `action:"config"` (variables que faltan, por nombre) o el
  `error_code` de Supabase (`lead_insert_failed:<código Postgres>`).

## 14. Backlog post-validación (Fase 1.x)

- Configurar en GTM: tag GA4 de `generate_lead` leyendo `lead_source` de una
  variable de dataLayer (hoy fijo `Formulario_Contato`); conversión de Google
  Ads para `lead_source = Hotel_Revenue_Operator`; audiencias por
  `hotel_revenue_calculator_completed`.
- Propagar las UTM de la landing a la página de la calculadora (hoy solo se leen
  de la URL actual; un enlace interno las pierde).
- Purga automática de leads sin relación a los 12 meses (plazo declarado).
- Enlaces contextuales desde los posts del blog hotelero (venta directa, hotel
  autónomo) a la landing.
- Medir la keyword y la faixa reales con el GSC a los 60 días.
- Decidir precio del piloto y, si se valida, checkout.

---

## Fase 2 — arquitectura propuesta (no implementada)

### Principios

- **LLM para interpretación, lenguaje y recomendación.**
- **Código determinista para disponibilidad, precio, cobro, consentimiento y
  confirmación.**
- **Estado persistido fuera del modelo** (Postgres); el modelo recibe contexto
  recortado y devuelve intenciones o llamadas a herramientas.
- **Toda acción financiera o de reserva exige fuente autoritativa** (motor, PMS,
  pasarela). Sin integración confirmada no se ejecuta ninguna reserva: se
  enlaza al motor.
- **Handoff humano con contexto** (resumen, datos de la conversación, acción
  sugerida).
- **Prompts versionados** y evaluados antes de publicarse.
- **Logs sin datos sensibles innecesarios.**
- **Adapters** para no acoplar el dominio a un PMS o motor concreto.

### Modelo de datos multi-tenant (Supabase/Postgres)

```
organizations (id, name, plan, created_at)
  └─ properties (id, organization_id, name, timezone, locales[], booking_url_template, status)
memberships (user_id → auth.users, organization_id, role: owner|manager|agent|viewer)

knowledge_sources (id, property_id, kind: faq|policy|url|document, version, status, checksum)
knowledge_chunks (id, source_id, property_id, content, embedding vector, locale, valid_from/valid_to)

conversations (id, property_id, channel: webchat|whatsapp|email, external_ref, guest_locale,
               status: open|handoff|closed, attribution_token, started_at, last_message_at)
messages (id, conversation_id, role: guest|assistant|human|system, body, tool_calls jsonb,
          prompt_version, model, tokens_in/out, latency_ms, created_at)

booking_leads (id, conversation_id, property_id, check_in, check_out, adults, children,
               status: intent|clicked|booked|lost, booking_engine_ref, value_cents, currency)
upsell_offers (id, property_id, code, title_i18n jsonb, price_cents, currency,
               rules jsonb, requires_integration bool, active)
upsell_purchases (id, offer_id, conversation_id, reservation_ref, status: offered|accepted|paid|cancelled,
                  amount_cents, source_of_truth: pms|payment|manual)
attribution_events (id, property_id, conversation_id, type: link_click|booking_confirmed|upsell_paid,
                    external_ref, value_cents, occurred_at, idempotency_key UNIQUE)
human_handoffs (id, conversation_id, reason, summary, assigned_to, status, sla_due_at, resolved_at)

integration_connections (id, property_id, provider, kind: pms|booking_engine|whatsapp|payments|crm,
                         credentials_ref (Vault), status, scopes, last_ok_at)
webhook_events (id, provider, external_id UNIQUE(provider, external_id), payload_hash,
                received_at, processed_at, status, error_code)
outbox (id, aggregate, aggregate_id, type, payload jsonb, status, attempts, next_attempt_at)
audit_log (id, organization_id, actor, action, entity, entity_id, at) — append-only
prompt_versions (id, name, version, template, model, params, created_by, evaluated_at, status)
evaluations (id, prompt_version_id, dataset, metrics jsonb, passed bool, created_at)
```

### Seguridad: RBAC y RLS

- RLS en todas las tablas por `organization_id` (directo o vía `property_id`),
  con función `is_member(org, min_role)` `security definer` y `search_path = ''`.
- Roles: `owner` (facturación, integraciones), `manager` (conocimiento, ofertas),
  `agent` (handoffs, conversaciones), `viewer` (métricas).
- Webchat público: sin sesión de Supabase; entra por un endpoint server-side con
  clave pública de propiedad + token de conversación firmado (HMAC), nunca con
  la anon key contra las tablas.
- Credenciales de integraciones en Supabase Vault; la tabla solo guarda la
  referencia.

### Flujo de una conversación

```
canal (webchat/WhatsApp) → endpoint ingest (idempotente por external_id)
  → persistir mensaje → cargar estado (conversation, property, ofertas activas)
  → RAG por propiedad (knowledge_chunks filtrados por property_id + locale)
  → LLM con herramientas tipadas:
       get_property_info · build_booking_link(dates, guests)
       list_upsells(context) · request_handoff(reason)
       check_availability(...)   ← solo si integration_connections.booking_engine activo
  → validación determinista de cada tool call (esquema, permisos, reglas)
  → ejecutar herramientas en código → respuesta → outbox (envío por canal)
```

### Adapters

```ts
interface ChannelAdapter { send(msg): Promise<SendResult>; parseWebhook(req): InboundMessage[] }
interface BookingEngineAdapter { buildLink(q): URL; checkAvailability?(q): Promise<Availability>; mapReservation?(evt): Reservation }
interface PmsAdapter { getStay?(ref): Promise<Stay>; postCharge?(ref, item): Promise<ChargeResult> }
interface LlmProvider { complete(req: { messages, tools, model, promptVersion }): Promise<LlmResult> }
```

- **WhatsApp Cloud API adapter:** webhook con verificación de firma
  (`X-Hub-Signature-256`), ventana de 24 h, plantillas aprobadas para mensajes
  fuera de ventana, idempotencia por `wamid`.
- **Booking engine adapter:** como mínimo `buildLink` con fechas/ocupantes y
  `attribution_token` en la URL; `checkAvailability` solo con API real.
- **PMS adapter:** opcional; lectura de estancias para pre-llegada y cargos de
  extras cuando la API lo permita.
- **LLM provider interface:** proveedor intercambiable; modelo, parámetros y
  versión de prompt registrados en cada mensaje.

### Idempotencia y fiabilidad

- `webhook_events UNIQUE(provider, external_id)`; `attribution_events.idempotency_key`.
- Transactional outbox para todo efecto externo (enviar mensaje, email,
  webhook a CRM): se escribe en la misma transacción que el cambio de estado y
  un worker lo entrega con reintentos exponenciales.
- Cargos y reservas: siempre con clave de idempotencia del proveedor.

### Observabilidad

- `request_id`/`conversation_id` en todos los logs; logs estructurados sin
  cuerpo de mensajes por defecto.
- Métricas: latencia por paso (RAG, LLM, tools), tasa de handoff, tasa de clic
  al motor, reservas atribuidas, coste de tokens por conversación.
- Alertas: errores de webhook, outbox atascado, SLA de handoff vencido.

### Versionado de prompts y evaluaciones automatizadas

- `prompt_versions` inmutables; publicar = cambiar el puntero activo por
  propiedad.
- Dataset de evaluación por propiedad (preguntas reales anonimizadas + respuesta
  esperada + comportamiento esperado: responder / enlazar / handoff).
- Métricas: exactitud factual contra la base de conocimiento, ausencia de
  confirmaciones de precio/disponibilidad sin herramienta, idioma correcto,
  handoff en casos sensibles. Un prompt no se publica si empeora alguna métrica
  bloqueante.
