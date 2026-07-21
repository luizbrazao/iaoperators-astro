# IA Operators · Astro Site

Sitio web de IA Operators construido con Astro 5, React islands, Tailwind CSS v4 y despliegue en Vercel.

## Comandos

```bash
npm run dev
npm run build
npm run preview
```

## Stack

- Astro 5 con rutas estáticas y endpoints `prerender = false` para funciones serverless.
- React 19 para formularios e interacciones.
- Tailwind CSS v4 para estilos.
- Vercel para hosting.
- GTM ya integrado mediante consentimiento de cookies.

## Encuesta “La Segunda Factura de la IA 2026”

Ruta pública:

```text
/es/estudio/segunda-factura-ia/encuesta/
```

Ruta de agradecimiento:

```text
/es/estudio/segunda-factura-ia/encuesta/gracias/
```

Área admin:

```text
/es/admin/segunda-factura-ia/
```

### Variables de entorno de la encuesta

```bash
# Driver: "local" para desarrollo, "supabase" para producción
SURVEY_STORAGE_DRIVER=supabase

# Seguridad y control
SURVEY_FINGERPRINT_SALT=change-me
SURVEY_ADMIN_USER=admin
SURVEY_ADMIN_PASSWORD=change-me

# Fallback local
SURVEY_LOCAL_STORAGE_DIR=./work/survey-data/segunda-factura-ia-2026

# Producción con Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ACCESS_TOKEN=
SURVEY_SUPABASE_RESPONSES_TABLE=survey_responses
SURVEY_SUPABASE_EMAILS_TABLE=survey_response_emails
```

### Backend de almacenamiento

- `local`: guarda JSON en `work/survey-data/segunda-factura-ia-2026/` para desarrollo y pruebas locales.
- `supabase`: usa dos tablas separadas en Postgres para respuestas y emails opcionales.

### Migraciones

- SQL de creación de tablas:
  - `supabase/migrations/20260721233500_create_survey_segunda_factura_ia.sql`
- Aplicar con tu flujo habitual de Supabase CLI o desde el panel SQL.
- El backend de la encuesta usa `SUPABASE_SERVICE_ROLE_KEY` solo en endpoints server-side. No se expone al cliente.
- Si vas a operar con Supabase CLI/Management API, usa además `SUPABASE_ACCESS_TOKEN`.

### Validación rápida

```bash
npm run survey:check-supabase
```

Este script valida acceso server-side a:

- `survey_responses`
- `survey_response_emails`

### Flujo recomendado con Supabase CLI

```bash
supabase link --project-ref <tu-project-ref>
supabase db query --linked --file supabase/migrations/20260721233500_create_survey_segunda_factura_ia.sql
supabase db query --linked "NOTIFY pgrst, 'reload schema';"
npm run survey:check-supabase
```

### Exportaciones

- CSV completo:
  - `/api/survey/segunda-factura-ia/export.csv`
- CSV anonimizado:
  - `/api/survey/segunda-factura-ia/export.csv?anon=1`

Ambos endpoints requieren autenticación básica cuando `SURVEY_ADMIN_USER` y `SURVEY_ADMIN_PASSWORD` están configurados.

## Documentación adicional

- [Encuesta La Segunda Factura de la IA 2026](./docs/segunda-factura-ia-2026.md)
