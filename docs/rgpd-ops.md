# RGPD Ops Starter — documentación operativa

Herramienta operativa de pago (149 € + IVA, pago único, 12 meses de acceso) para pymes españolas que captan clientes con web, WhatsApp, CRM, newsletter, píxeles, automatizaciones e IA. Organiza la protección de datos como operación continua: tratamientos, proveedores, puntos de captación, solicitudes de derechos, incidentes, tareas, evidencias y revisiones.

**Lo que no es:** no constituye asesoramiento jurídico, no certifica el cumplimiento, no decide bases jurídicas, no determina si hacen falta EIPD o DPD, no decide si una brecha se notifica, no envía nada a la AEPD y no usa IA sobre el contenido. Cuando hay señales de mayor riesgo, recomienda revisión profesional.

Funnel: pilar `/es/cumplimiento/rgpd/` → diagnóstico gratuito `/test/` → producto `/ops/` → revisión especializada o implantación técnica (`/es/contact/?origen=rgpd`).

Plan de diseño y decisiones: `docs/rgpd-ops-plan.md`.

---

## 1. Arquitectura

```
Navegador ─ /rgpd/ops/ (estática) ─ RgpdCheckoutButton ─► POST /api/rgpd-ops/checkout ─► Stripe Checkout
Stripe ───► POST /api/rgpd-ops/webhook  (firma con RGPD_OPS_STRIPE_WEBHOOK_SECRET + idempotencia en BD)
              └─ pedido pagado → claim de acceso (una vez) → rgpd_ops_ensure_workspace() → magic link (Resend)
Email ────► GET  /api/rgpd-ops/consume-access?token=…   página de confirmación, NO consume
            POST /api/rgpd-ops/consume-access            consume, cookie __Host-rgo_session, 303 → /ops/acceso/
Navegador ─ /rgpd/ops/acceso/ (SSR) ── auth: cookie HMAC + pedido activo + espacio del pedido
              └─ island RgpdWorkspace (snapshot inicial por props; autosave contra la API)
                   ├─ GET/PATCH        /api/rgpd-ops/workspace
                   ├─ POST             /api/rgpd-ops/entities/:entity
                   ├─ PATCH | DELETE   /api/rgpd-ops/entities/:entity/:id
                   └─ GET              /api/rgpd-ops/export?formato=json | formato=csv&tipo=…
Supabase (Postgres) ─ funciones SQL rgpd_ops_* : lista blanca de tabla/columnas, workspace_id obligatorio,
                      versión optimista y auditoría en la misma transacción
```

| Pieza | Archivo |
|---|---|
| Producto público (precio mostrado, versión, rutas, changelog) | `src/data/rgpd-ops.ts` |
| Base normativa, fuentes, afirmaciones, changelog normativo | `src/data/rgpd.ts` |
| Contenido guiado, tareas semilla, revisión trimestral — **solo SSR** | `src/data/rgpd-ops-content.ts` |
| Esquema de entidades y perfil (validación, enums, derivados) | `src/lib/rgpd-ops/schema.ts` |
| Panel (progreso, madurez por área, alertas) | `src/lib/rgpd-ops/dashboard.ts` |
| Exportaciones (CSV, RAT, JSON) | `src/lib/rgpd-ops/export.ts` |
| Servicio y repositorio del espacio | `src/lib/rgpd-ops/workspace.ts` |
| Autorización / puerta de las rutas privadas | `src/lib/rgpd-ops/auth.ts`, `http.ts` |
| Pedidos, tokens, eventos, rate limit | `src/lib/rgpd-ops/orders.ts`, `rate-limit.ts` |
| Stripe, webhook, fulfillment, emails | `src/lib/rgpd-ops/{stripe,webhook,fulfillment,email}.ts` |
| Sesión, Origin, logs, env | `src/lib/rgpd-ops/{session,origin,log,env}.ts` |
| Helpers puros compartidos con el Kit | `src/lib/commerce/{tokens,payment-state,csv}.ts` |
| Diagnóstico | `src/lib/assessment/rgpd/*`, `src/pages/api/assessment/rgpd/*` |
| Islands | `src/islands/{RgpdWorkspace,RgpdCheckoutButton,RgpdAccessRequest,RgpdOpsOffer}.tsx` + extensión de `Assessment.tsx` |
| Estilos (prefijo `ro-`) | `src/styles/editorial-rgpd.css` |
| Migración | `supabase/migrations/20261013120000_create_rgpd_ops.sql` |

### Refactor del Kit (mínimo)

`src/lib/verifactu-kit/{csv,state,crypto}.ts` reexportan ahora `src/lib/commerce/*` con la misma API. La firma de sesión y las claves de rate limit del Kit siguen usando `vfk.session` y `vfk.rl` y son idénticas byte a byte (comprobado contra la versión anterior). Única diferencia de comportamiento: el CSV neutraliza también `＝ ＋ － ＠` (variantes de ancho completo); es más estricto, no menos. Tablas, rutas, cookies y variables del Kit no cambian. El resto (Stripe, webhook, email, sesión, origin, almacenamiento) se duplica deliberadamente por producto.

## 2. Rutas

| Ruta | Tipo | Indexable |
|---|---|---|
| `/es/cumplimiento/rgpd/` | estática | sí (WebPage, Service, FAQPage, BreadcrumbList) |
| `/es/cumplimiento/rgpd/test/` | estática + island | sí (WebPage, BreadcrumbList) |
| `/es/cumplimiento/rgpd/ops/` | estática | sí (Product, Offer, FAQPage, BreadcrumbList; sin AggregateRating) |
| `/es/cumplimiento/rgpd/ops/gracias/` | SSR | no |
| `/es/cumplimiento/rgpd/ops/acceso/` | SSR | no |
| `/es/cumplimiento/rgpd/ops/condiciones/` | estática | no (`noindex, follow`) |

Las tres no indexables están en `NOINDEX_PATHS` (`astro.config.mjs`) y fuera del sitemap. Las indexables están en `src/data/keywords-primarias.ts` (faixas estimadas, sin medir en el Keyword Planner). Todas son ES-only: `alternates` solo `es` + `x-default`.

| Endpoint | Notas |
|---|---|
| `POST /api/assessment/rgpd/submit` · `POST /api/assessment/rgpd/lead` | mismo patrón que los otros tests; `assessment_key = "rgpd-ops"` |
| `POST /api/rgpd-ops/checkout` | Origin, rate limit por IP, verificación de Price y Tax Rate |
| `POST /api/rgpd-ops/webhook` | firma, idempotencia, estados monotónicos |
| `POST /api/rgpd-ops/request-access` | respuesta no enumerable, 5/15 min por IP, 3/h por email |
| `GET/POST /api/rgpd-ops/consume-access` | GET no consume; POST consume (Origin, 20/h por IP) |
| `POST /api/rgpd-ops/logout` | |
| `GET/PATCH /api/rgpd-ops/workspace` | snapshot / perfil con versión |
| `POST /api/rgpd-ops/entities/:entity` | alta (`{ values }`) |
| `PATCH/DELETE /api/rgpd-ops/entities/:entity/:id` | `{ version, values }` / `{ version }` |
| `GET /api/rgpd-ops/export` | `formato=json` o `formato=csv&tipo=rat|tratamientos|proveedores|captacion|solicitudes|incidentes|tareas|evidencias|auditoria` |

`:entity` ∈ `tratamientos, proveedores, captacion, solicitudes, incidentes, tareas, evidencias, revisiones` (lista cerrada en TS y en SQL).

## 3. Modelo de datos

Pago y acceso (mismo diseño que el Kit): `rgpd_ops_orders`, `rgpd_ops_access_tokens` (solo SHA-256), `rgpd_ops_webhook_events`, `rgpd_ops_rate_limits` + `rgpd_ops_rate_limit_hit()` atómica.

Espacio: `rgpd_ops_workspaces` (`UNIQUE(order_id)`, `ON DELETE RESTRICT`, `version`, `profile jsonb ≤ 16 KB`) y entidades `rgpd_ops_processing_activities`, `rgpd_ops_processors`, `rgpd_ops_collection_points`, `rgpd_ops_rights_requests`, `rgpd_ops_incidents`, `rgpd_ops_tasks`, `rgpd_ops_evidence_items`, `rgpd_ops_review_cycles`, `rgpd_ops_audit_events`. Todas con `workspace_id NOT NULL … ON DELETE CASCADE`, UUID, timestamps, CHECKs en enums, arrays y longitudes, e índices por espacio + estado/vencimiento.

- **Versión optimista:** trigger `BEFORE UPDATE` → `version = old.version + 1`; también impide cambiar `workspace_id`, `id`, `created_at` y `order_id`.
- **Referencias internas** de solicitudes e incidentes: `^[A-Za-z0-9][A-Za-z0-9._/-]{0,39}$` (rechaza `@` y espacios), únicas por espacio.
- **Auditoría append-only:** trigger que rechaza UPDATE siempre y DELETE salvo en cascada desde el espacio. Guarda acción, módulo, id y nombres de campos; nunca valores.
- **Funciones:** `rgpd_ops_ensure_workspace` (idempotente, siembra tareas una vez), `rgpd_ops_entity_create/update/delete`, `rgpd_ops_update_profile`, `rgpd_ops_log_event`, `rgpd_ops_workspace_snapshot`, `rgpd_ops_purge_expired_workspaces`. Todas con `search_path = ''`, sin EXECUTE para `PUBLIC/anon/authenticated`.
- **Cascadas:** pedido → tokens (CASCADE); pedido → espacio (RESTRICT); espacio → entidades y auditoría (CASCADE). Los pedidos no se borran (documentación contable).
- **Límite:** 500 filas por módulo y espacio (exacto: el alta bloquea la fila del espacio).

## 4. Seguridad y privacidad

- Secretos solo server-side; `npm run rgpd-ops:check-bundle` lo comprueba tras el build (también que el contenido guiado y las funciones SQL no estén en el cliente y que las zonas privadas no se prerendericen).
- Cookie `__Host-rgo_session` (`rgo_session` en http://localhost): HttpOnly, Secure, SameSite=Lax, Path=/, HMAC-SHA256 con espacio de nombres `rgo.session`. Una cookie del Kit no sirve aquí aunque compartieran secreto.
- Cada petición privada revalida en BD: pedido `paid/partially_refunded`, `active`, dentro de `access_expires_at`, y su espacio.
- Mutaciones: Origin (o `Sec-Fetch-Site: same-origin`), `Content-Type: application/json`, cuerpo ≤ 64 KB, rate limit por pedido, validación con lista blanca (campos desconocidos → 400), versión obligatoria.
- IDOR: el `workspace_id` sale siempre de la sesión; la función SQL filtra por `id` + `workspace_id`; un id ajeno da 404.
- Minimización: sin campos para nombres, emails o documentos de titulares; todo texto libre rechaza emails, teléfonos y DNI/NIE; responsables por rol; evidencias por referencia; sin uploads.
- Logs JSON con campos cerrados (`scope: "rgpd-ops"`): sin email, token, IP, payload ni contenido.
- Analítica: lista blanca de eventos y parámetros (`src/lib/rgpd-ops/analytics.ts`); nunca respuestas, proveedores, empresa, email, ids ni contenido.
- Conversión: `/ops/gracias/` emite `purchase_confirmed` (una vez por pedido y pestaña) con `transaction_id` opaco (`rgo_` + HMAC del pedido con `RGPD_OPS_SESSION_SECRET`), `value` **sin IVA** (neto de la sesión de Stripe, con descuentos; si Stripe no responde, precio de lista) y `currency`. Mismo nombre de evento que el Kit: en GTM un solo disparador cubre los dos productos y se distinguen por `product_id` (`src/lib/commerce/purchase.ts`).
- Página de consumo del magic link: `CSP default-src 'none'`, `X-Frame-Options: DENY`, `Referrer-Policy: same-origin`, `no-store`, sin analítica.
- Sin IA sobre el contenido del espacio.

## 5. Flujo Stripe / webhook / magic link

Igual que el Kit (ver `docs/verifactu-kit.md` §2–§4), con estas diferencias:

1. Metadatos `product_key = rgpd-ops-starter`, `product_version`, `assessment_response_id` (si es UUID). El webhook ignora sesiones de otros productos; el del Kit ignora las de RGPD Ops.
2. Antes de cada checkout se comprueba el Price (14 900 céntimos, EUR, `one_time`, activo; `tax_behavior = exclusive` con Stripe Tax, no `inclusive` sin él) y, con IVA por Tax Rate, que el Tax Rate esté activo y sea `inclusive = false`. Si algo no coincide: `checkout_unavailable` y no se cobra.
3. Tras el claim de acceso se crea el espacio (idempotente). Si falla, el enlace sale igual y el espacio se crea en el primer acceso; el aviso interno lo marca «ESPACIO NO CREADO».
4. Reembolso total → acceso revocado; parcial → se conserva.

## 6. Variables de entorno

| Variable | Obligatoria | Uso |
|---|---|---|
| `RGPD_OPS_STRIPE_PRICE_ID` | sí | Price de 149 € (`price_…`) |
| `RGPD_OPS_STRIPE_WEBHOOK_SECRET` | sí | secreto del endpoint de webhook de RGPD Ops (**no** es el del Kit: Stripe firma cada endpoint con el suyo) |
| `RGPD_OPS_SESSION_SECRET` | sí | ≥ 32 caracteres aleatorios (`openssl rand -base64 48`). Distinto del del Kit |
| `RGPD_OPS_MAGIC_LINK_TTL_MINUTES` | no (60) | 5–1440 |
| `RGPD_OPS_SESSION_TTL_DAYS` | no (30) | 1–90 |
| `RGPD_OPS_BASE_URL` | no | base de los magic links en local/preview |
| `RGPD_OPS_ALLOWED_ORIGINS` | no | orígenes extra (previews), separados por comas |
| `RGPD_OPS_STRIPE_AUTOMATIC_TAX` | una de las dos | `true` con Stripe Tax |
| `RGPD_OPS_STRIPE_TAX_RATE_ID` | una de las dos | `txr_…` IVA 21 % exclusivo (puede ser el mismo del Kit) |
| `RGPD_OPS_STRIPE_INVOICE_CREATION` | no (`true`) | factura de Stripe |
| `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | ya existen | globales |

## 7. Configuración manual en Stripe

1. Product catalog → **RGPD Ops Starter**, tax code *General – Electronically Supplied Services* (`txcd_10000000`).
2. Price **149,00 EUR, One-off**, *Include tax in price* = **No**. Copia el `price_…` a `RGPD_OPS_STRIPE_PRICE_ID`.
3. IVA: el mismo esquema que el Kit (Tax Rate 21 % exclusivo → `RGPD_OPS_STRIPE_TAX_RATE_ID`, o Stripe Tax → `RGPD_OPS_STRIPE_AUTOMATIC_TAX=true`).
4. Webhooks → Add endpoint `https://iaoperators.com/api/rgpd-ops/webhook`, eventos `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`. Copia su *Signing secret* a `RGPD_OPS_STRIPE_WEBHOOK_SECRET`.
5. Condiciones: `consent_collection.terms_of_service` exige una URL de condiciones a nivel de cuenta (Settings → Public details), que ya existe por el Kit. El texto de aceptación del Checkout de RGPD Ops enlaza a `/es/cumplimiento/rgpd/ops/condiciones/`. Si quieres que el enlace de cuenta no apunte al Kit, cámbialo por una página general de condiciones que enlace a ambas.

## 8. Aplicar la migración (manual)

```bash
supabase link --project-ref <project-ref>
supabase db query --linked --file supabase/migrations/20261013120000_create_rgpd_ops.sql
supabase db query --linked "NOTIFY pgrst, 'reload schema';"
```

O pega el archivo en el SQL editor. Es idempotente. Antes, en local: `npm run rgpd-ops:test-sql` (PGlite).

## 9. Operación y soporte

- Diario: pedidos con `access_email_status = 'failed'`, eventos `failed`, logs con `"scope":"rgpd-ops"` y `"status":"error"`.
- «No me llega el enlace»: confirmar email del pedido → `npx tsx --env-file=.env scripts/rgpd-ops-resend-access.ts --email cliente@empresa.com` (o `--order <uuid>`).
- **Purga mensual obligatoria** (la política de privacidad promete borrar los espacios 90 días después del fin del acceso):
  ```sql
  select rgpd_ops_purge_expired_workspaces(90);
  select rgpd_ops_rate_limits_prune();
  ```
  Recomendado: programarlo con `pg_cron` en Supabase o un recordatorio mensual.
- Consultas útiles:
  ```sql
  -- Pedidos pagados sin espacio (no debería haber)
  select o.id from rgpd_ops_orders o left join rgpd_ops_workspaces w on w.order_id = o.id
  where o.access_status = 'active' and w.id is null;
  -- Uso por módulo (sin contenido)
  select entity, action, count(*) from rgpd_ops_audit_events group by 1, 2 order by 3 desc;
  ```

## 10. Reembolso y revocación

Haz el reembolso en Stripe. El webhook marca el pedido `refunded` y revoca el acceso; la sesión deja de valer en la siguiente petición. El espacio se conserva 90 días (por si el cliente quiere exportar) y lo borra la purga. Reembolso parcial: `partially_refunded`, acceso conservado. Disputas: manuales (no revocan automáticamente).

## 11. Backup y exportación

- Cliente: copia JSON versionada (`format: "rgpd-ops-backup"`, `formatVersion: 1`) y CSV por módulo, siempre con versión, fecha, aviso legal y marca de borrador cuando aplica.
- Operador: las tablas `rgpd_ops_*` entran en los backups de Supabase del proyecto. No hay restauración por cliente en el MVP (se haría a mano desde el JSON).

## 12. Fuentes normativas

En `src/data/rgpd.ts`, revisadas el **13/10/2026**: RGPD (texto en BOE, DOUE-L-2016-80807; arts. 2, 4, 9.1, 12.3, 22.1, 28.3, 30.1, 30.5, 33.1, 33.5, 34.1, 35.1, 35.3, 37.1, 99.2), LOPDGDD consolidada a 27/12/2025 (arts. 11, 28.2, 31.1, 34.1) y páginas de la AEPD (PYMES, RAT, plazo de derechos, brechas, herramientas, Gestiona RGPD, listado de cumplimiento). La FAQ de la AEPD «obligaciones del responsable» no devolvió contenido en la revisión y está marcada `verificada: false`. Pendiente registrado: propuestas «Ómnibus» de modificación del RGPD (no aplicadas).

Al cambiar la norma: actualizar `src/data/rgpd.ts` (fecha, afirmaciones, changelog), subir `RGPD_OPS_PRODUCT.version` y `RGPD_OPS_CHANGELOG`, y si cambia el motor, `ENGINE_VERSION` del diagnóstico.

## 13. Pruebas

```bash
npm run assessment:test-scoring          # SAC + Verifactu (sin cambios)
npm run assessment:test-scoring:rgpd     # 192.000 combinaciones, validación, emails, compatibilidad
npm run verifactu-kit:test               # regresión del Kit tras el refactor
npm run rgpd-ops:test                    # tokens, sesión, webhook firmado, idempotencia, auth, IDOR, versión, CSV, panel…
npm run rgpd-ops:test-sql                # migración en PGlite
npm run build
npm run verifactu-kit:check-bundle && npm run rgpd-ops:check-bundle
```

## 14. Limitaciones deliberadas del MVP

- Un único acceso por compra (sin multiusuario ni permisos).
- Sin subida de archivos ni datos de titulares.
- Sin recordatorios por email (las alertas solo se ven en el panel).
- Sin restauración desde la copia JSON.
- Sin SLA ni copias por cliente más allá del backup de Supabase.
- Condiciones de venta y cláusula de encargo **pendientes de validación jurídica**.
- La purga de espacios vencidos es manual hasta programarla.
- Faixas SEO estimadas, no medidas.

## 15. Backlog post-validación

Suscripción anual (renovación del acceso), multiusuario con roles, uploads de evidencias cifrados, recordatorios por email de vencimientos, revisión especializada como add-on en el checkout, importación del JSON, plantillas por sector.

## ADR-001 · Capa generativa opcional (no implementada)

**Contexto:** podría aportar valor explicar en lenguaje llano el estado de un módulo. **Decisión:** no se implementa en el MVP. Si se hace, será una interfaz `explain(structuredSummary) → text` que reciba solo datos estructurados agregados (contadores, estados, fechas; nunca texto libre del cliente), con revisión humana antes de mostrarse, sin decidir bases jurídicas, EIPD/DPD, notificación de brechas ni estado de cumplimiento, y desactivada por defecto. Requeriría actualizar la política de privacidad y las condiciones (nuevo subencargado).
