# Kit de Preparación VERI*FACTU — documentación operativa

Producto digital de pago (59 € + IVA) en el medio del embudo de la Frente B:

1. Contenido SEO (`/es/cumplimiento/verifactu/…`)
2. Test gratuito (`/es/cumplimiento/verifactu/test/`)
3. **Kit de pago** (`/es/cumplimiento/verifactu/kit/`)
4. Auditoría técnica (`/es/contact/?origen=verifactu`)
5. Proyecto de integración (`/es/cumplimiento/verifactu/integracion/`)

El Kit **no** es software de facturación, no emite facturas, no genera ni envía registros a la AEAT y no certifica el cumplimiento. Es preparación, diagnóstico orientativo, organización y decisión.

---

## 1. Arquitectura

```
Navegador ──► Landing estática (/kit/)            src/pages/es/cumplimiento/verifactu/kit/index.astro
   │             └─ island KitCheckoutButton ──► POST /api/verifactu-kit/checkout ──► Stripe Checkout
   │
Stripe ──────► POST /api/verifactu-kit/webhook  (firma + idempotencia en Supabase)
                  └─ pedido pagado → acceso concedido UNA vez → magic link por Resend
   │
Email ───────► GET  /api/verifactu-kit/consume-access?token=…  (página de confirmación, NO consume)
               POST /api/verifactu-kit/consume-access           (consume, cookie firmada, 303 → /kit/acceso/)
   │
Navegador ──► /kit/acceso/ (SSR)  cookie HMAC válida + pedido activo en Supabase → contenido de pago
                  └─ island KitWorkspace (progreso en localStorage, PDF por impresión, CSV por endpoint)
```

| Pieza | Archivo |
|---|---|
| Producto (nombre, precio mostrado, versión, meses de actualización, rutas, changelog) | `src/data/verifactu-kit.ts` |
| Contenido de pago (9 módulos, plantillas, árbol, tablas) — **solo server** | `src/data/verifactu-kit-content.ts` |
| Calendario normativo y fuentes (única fuente de fechas) | `src/data/verifactu.ts` (+ `factura-electronica.ts`) |
| Configuración y variables de entorno | `src/lib/verifactu-kit/env.ts` |
| Tokens, hash, sesión firmada, claves de rate limit | `src/lib/verifactu-kit/crypto.ts` |
| Cookie de sesión | `src/lib/verifactu-kit/session.ts` |
| Autorización de la zona privada | `src/lib/verifactu-kit/auth.ts` |
| Máquina de estados del pedido | `src/lib/verifactu-kit/state.ts` |
| Supabase (pedidos, tokens, eventos, rate limit) | `src/lib/verifactu-kit/storage.ts` |
| Stripe (cliente, verificación del Price, Checkout) | `src/lib/verifactu-kit/stripe.ts` |
| Lógica del webhook y emisión de enlaces | `src/lib/verifactu-kit/webhook.ts`, `fulfillment.ts` |
| Emails transaccionales | `src/lib/verifactu-kit/email.ts` |
| Rate limit persistente | `src/lib/verifactu-kit/rate-limit.ts` |
| Logs estructurados | `src/lib/verifactu-kit/log.ts` |
| CSV (con neutralización de fórmulas) | `src/lib/verifactu-kit/csv.ts` |
| Oferta por segmento tras el test | `src/lib/verifactu-kit/segment.ts` |
| Eventos de dataLayer (lista blanca, sin PII) | `src/lib/verifactu-kit/analytics.ts` |
| Endpoints | `src/pages/api/verifactu-kit/*.ts` |
| Páginas | `src/pages/es/cumplimiento/verifactu/kit/{index,gracias,acceso,condiciones}` |
| Islands | `src/islands/{KitCheckoutButton,KitAccessRequest,KitWorkspace,VerifactuKitOffer}.tsx` |
| Estilos (extensión del shell editorial, prefijo `vk-`) | `src/styles/editorial-kit.css` |
| Migración | `supabase/migrations/20261012120000_create_verifactu_kit.sql` |

### Rutas

| Ruta | Tipo | Indexable |
|---|---|---|
| `/es/cumplimiento/verifactu/kit/` | estática | sí (Product, Offer, FAQPage, BreadcrumbList) |
| `/es/cumplimiento/verifactu/kit/gracias/` | SSR | no |
| `/es/cumplimiento/verifactu/kit/acceso/` | SSR (`prerender = false`) | no |
| `/es/cumplimiento/verifactu/kit/condiciones/` | estática | no (`noindex, follow`) |
| `POST /api/verifactu-kit/checkout` | función | — |
| `POST /api/verifactu-kit/webhook` | función | — |
| `POST /api/verifactu-kit/request-access` | función | — |
| `GET/POST /api/verifactu-kit/consume-access` | función | — |
| `POST /api/verifactu-kit/logout` | función | — |
| `GET/POST /api/verifactu-kit/export` | función (autenticada) | — |

## 2. Flujo de checkout

1. La landing (o la oferta del resultado del test) muestra el precio desde `KIT_PRODUCT`.
2. Si el usuario viene del test, `VerifactuKitOffer` guarda en `sessionStorage` (`vfk_ctx`) el `responseId`, el segmento y el nivel de riesgo. Nada de eso va en la URL.
3. `KitCheckoutButton` hace `POST /api/verifactu-kit/checkout` con `{ responseId }` (opcional).
4. El endpoint: solo POST, valida `Origin`, `Content-Type`, rate limit por IP (10/10 min, *fail-open*), comprueba que el Stripe Price coincide con el precio mostrado (importe, moneda, `one_time`, activo y `tax_behavior = exclusive` con Stripe Tax) y crea la sesión con:
   - `price` server-side, `quantity: 1`;
   - `customer_creation: "always"`, `tax_id_collection.enabled`, `allow_promotion_codes`;
   - `automatic_tax` si `VERIFACTU_KIT_STRIPE_AUTOMATIC_TAX=true`; si no, `tax_rates: [VERIFACTU_KIT_STRIPE_TAX_RATE_ID]`; si no hay ninguna de las dos, **no vende** (`tax_not_configured`);
   - `billing_address_collection: "required"` con Stripe Tax o factura;
   - `invoice_creation` (por defecto activado);
   - `consent_collection.terms_of_service: "required"` + texto de renuncia al desistimiento (contenido digital, art. 103.m TRLGDCU);
   - metadatos (`product_key`, `product_version`, `assessment_response_id` si es un UUID válido) en la sesión, el PaymentIntent y la factura. Nunca respuestas del test.
   - `success_url` y `cancel_url` en el propio dominio.
5. Stripe redirige a `/kit/gracias/?session_id=…`. Esa página **solo consulta** el estado del pedido guardado por el webhook; no concede acceso. Si aún no existe, se recarga sola (cabecera `Refresh`, hasta 12 veces).

## 3. Webhook e idempotencia

Eventos gestionados: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`. El resto responde 200 y se ignora.

1. Firma verificada con el cuerpo crudo y `STRIPE_WEBHOOK_SECRET` (tolerancia de 5 min del SDK: una firma antigua se rechaza).
2. `claimWebhookEvent`: inserta `stripe_event_id`. Si ya está `processed`/`ignored` → 200 `duplicate` sin ejecutar nada (replay).
3. Sesiones que no son del Kit (`metadata.product_key`) → `ignored`.
4. `upsertOrderFromSession`: un pedido por `stripe_checkout_session_id` (UNIQUE; carrera resuelta con 23505 → update). El estado solo avanza (`state.ts`): un evento atrasado no deshace un pago ni un reembolso.
5. Si el pedido está `paid` → `claimAccessGrant` (UPDATE condicional `access_granted_at IS NULL`). Solo la llamada que gana el claim crea el token y envía el email. Así un pedido pagado genera acceso **exactamente una vez**.
6. `charge.refunded` total → `refunded` + `access_status = revoked`. Parcial → `partially_refunded`, se conserva el acceso.
7. Error de base de datos → 500 y evento `failed` → Stripe reintenta → la idempotencia hace seguro el reintento.
8. Un fallo de email **no** invalida el pedido: queda `access_email_status = failed`, llega el aviso interno de venta con la marca «EMAIL DE ACCESO FALLIDO» y el comprador puede pedir otro enlace.

## 4. Magic link y sesión

- Token: 32 bytes aleatorios (`base64url`, 43 caracteres). En la base de datos solo se guarda su SHA-256.
- Caducidad: `VERIFACTU_KIT_MAGIC_LINK_TTL_MINUTES` (60 por defecto). Uso único (UPDATE condicional sobre `consumed_at IS NULL AND expires_at > now()`).
- **El GET no consume.** Los escáneres de enlaces del correo (Safe Links, Gmail, antivirus) abren los enlaces con GET; si el GET consumiera, el cliente recibiría un enlace ya usado. El GET devuelve una página mínima (sin analítica, `Referrer-Policy: no-referrer`, CSP `default-src 'none'`) con un botón que hace POST. El POST valida `Origin`, consume, crea la sesión y redirige con 303 a `/kit/acceso/` sin token en la URL.
- Cookie: `__Host-vfk_session` en HTTPS (`vfk_session` en `http://localhost`), `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`. Contenido: `{v, oid, iat, exp}` en base64url + HMAC-SHA256 con `VERIFACTU_KIT_SESSION_SECRET`, verificada con `timingSafeEqual`. Dura `VERIFACTU_KIT_SESSION_TTL_DAYS` (30) y nunca más que el acceso comprado.
- En cada petición a la zona privada o a la exportación se comprueba además que el pedido sigue `paid`/`partially_refunded`, `active` y dentro de `access_expires_at` (12 meses desde el pago).
- `POST /request-access` responde siempre el mismo mensaje exista o no la compra. Límites: 5/15 min por IP (429) y 3/hora por email (silencioso).

## 5. Modelo de datos

`verifactu_kit_orders` — un pedido por Checkout Session.

| Columna | Notas |
|---|---|
| `id` uuid PK | |
| `email` | minúsculas (CHECK) |
| `customer_name`, `company_name` | de Stripe |
| `stripe_customer_id` | |
| `stripe_checkout_session_id` | UNIQUE |
| `stripe_payment_intent_id` | UNIQUE, NULL permitido (cupón 100 %) |
| `stripe_price_id`, `product_key`, `product_version` | |
| `amount_total` (céntimos), `currency` | |
| `payment_status` | `pending · paid · failed · refunded · partially_refunded` |
| `access_status` | `pending · active · revoked` |
| `assessment_response_id` | solo el id del test |
| `access_granted_at`, `access_expires_at` | claim único y fin de acceso |
| `access_email_status`, `access_email_sent_at`, `last_access_at` | operación y soporte |
| `created_at`, `updated_at`, `paid_at`, `refunded_at` | |

`verifactu_kit_access_tokens` — `id`, `order_id` (FK, cascade), `token_hash` UNIQUE (64 hex), `purpose` (`purchase · resend · admin_resend`), `expires_at`, `consumed_at`, `created_at`.

`verifactu_kit_webhook_events` — `stripe_event_id` PK, `event_type`, `processing_status` (`processing · processed · ignored · failed`), `attempts`, `processed_at`, `error_message` (código, nunca payload), `created_at`, `updated_at`.

`verifactu_kit_rate_limits` — `bucket_key` (HMAC, sin IP ni email), `window_started_at`, `hits`. Función atómica `verifactu_kit_rate_limit_hit(key, limit, window_seconds)` y `verifactu_kit_rate_limits_prune()`.

Todas con RLS activado, sin políticas, y `REVOKE ALL` para `anon` y `authenticated`. Solo `service_role`.

## 6. Variables de entorno

| Variable | Obligatoria | Uso |
|---|---|---|
| `STRIPE_SECRET_KEY` | sí | API de Stripe (checkout, verificación del Price) |
| `STRIPE_WEBHOOK_SECRET` | sí | firma del webhook (`whsec_…`) |
| `VERIFACTU_KIT_STRIPE_PRICE_ID` | sí | Price del Kit (`price_…`) |
| `VERIFACTU_KIT_SESSION_SECRET` | sí | firma de sesión y claves de rate limit. **≥ 32 caracteres aleatorios** (`openssl rand -base64 48`) |
| `VERIFACTU_KIT_MAGIC_LINK_TTL_MINUTES` | no (60) | 5–1440 |
| `VERIFACTU_KIT_SESSION_TTL_DAYS` | no (30) | 1–90 |
| `VERIFACTU_KIT_STRIPE_AUTOMATIC_TAX` | una de las dos | `true` si Stripe Tax está activo |
| `VERIFACTU_KIT_STRIPE_TAX_RATE_ID` | una de las dos | alternativa sin Stripe Tax (`txr_…`, IVA 21 % exclusivo) |
| `VERIFACTU_KIT_STRIPE_INVOICE_CREATION` | no (`true`) | factura de Stripe tras el pago |
| `VERIFACTU_KIT_BASE_URL` | no | base de los magic links (local/preview). Por defecto `https://iaoperators.com` |
| `VERIFACTU_KIT_ALLOWED_ORIGINS` | no | orígenes extra separados por comas (previews) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | sí | ya existen en Vercel |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` | sí | ya existen |
| `CONTACT_TO_EMAIL` | recomendado | aviso interno de venta (por defecto `info@iaoperators.com`) |

Ninguna lleva prefijo `PUBLIC_`. `npm run verifactu-kit:check-bundle` comprueba tras el build que no aparecen en el cliente.

Rotación de `VERIFACTU_KIT_SESSION_SECRET`: invalida todas las sesiones (los compradores piden un enlace nuevo). No afecta a pedidos ni tokens.

## 7. Configuración en Stripe

### Producto y precio
1. Dashboard → Product catalog → Add product: **Kit de Preparación VERI*FACTU para Autónomos y Pymes**.
2. Tax code: *General – Electronically Supplied Services* (`txcd_10000000`).
3. Precio: **59,00 EUR, One-off**, *Include tax in price* = **No** (`tax_behavior: exclusive`).
4. Copia el `price_…` a `VERIFACTU_KIT_STRIPE_PRICE_ID`.

Si cambias el precio: crea un Price nuevo, actualiza `KIT_PRODUCT.price` en `src/data/verifactu-kit.ts` y la variable, y despliega. Si no coinciden, el checkout responde `checkout_unavailable` (código `price_amount_mismatch` en logs) en vez de cobrar algo distinto de lo anunciado.

### Condiciones de venta (obligatorio)
Settings → Business → Public details → **Terms of service URL**: `https://iaoperators.com/es/cumplimiento/verifactu/kit/condiciones/`. Sin ella, Stripe rechaza `consent_collection.terms_of_service`.

### Stripe Tax
1. Settings → Tax → activar Stripe Tax y dirección de origen (Málaga).
2. Registrations: España (IVA). Si vendes a consumidores de otros países de la UE y superas 10.000 € anuales de ventas a distancia intra-UE, alta en OSS y registro «EU OSS» en Stripe. Confírmalo con tu asesoría.
3. `VERIFACTU_KIT_STRIPE_AUTOMATIC_TAX=true`.

Sin Stripe Tax: crea un Tax Rate «IVA 21 %», *exclusive*, y ponlo en `VERIFACTU_KIT_STRIPE_TAX_RATE_ID`. Simplificación: aplica 21 % a todo comprador.

### Webhook
Developers → Webhooks → Add endpoint:
- URL: `https://iaoperators.com/api/verifactu-kit/webhook`
- Eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`.
- Copia el *Signing secret* a `STRIPE_WEBHOOK_SECRET`.

### Resend
Desactiva **Click tracking** en el dominio de envío: reescribiría el enlace de acceso.

## 8. Aplicar la migración

No se aplica automáticamente. Con Supabase CLI (mismo flujo que las migraciones anteriores):

```bash
supabase link --project-ref <project-ref>
supabase db query --linked --file supabase/migrations/20261012120000_create_verifactu_kit.sql
supabase db query --linked "NOTIFY pgrst, 'reload schema';"
```

O pega el archivo en el SQL editor del panel. La migración es idempotente (`if not exists`, `create or replace`).

## 9. Pruebas

```bash
npm install                                  # añade stripe y @electric-sql/pglite (dev)
npm run assessment:test-scoring              # SAC + VERI*FACTU
npm run assessment:test-scoring:verifactu    # solo VERI*FACTU (scoring, validación, emails)
npm run verifactu-kit:test                   # tokens, sesión, estados, webhook con firmas reales, idempotencia, CSV, contenido
npm run verifactu-kit:test-sql               # migración contra Postgres en memoria (PGlite)
npm run build && npm run verifactu-kit:check-bundle
```

### Local con Stripe CLI (modo test)

`.env` local con claves `sk_test_…`, `price_…` de test, `VERIFACTU_KIT_SESSION_SECRET`, Supabase (proyecto de pruebas o el real con la migración aplicada), `VERIFACTU_KIT_BASE_URL=http://localhost:4321` y `VERIFACTU_KIT_ALLOWED_ORIGINS=http://localhost:4321`.

```bash
npm run dev
stripe listen --forward-to localhost:4321/api/verifactu-kit/webhook \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,charge.refunded
# copia el whsec_ que imprime a STRIPE_WEBHOOK_SECRET y reinicia npm run dev
```

Compra real de test: abre `/es/cumplimiento/verifactu/kit/`, paga con `4242 4242 4242 4242`. Pago asíncrono: tarjeta/SEPA de test con confirmación diferida.

Eventos sintéticos (el webhook ignora sesiones sin `product_key`, así que hay que añadirlo):

```bash
stripe trigger checkout.session.completed \
  --add checkout_session:metadata.product_key=verifactu-kit \
  --add checkout_session:metadata.product_version=1.0.0
stripe events resend evt_…        # replay: debe responder {"duplicate": true}
stripe refunds create --payment-intent pi_…   # → charge.refunded → acceso revocado
```

## 10. Reenvío de acceso

- **Autoservicio:** el comprador pide un enlace en `/es/cumplimiento/verifactu/kit/acceso/` con el email de la compra.
- **Soporte:**
  ```bash
  npx tsx --env-file=.env scripts/verifactu-kit-resend-access.ts --order <uuid>
  npx tsx --env-file=.env scripts/verifactu-kit-resend-access.ts --email cliente@empresa.com
  ```
  Solo reenvía a pedidos con acceso vigente. Si el cliente compró con otro email, corrige `email` del pedido en Supabase (en minúsculas) y reenvía.

Consultas útiles (SQL editor):

```sql
-- Pagados con email de acceso fallido
select id, email, created_at from verifactu_kit_orders
where payment_status = 'paid' and access_email_status = 'failed' order by created_at desc;

-- Eventos fallidos
select * from verifactu_kit_webhook_events where processing_status = 'failed' order by created_at desc;

-- Ventas por versión y origen (con o sin test)
select product_version, (assessment_response_id is not null) as desde_test, count(*), sum(amount_total)/100.0 as eur
from verifactu_kit_orders where payment_status in ('paid','partially_refunded') group by 1, 2;

-- Limpieza de contadores de rate limit
select verifactu_kit_rate_limits_prune();
```

## 11. Rollback

- **Desactivar ventas sin desplegar:** borra `VERIFACTU_KIT_STRIPE_PRICE_ID` en Vercel (o archiva el Price en Stripe). El checkout responde «no disponible»; compradores existentes siguen entrando.
- **Revertir el código:** revertir el commit. La landing desaparece; las tablas quedan intactas.
- **Revertir la base de datos (solo si no hay ventas reales):**
  ```sql
  drop table if exists public.verifactu_kit_access_tokens;
  drop table if exists public.verifactu_kit_webhook_events;
  drop table if exists public.verifactu_kit_rate_limits;
  drop table if exists public.verifactu_kit_orders;
  drop function if exists public.verifactu_kit_rate_limit_hit(text, integer, integer);
  drop function if exists public.verifactu_kit_rate_limits_prune();
  ```
  Con ventas reales, no borres pedidos: son documentación contable.
- Desactiva el endpoint del webhook en Stripe si retiras el producto.

## 12. Actualizar el contenido

1. Edita el módulo en `src/data/verifactu-kit-content.ts`, sube su `version` y `lastVerifiedAt`.
2. Sube `KIT_PRODUCT.version` y añade la entrada en `KIT_CHANGELOG` (`src/data/verifactu-kit.ts`).
3. Si cambian fechas, cambia **solo** `src/data/verifactu.ts` (y `factura-electronica.ts`) y `CALENDARIO.lastVerifiedAt`. Cuando se publique en el BOE el aplazamiento anunciado: actualiza `NORMA.fechaSociedades*`/`fechaResto*`, `ANUNCIO.publicado` y su texto.
4. `npm run verifactu-kit:test && npm run assessment:test-scoring && npm run build`.

## 13. Analítica (dataLayer)

Eventos: `view_item`, `begin_checkout`, `checkout_error`, `purchase_confirmed`, `kit_accessed`, `kit_module_completed`, `kit_template_copied`, `audit_cta_clicked`. Parámetros permitidos (lista blanca en `analytics.ts`): `product_id` (`verifactu-kit`), `product_version`, `assessment_segment`, `risk_level`, `source_page`, `module_id`, `template_id`, `error_code`, `transaction_id` (id interno del pedido), `value`, `currency`. Nunca email, NIF ni nombre. `purchase_confirmed` se emite una vez por pedido y pestaña desde `/gracias/` y solo si el pedido está confirmado en la base de datos. Hay que crear en GTM los activadores y etiquetas GA4 correspondientes.

## 14. Seguridad y privacidad (resumen)

- Secretos solo server-side; comprobación automática del bundle.
- Logs JSON con campos cerrados (`request_id`, `stripe_event_id`, `checkout_session_id`, `order_id`, `action`, `status`, `error_code`, `detail`): sin email, token ni payload.
- Contenido de pago fuera de `public/` y de las islands; solo en la respuesta SSR autenticada y en el endpoint de exportación.
- `Origin` validado en todo POST que cambia estado; magic links de un solo uso; rate limit persistente en Postgres.
- La compra solo autoriza emails de pago y acceso. El opt-in comercial sigue siendo el del test.
- Política de privacidad actualizada (ES/EN/PT): tratamiento «Compra del Kit», Stripe como proveedor y cookie de sesión técnica.

## 15. Limitaciones legales y pendientes

- **Condiciones de venta pendientes de validación jurídica** antes de vender en *live* (desistimiento en contenido digital, responsabilidad, ley aplicable).
- El Kit es orientativo: no dictamina, no certifica y repite en cada módulo que la calificación fiscal es de la asesoría.
- **VERI*FACTU aplica también a quien vende el Kit.** Si las facturas se emiten con Stripe Invoicing, Stripe es el sistema informático de facturación de IA Operators a partir de la fecha vigente para autónomos. Hay que confirmar con la asesoría y con Stripe la conformidad o emitir las facturas desde un sistema conforme. Con `VERIFACTU_KIT_STRIPE_INVOICE_CREATION=false` Stripe solo envía el recibo.
- IVA de servicios electrónicos a consumidores de otros países de la UE: regla de localización en destino por encima de 10.000 €/año (OSS). Stripe Tax lo calcula, pero el alta en OSS es una decisión fiscal.
- La fecha de 2028 es un anuncio: el contenido la presenta así hasta que se publique la norma.
- Disputas (`charge.dispute.created`) no revocan el acceso automáticamente en este MVP; gestiónalas a mano.

## 16. Operación y soporte

- Diario: pedidos con `access_email_status = 'failed'` y eventos `failed` (consultas de §10).
- Ante «no me llega el enlace»: confirmar email del pedido → `resend-access` → revisar Resend (rebotes, spam).
- Ante reembolso: hacerlo en Stripe; el webhook revoca el acceso. No hace falta tocar Supabase.
- Logs en Vercel: filtrar por `"scope":"verifactu-kit"` y `"status":"error"`.
