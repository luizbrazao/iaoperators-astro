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
# Driver: "local" para desarrollo, "airtable" para producción si ya existen las tablas
SURVEY_STORAGE_DRIVER=local

# Seguridad y control
SURVEY_FINGERPRINT_SALT=change-me
SURVEY_ADMIN_USER=admin
SURVEY_ADMIN_PASSWORD=change-me

# Fallback local
SURVEY_LOCAL_STORAGE_DIR=./work/survey-data/segunda-factura-ia-2026

# Producción con Airtable
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
SURVEY_AIRTABLE_RESPONSES_TABLE=survey_responses
SURVEY_AIRTABLE_EMAILS_TABLE=survey_emails
```

### Backend de almacenamiento

- `local`: guarda JSON en `work/survey-data/segunda-factura-ia-2026/` para desarrollo y pruebas locales.
- `airtable`: usa dos tablas separadas para respuestas y emails opcionales.

### Exportaciones

- CSV completo:
  - `/api/survey/segunda-factura-ia/export.csv`
- CSV anonimizado:
  - `/api/survey/segunda-factura-ia/export.csv?anon=1`

Ambos endpoints requieren autenticación básica cuando `SURVEY_ADMIN_USER` y `SURVEY_ADMIN_PASSWORD` están configurados.

## Documentación adicional

- [Encuesta La Segunda Factura de la IA 2026](./docs/segunda-factura-ia-2026.md)
