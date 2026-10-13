# RGPD Ops Starter — plan de implementación (MVP)

Fecha: 13/10/2026 · Estado: implementado en el mismo cambio que este plan. La documentación operativa está en `docs/rgpd-ops.md`.

## 1. Qué se construye

Un espacio de trabajo persistente (server-side, Supabase) para que una pyme española organice su protección de datos como operación continua: tratamientos, proveedores, puntos de captación, solicitudes de derechos, incidentes, tareas, evidencias y revisiones trimestrales. Pago único (149 € + IVA) con 12 meses de acceso y actualizaciones. No es un generador de políticas ni dictamina: todo lo jurídico queda como campo de trabajo o «borrador».

Funnel ES-only:

```
/es/cumplimiento/rgpd/            pilar (indexable)      → test, producto
/es/cumplimiento/rgpd/test/       diagnóstico gratuito   → resultado de madurez + oferta por segmento
/es/cumplimiento/rgpd/ops/        landing del producto   → Stripe Checkout
/es/cumplimiento/rgpd/ops/gracias/     SSR, noindex      ← vuelta de Stripe (solo consulta)
/es/cumplimiento/rgpd/ops/acceso/      SSR, noindex      ← magic link → workspace
/es/cumplimiento/rgpd/ops/condiciones/ estática, noindex, follow
```

## 2. Arquitectura

```
Navegador ─ landing ─ RgpdCheckoutButton ─► POST /api/rgpd-ops/checkout ─► Stripe Checkout
Stripe ───► POST /api/rgpd-ops/webhook (firma propia + idempotencia en BD)
              └─ pedido pagado → claim de acceso (una vez) → rgpd_ops_ensure_workspace() → magic link (Resend)
Email ────► GET  /api/rgpd-ops/consume-access   (página de confirmación, NO consume)
            POST /api/rgpd-ops/consume-access   (consume, cookie __Host-rgo_session, 303)
Navegador ─ /ops/acceso/ (SSR) ─ RgpdWorkspace (island)
              ├─ GET/PATCH /api/rgpd-ops/workspace         (snapshot y perfil, con versión)
              ├─ POST /api/rgpd-ops/entities/:entity        (alta)
              ├─ PATCH|DELETE /api/rgpd-ops/entities/:entity/:id   (con versión)
              └─ GET  /api/rgpd-ops/export?formato=json|csv&tipo=…
```

Capas:

| Capa | Dónde | Responsabilidad |
|---|---|---|
| Datos públicos del producto | `src/data/rgpd-ops.ts` | nombre, precio mostrado (fuente única), versión, rutas, changelog |
| Base normativa | `src/data/rgpd.ts` | normas, fuentes oficiales verificadas, afirmaciones usadas en la UI, changelog normativo |
| Contenido guiado (solo SSR) | `src/data/rgpd-ops-content.ts` | textos de ayuda por módulo, revisión trimestral, tareas semilla |
| Esquema de entidades (puro) | `src/lib/rgpd-ops/schema.ts` | campos permitidos, enums, longitudes, derivados (plazos) — cliente y servidor |
| Panel (puro) | `src/lib/rgpd-ops/dashboard.ts` | progreso, madurez por área, vencimientos, alertas |
| Servicio | `src/lib/rgpd-ops/workspace.ts` | autorización + validación + llamada a la BD |
| BD | migración `20261013120000_create_rgpd_ops.sql` | funciones SQL con lista blanca de tabla/columnas, `workspace_id` obligatorio, versión optimista y auditoría en la misma transacción |
| Pago y acceso | `src/lib/rgpd-ops/{env,session,auth,origin,log,rate-limit,orders,stripe,fulfillment,webhook,email}.ts` | mismo diseño que el Kit VERI*FACTU, aislado por producto |
| Helpers genéricos | `src/lib/commerce/{csv,payment-state,tokens}.ts` | puros, extraídos del Kit con wrappers compatibles |

## 3. Decisiones

1. **La BD es la frontera de autorización de datos.** Toda mutación del workspace pasa por funciones SQL (`rgpd_ops_entity_create/update/delete`, `rgpd_ops_update_profile`, `rgpd_ops_complete_review`) que: (a) traducen el slug de la entidad a una tabla con un `CASE` cerrado; (b) aplican una lista blanca de columnas; (c) filtran SIEMPRE por `workspace_id` + `id`; (d) exigen la versión esperada; (e) escriben el evento de auditoría en la misma transacción. El servidor valida antes tipos, enums y longitudes (`schema.ts`). Dos listas blancas independientes: un fallo en una no abre la otra. Permite probar IDOR, concurrencia y mass assignment contra Postgres real (PGlite).
2. **Versión optimista por fila.** Trigger `BEFORE UPDATE` incrementa `version` y `updated_at`; el cliente envía la versión que vio; si no coincide → 409 con la fila actual. También para el perfil (versión del workspace) y para el borrado.
3. **Workspace idempotente.** `rgpd_ops_ensure_workspace(order_id, product_version, seed_tasks)` hace `insert … on conflict (order_id) do nothing` y siembra las tareas iniciales solo si la fila es nueva, en una transacción. Se llama tras el claim de acceso en el webhook y, como red de seguridad, al autorizar cada petición privada.
4. **Auditoría append-only.** `rgpd_ops_audit_events` rechaza UPDATE siempre y DELETE salvo en cascada desde el workspace (comprobación con `pg_trigger_depth()`). Solo guarda acción, entidad, id y nombres de campos cambiados; nunca valores.
5. **Minimización.** Sin nombres, emails, documentos ni contenido de solicitudes de titulares; referencias internas con patrón restringido (rechaza `@`); responsables como rol funcional (no nombre); evidencias solo como referencia de ubicación; sin uploads.
6. **El diagnóstico es de madurez, no de cumplimiento.** `maturity: inicial | en_proceso | operativo` + `riskLevel` (compatibilidad analítica). `obligado` se guarda como `"si"` porque la columna existente tiene `CHECK` y el RGPD se aplica a cualquier empresa que trate datos de personas; la island NO lo muestra en la vista RGPD. Extensión mínima y opcional del tipo (`maturity?`, `review?`) y de la island (props con default = comportamiento actual).
7. **Revisión profesional, no conclusión.** Categorías especiales, menores, geolocalización/observación, perfiles, decisiones automatizadas, gran escala o ≥250 personas → recomendación de revisión profesional. El motor nunca dice si hace falta EIPD, DPD o notificar una brecha.
8. **Refactor mínimo.** Solo se extraen helpers puros (CSV, máquina de estados de pago, tokens/HMAC). `src/lib/verifactu-kit/{csv,state,crypto}.ts` pasan a ser wrappers que reexportan con la misma API y el mismo formato de firma (`vfk.session.`). Almacenamiento, Stripe, webhook, email, sesión y origin se duplican a propósito por producto: son pequeños, tienen nombres de variables, tablas y cookies distintos, y una abstracción común sería más compleja que dos implementaciones claras.
9. **Sin IA en el MVP.** Ninguna llamada a modelos; solo un ADR (`docs/rgpd-ops.md` §ADR) para una futura capa opcional de explicaciones con revisión humana.
10. **Sin localStorage como fuente de verdad.** Autosave con debounce contra el servidor; `localStorage` solo recuerda el último módulo abierto.

## 4. Modelo de datos (resumen)

Pago/acceso (copia del patrón del Kit): `rgpd_ops_orders`, `rgpd_ops_access_tokens`, `rgpd_ops_webhook_events`, `rgpd_ops_rate_limits` (+ `rgpd_ops_rate_limit_hit`).

Workspace: `rgpd_ops_workspaces` (1:1 con pedido, `UNIQUE(order_id)`, `ON DELETE RESTRICT`: un pedido con workspace no se borra por accidente), y entidades con `workspace_id NOT NULL REFERENCES … ON DELETE CASCADE`, `version`, `created_at`, `updated_at`: `rgpd_ops_processing_activities`, `rgpd_ops_processors`, `rgpd_ops_collection_points`, `rgpd_ops_rights_requests`, `rgpd_ops_incidents`, `rgpd_ops_tasks`, `rgpd_ops_evidence_items`, `rgpd_ops_review_cycles`, `rgpd_ops_audit_events`. CHECKs en todos los enums y longitudes. Índices por workspace + estado/vencimiento. Función de purga `rgpd_ops_purge_expired_workspaces(grace_days)` para la política de conservación (90 días tras el fin del acceso).

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| El comprador escribe datos personales de terceros en campos libres → IA Operators pasa a ser encargado | avisos en la UI, campos de rol en vez de nombre, patrón de referencias, cláusula de encargo (art. 28 RGPD) en las condiciones, **pendiente de validación jurídica** |
| Alegación jurídica incorrecta | textos prudentes, afirmaciones centralizadas en `src/data/rgpd.ts` con fuente oficial, lista de frases prohibidas comprobada en tests |
| Cobrar un precio distinto del anunciado | `assertPriceMatchesProduct` (importe, moneda, one_time, activo, tax_behavior) antes de cada checkout |
| Webhook duplicado o fuera de orden | `stripe_event_id` PK, `UNIQUE` de sesión y PaymentIntent, máquina de estados monotónica, claim condicional |
| Dos endpoints de webhook en la misma cuenta de Stripe con secretos distintos | variable propia `RGPD_OPS_STRIPE_WEBHOOK_SECRET` (no estaba en la lista inicial: es necesaria porque Stripe firma cada endpoint con su secreto) |
| Sobrescritura silenciosa entre pestañas | versión optimista + 409 + UI de conflicto |
| Crecimiento de la tabla de auditoría | índices por workspace/fecha; purga en cascada con el workspace |
| Cambios normativos en curso (paquetes «Ómnibus» de la Comisión que proponen tocar el RAT y las brechas) | registrados como pendientes en `src/data/rgpd.ts`; el producto aplica el texto vigente hasta su publicación en el DOUE |
| Producto en mercado saturado y con herramientas gratuitas de la AEPD | posicionamiento en operación continua, sin criticar a la AEPD; validación comercial antes de invertir en adquisición (ver resumen al usuario) |

## 6. Archivos previstos

Nuevos: `src/data/{rgpd,rgpd-ops,rgpd-ops-content}.ts`, `src/lib/commerce/*`, `src/lib/assessment/rgpd/*`, `src/lib/rgpd-ops/*`, `src/pages/api/assessment/rgpd/{submit,lead}.ts`, `src/pages/api/rgpd-ops/**`, `src/pages/es/cumplimiento/rgpd/**`, `src/islands/{RgpdWorkspace,RgpdCheckoutButton,RgpdAccessRequest,RgpdOpsOffer}.tsx`, `src/styles/editorial-rgpd.css`, `supabase/migrations/20261013120000_create_rgpd_ops.sql`, `scripts/{test-scoring-rgpd.ts,test-rgpd-ops.ts,test-rgpd-ops-sql.mjs,check-rgpd-ops-bundle.mjs,rgpd-ops-resend-access.ts}`, `docs/rgpd-ops.md`.

Modificados (mínimo): `src/lib/assessment/{types,email}.ts`, `src/islands/Assessment.tsx`, `src/lib/verifactu-kit/{csv,state,crypto}.ts` (wrappers), `src/pages/es/cumplimiento/index.astro`, `src/data/{navegacion,privacidad,keywords-primarias}.ts`, `astro.config.mjs` (NOINDEX_PATHS), `package.json` (scripts), `CLAUDE.md`.
