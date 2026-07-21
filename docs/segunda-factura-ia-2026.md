# Encuesta “La Segunda Factura de la IA 2026”

## 1. Resumen

- Nombre provisional: `La Segunda Factura de la IA 2026`
- Objetivo: medir cómo empresas y profesionales usan IA en el trabajo y qué nivel de exposición existe respecto a documentación interna, datos personales, conocimiento operativo, gobernanza y dependencia de proveedores.
- Hipótesis central: la adopción de IA en el trabajo ya es amplia, pero una parte relevante del mercado combina uso intensivo con gobernanza insuficiente, controles inconsistentes y dependencia elevada de uno o pocos proveedores.
- Mercado inicial: España.
- Idioma público: español de España.
- Naturaleza del estudio: levantamiento exploratorio, no representativo por defecto.

## 2. Público objetivo

- Empresarios y fundadores.
- Dirección general y mandos intermedios.
- Profesionales de tecnología, marketing, operaciones, seguridad, innovación y transformación digital.
- Consultores, autónomos y empleados que usan IA en el trabajo.

## 3. Criterios de inclusión

- Personas adultas que trabajen o asesoren organizaciones.
- Usuarios actuales, ocasionales o incluso no usuarios de IA en el trabajo.
- No se requiere pertenecer a grandes empresas.
- Se excluyen respuestas con honeypot activado o con abuso técnico evidente del endpoint.

## 4. Cuestionario definitivo

Tiempo estimado: menos de 3 minutos.

### P1. Perfil profesional

- Tipo: selección única
- Variable: `professional_role`
- Opciones:
  - Propietario/a o fundador/a
  - Dirección general o comité ejecutivo
  - Mando intermedio o responsable de equipo
  - Tecnología, producto o datos
  - Marketing, ventas o atención al cliente
  - Operaciones, seguridad, innovación o transformación digital
  - Consultor/a o profesional autónomo
  - Empleado/a de otra área
  - Prefiero no responder
- Justificación: segmenta por tipo de profesional y responsabilidad funcional.

### P2. Tamaño de organización

- Tipo: selección única
- Variable: `company_size`
- Opciones:
  - Solo yo
  - 2 a 10 personas
  - 11 a 50 personas
  - 51 a 250 personas
  - 251 a 1.000 personas
  - Más de 1.000 personas
  - No lo sé
  - Prefiero no responder
- Justificación: compara exposición y madurez según escala.

### P3. Sector

- Tipo: selección única
- Variable: `sector`
- Opciones:
  - Tecnología o software
  - Servicios profesionales o consultoría
  - Marketing, medios o comunicación
  - Retail o comercio electrónico
  - Industria, logística o energía
  - Turismo, hostelería o restauración
  - Salud, educación o sector público
  - Finanzas, seguros o legal
  - Otro sector
  - Prefiero no responder
- Justificación: permite cruces sectoriales.

### P4. País o región

- Tipo: selección única
- Variable: `country_region`
- Opciones:
  - España · Andalucía
  - España · Cataluña
  - España · Comunidad de Madrid
  - España · Comunidad Valenciana
  - España · Otra comunidad
  - Otro país de Europa
  - Latinoamérica
  - Otra región
  - Prefiero no responder
- Justificación: segmenta la muestra geográficamente.

### P5. Frecuencia de uso de IA

- Tipo: selección única
- Variable: `ai_usage_frequency`
- Opciones:
  - A diario
  - Varias veces por semana
  - Varias veces al mes
  - De forma esporádica
  - No las utilizo en el trabajo
  - No lo sé
- Justificación: responde a adopción real y sirve como eje analítico principal.

### P6. Tipo de cuenta usada para trabajo

- Tipo: selección única
- Variable: `work_account_usage`
- Opciones:
  - Solo cuenta corporativa aprobada
  - Solo cuenta personal
  - Principalmente corporativa, con uso ocasional de cuentas personales
  - Principalmente personal, con acceso limitado a cuentas corporativas
  - Cuenta compartida de equipo
  - No uso IA para el trabajo
  - No lo sé
- Justificación: mide uso de cuentas personales.

### P7. Tipos de información compartida

- Tipo: selección múltiple
- Variable: `shared_information_types`
- Opciones:
  - Documentos internos o borradores
  - Datos personales
  - Contratos, propuestas o documentos legales
  - Procedimientos o know-how operativo
  - Estrategias o información sensible
  - Código o configuraciones técnicas
  - Ninguno de los anteriores
  - No lo sé
  - Prefiero no responder
- Justificación: cuantifica exposición sin solicitar contenido confidencial.

### P8. Madurez de gobernanza

- Tipo: selección única
- Variable: `governance_maturity`
- Opciones:
  - No existe política ni pautas claras
  - Hay recomendaciones informales
  - Política formal sin formación sistemática
  - Política formal con formación básica
  - Política formal con formación y seguimiento o auditoría
  - No lo sé
- Justificación: responde sobre política formal y nivel de madurez.

### P9. Prácticas con proveedor y salvaguardas

- Tipo: selección múltiple
- Variable: `vendor_and_safeguard_practices`
- Opciones:
  - Conocemos cómo el proveedor usa los datos
  - Anonimizamos o resumimos documentos antes de enviarlos
  - Eliminamos datos personales antes de compartirlos
  - Evitamos subir información sensible salvo necesidad justificada
  - Limitamos el uso a herramientas aprobadas
  - No aplicamos ninguna de estas prácticas
  - No lo sé
- Justificación: mide conocimiento de términos, anonimización y controles preventivos.

### P10. Monitorización y Shadow AI

- Tipo: selección única
- Variable: `monitoring_and_shadow_ai`
- Opciones:
  - Se registra o audita y ya se detectó Shadow AI
  - Se registra o audita y no se detectó Shadow AI
  - No se registra de forma sistemática, pero sí se detectó Shadow AI
  - No se registra de forma sistemática y no se detectó Shadow AI
  - No lo sé
- Justificación: cubre observabilidad y detección de Shadow AI.

### P11. Dependencia y continuidad

- Tipo: selección única
- Variable: `supplier_dependency_resilience`
- Opciones:
  - Poco impacto, varias alternativas
  - Impacto manejable con cambio de proveedor o proceso
  - Retrasos importantes durante semanas
  - Afectación clara de operaciones o entregas
  - Bloqueo casi total de parte del trabajo
  - No aplica porque no usamos IA de forma relevante
  - No lo sé
- Justificación: mide dependencia de proveedor y resiliencia operativa.

### P12. Riesgo percibido

- Tipo: escala simple
- Variable: `risk_perception`
- Opciones:
  - 1 Muy bajo
  - 2 Bajo
  - 3 Medio
  - 4 Alto
  - 5 Muy alto
  - No lo sé
- Justificación: contrasta percepción con prácticas reales.

## 5. Posibilidades de cruce

- Perfil profesional × frecuencia de uso × riesgo percibido.
- Tamaño de empresa × madurez de gobernanza × Shadow AI.
- Sector × tipos de información compartida × prácticas de anonimización.
- Región × frecuencia de uso × política formal.
- Frecuencia de uso × tipo de cuenta × dependencia de proveedor.

## 6. Respuestas válidas

Una respuesta se considera válida para análisis primario cuando:

- el usuario completa el cuestionario;
- acepta consentimiento obligatorio;
- no activa honeypot;
- pasa validación estructural;
- no presenta flags críticos que obliguen a exclusión manual.

Casos dudosos no se eliminan automáticamente. Se marcan como `needs_review`.

## 7. Calidad de datos y prevención de abuso

Implementado:

- sesión anónima por `responseId`;
- timestamps de inicio, actualización, abandono y envío;
- UTMs y origen de visita;
- fingerprint hash con sal, sin guardar IP completa;
- detección de respuestas muy rápidas;
- detección de duplicados probables por huella técnica;
- flags por inconsistencias lógicas;
- honeypot;
- revisión manual en admin.

No implementado todavía:

- CAPTCHA o challenge externo;
- reputación avanzada de IP;
- scoring antifraude multicapa.

## 8. Estructura de datos

### Respuestas

Campos principales del registro:

- `responseId`
- `status`
- `locale`
- `questionnaireVersion`
- `startedAt`
- `submittedAt`
- `abandonedAt`
- `completionStep`
- `answers`
- `consent`
- `optionalEmailProvided`
- `qualityFlags`
- `reviewStatus`
- `reviewNotes`
- `fingerprintHash`
- `answerSignature`
- `source.landingPath`
- `source.referrer`
- `source.utms.*`
- `source.deviceCategory`
- `durationMs`

### Emails opcionales

Campos:

- `responseId`
- `email`
- `createdAt`
- `locale`
- `questionnaireVersion`
- `emailMarketingAccepted`

## 9. Drivers de almacenamiento

### Desarrollo

- `SURVEY_STORAGE_DRIVER=local`
- Archivos JSON en `work/survey-data/segunda-factura-ia-2026/`

### Producción recomendada

- `SURVEY_STORAGE_DRIVER=supabase`
- Tabla 1: `public.survey_responses`
- Tabla 2: `public.survey_response_emails`
- Variables necesarias:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ACCESS_TOKEN` si se va a operar por CLI/Management API
  - `SURVEY_SUPABASE_RESPONSES_TABLE` opcional
  - `SURVEY_SUPABASE_EMAILS_TABLE` opcional

Migración versionada en el repo:

- `supabase/migrations/20260721233500_create_survey_segunda_factura_ia.sql`

Campos principales en `survey_responses`:

- `response_id`
- `slug`
- `title`
- `questionnaire_version`
- `status`
- `locale`
- `questionnaire_language`
- `created_at`
- `updated_at`
- `started_at`
- `submitted_at`
- `abandoned_at`
- `completion_step`
- `total_steps`
- `answers` jsonb
- `consent` jsonb
- `optional_email_provided`
- `quality_flags` jsonb
- `review_status`
- `review_notes` jsonb
- `fingerprint_hash`
- `answer_signature`
- `landing_path`
- `referrer`
- `origin_label`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `user_agent_hash`
- `device_category`
- `duration_ms`

Campos principales en `survey_response_emails`:

- `response_id`
- `email`
- `created_at`
- `locale`
- `questionnaire_version`
- `email_marketing_accepted`

Notas de seguridad:

- ambas tablas tienen RLS habilitado;
- no se crean políticas públicas;
- el acceso operativo actual se hace desde el backend con `service role`;
- el email opcional vive en una tabla separada de las respuestas conductuales.
- para operaciones CLI, el token de cuenta es `SUPABASE_ACCESS_TOKEN`; no sustituye a `SUPABASE_SERVICE_ROLE_KEY`.

## 10. Analytics

Eventos enviados a `dataLayer`:

- `survey_view`
- `survey_start`
- `survey_step_advance`
- `survey_abandon`
- `survey_complete`

Parámetros relevantes:

- `survey_slug`
- `response_id`
- `step_index`
- `step_name`
- `utm_source`
- `utm_campaign`
- `device_width`
- `review_status`

## 11. Área administrativa mínima

Disponible en:

- `/es/admin/segunda-factura-ia/`

Incluye:

- conteo de sesiones iniciadas, completadas y abandonadas;
- tasa de finalización;
- filtros por estado, revisión, versión y campaña;
- exportación CSV completa;
- exportación CSV anonimizada;
- vista de flags de calidad;
- actualización manual de estado de revisión;
- detalle del registro completo para auditoría rápida.

## 12. Publicación

### Local

```bash
npm run dev
```

### Producción

1. Configurar variables `SURVEY_*`, `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
2. Si se va a operar por CLI, configurar también `SUPABASE_ACCESS_TOKEN`.
3. Aplicar la migración SQL en Supabase.
4. Recargar schema cache con:

```sql
NOTIFY pgrst, 'reload schema';
```

5. Validar acceso con:

```bash
npm run survey:check-supabase
```

6. Configurar `SURVEY_ADMIN_USER` y `SURVEY_ADMIN_PASSWORD`.
7. Ejecutar `npm run build`.
8. Publicar en Vercel.
9. Probar:
   - carga de `/es/estudio/segunda-factura-ia/encuesta/`
   - envío completo
   - creación de registro
   - exportación CSV
   - acceso admin

## 13. Cómo editar preguntas

- Archivo principal: `src/lib/survey/questions.ts`
- Validación: `src/lib/survey/validation.ts`
- UI: `src/islands/SurveyForm.tsx`

Si se cambia estructura de preguntas:

- mantener IDs estables cuando se quiera comparar series históricas;
- subir `SURVEY_VERSION` si cambia el cuestionario;
- revisar exportaciones y cruces.

## 14. Cómo crear una nueva versión

1. Duplicar y ajustar `SURVEY_VERSION` en `src/lib/survey/types.ts`.
2. Editar preguntas en `src/lib/survey/questions.ts`.
3. Revisar cruces, copy y documentación.
4. Publicar la nueva versión manteniendo la exportación segmentable por `questionnaireVersion`.

## 15. Limitaciones conocidas

- No hay CAPTCHA ni proveedor antifraude dedicado en esta fase.
- La calidad de la muestra dependerá del canal de captación.
- El modo `local` no es persistente para producción serverless.
- El driver Supabase requiere proyecto, credenciales server-side y migración aplicada.
- La encuesta está diseñada como exploratoria; no debe presentarse como representativa del tejido empresarial español sin validación adicional.

## 16. Próximos pasos recomendados

- Añadir tablero analítico con agregaciones y cohortes.
- Incorporar un mecanismo antifraude más fuerte si aumenta el volumen.
- Definir una taxonomía editorial para publicar hallazgos parciales cuando exista muestra suficiente.
- Preparar la calculadora de riesgo y el estudio público final, sin adelantarlos en esta fase.

## 17. Verificación operativa realizada

Estado validado en el proyecto remoto de Supabase:

- migración ejecutada;
- schema cache de PostgREST recargado;
- inserción y borrado directo en `survey_responses`;
- inserción y borrado directo en `survey_response_emails`;
- smoke test del flujo server-side `createSurveySession` → `finalizeSurveySubmission` con `storageDriver = "supabase"`.
