# Roadmap Datadicoco — Plataforma Unificada de Chatbots
## Análisis Estratégico y Plan de Ejecución

**Fecha:** Mayo 26 – Junio 20, 2026  
**Cliente:** Datadicoco (cliente único)  
**Duración:** 4 semanas  
**Responsables:** Luiz (tech lead), Daniel (product/stakeholder), Rafa (infrastructure)

---

## FASE 1: INPUTS ESTRATÉGICOS

### Objetivo del Negocio
- **OKR Principal:** Consolidar plataforma unificada de chatbots en infraestructura Datadicoco
- **Métrica de Éxito:** 4 bots migrables, transcripciones centralizadas, acceso unificado
- **Contexto:** Cliente único requiere consolidación urgente de múltiples sistemas legados

### Problemas del Cliente
1. **Fragmentación de infraestructura** — Bots en múltiples plataformas (UChat + servidor propio)
2. **Falta de visibilidad centralizada** — No hay panel unificado para ver todos los bots
3. **Transcriciones dispersas** — Datos de llamadas sin integración
4. **Dependencia de proveedores externos** — Riesgo de migración incompleta

### Restricciones Técnicas
- Plazo muy comprimido (4 semanas)
- Dependencias en terceros (Daniel/Datadicoco para acceso a UChat)
- Transferencia de ownership del código
- Disponibilidad limitada en infraestructura

### Requests de Stakeholders
- Daniel: "Necesitamos demo de QA integral en Semana 4"
- Rafa: "Infraestructura debe estar 100% en Datadicoco"
- Luiz: "Cada fase debe entregar un artefacto verificable"

---

## FASE 2: ÉPICAS DEFINIDAS

### ÉPICA 1: Activación del Chatbot Actual
**Hipótesis:** Activar el bot existente con número actualizado es un quick-win que genera confianza temprana y reduce riesgos.

**Métrica de Éxito:** Bot en producción, notificaciones por email configuradas (pendiente confirmación)  
**Esfuerzo:** S (1-2 semanas)  
**Dependencias:** Ninguna  
**Semana:** 1  
**Propietario:** Luiz

---

### ÉPICA 2: Migración Bot de UChat
**Hipótesis:** Migrar el bot auditado de UChat a plataforma propia demuestra viabilidad técnica y libera dependencia de UChat.

**Métrica de Éxito:**
- Bot replicado con 100% de funcionalidad
- Flujos, integraciones y respuestas idénticas al original
- Testing end-to-end completado

**Esfuerzo:** M (3-4 semanas)  
**Dependencias:** Épica 1 (acceso a UChat) → Épica 2 (ejecución)  
**Semanas:** 2-3  
**Propietario:** Luiz

---

### ÉPICA 3: Bot Genérico Nuevo
**Hipótesis:** Diseñar un flujo genérico reutilizable acelera la replicación de bots y reduce refactoring futuro.

**Métrica de Éxito:**
- Flujo genérico diseñado por Datadicoco
- Documentación de parámetros y puntos de extensión
- Integración técnica completada por Luiz

**Esfuerzo:** M (3-4 semanas)  
**Dependencias:** Paralelo a Épica 2  
**Semanas:** 2-3  
**Propietario:** Daniel + equipo Datadicoco / Luiz (integración)

---

### ÉPICA 4: Integración Callbots + Transcripciones
**Hipótesis:** Centralizar historial de llamadas y transcripciones en un panel unificado es el diferenciador clave para el cliente.

**Métrica de Éxito:**
- Panel unificado mostrando 4 bots
- Historial de llamadas por bot
- Transcripciones consultables y filtradas

**Esfuerzo:** L (2-3 meses si fuera aislada, pero condensada a 2 semanas aquí)  
**Dependencias:** Épicas 1, 2, 3  
**Semanas:** 3-4  
**Propietario:** Rafa + Luiz

---

### ÉPICA 5: Infraestructura Datadicoco
**Hipótesis:** Migrar la plataforma completa a infraestructura Datadicoco elimina riesgos de vendor lock-in y consolida propiedad del código.

**Métrica de Éxito:**
- Repositorio GitHub bajo cuenta Datadicoco
- Proyecto configurado en Render (o servidor propio)
- Ownership del código transferido
- Acceso a plataforma original cortado

**Esfuerzo:** M (3-4 semanas)  
**Dependencias:** Paralelo a Épicas 2-4, completarse en Semana 4  
**Semanas:** 1-4 (continuado)  
**Propietario:** Luiz + Rafa

---

## FASE 3: PRIORIZACIÓN

### Matriz de Prioridad (RICE Adaptado)

| Épica | Reach | Impact | Confidence | Effort | Score | Strategic |
|-------|-------|--------|-----------|--------|-------|-----------|
| 1 - Bot Actual | 1 (setup) | 2 (confianza) | 95% | 1 sem | 190 | CRÍTICA |
| 2 - Migración UChat | 4 (bot existente) | 3 (viabilidad demo) | 85% | 2 sem | 510 | CRÍTICA |
| 3 - Bot Genérico | 4 (reusable) | 2 (futuro) | 80% | 2 sem | 320 | ALTA |
| 4 - Callbots + Transcripciones | 4 (core feature) | 3 (wow factor) | 75% | 2 sem | 450 | CRÍTICA |
| 5 - Infraestructura | 1 (backend) | 3 (propiedad) | 90% | 2 sem | 270 | CRÍTICA |

### Orden de Ejecución Recomendado
1. **AHORA (Semana 1):** Épicas 1, 5a (setup infraestructura)
2. **SEMANA 2:** Épicas 2, 3 (paralelo), 5b (mejoras plataforma)
3. **SEMANA 3:** Épicas 3b (integración bot genérico), 4a (diseño callbots)
4. **SEMANA 4:** Épicas 4b (implementación callbots), 5c (consolidación infraestructura), QA integral

---

## FASE 4: SECUENCIA ROADMAP

### Semana 1 — 26–30 de Mayo (Arranque)
**Objetivo:** Setup técnico + quick win inicial

**Tareas Críticas:**
- [1] Activar chatbot actual con número actualizado ✓
- [2a] Obtener acceso a UChat + auditar bot ✓
- [5a] Crear repositorio GitHub + configurar Render ✓

**Dependencias Resueltas:** Nada bloquea Semana 2

**Entregables Verificables:**
- Bot en producción
- Documentación de auditoría UChat
- Infraestructura de Datadicoco lista

---

### Semana 2 — 2–6 de Junio (Ejecución Paralela)
**Objetivo:** Dos vías simultáneas (migración + diseño nuevo)

**Tarefas Críticas:**
- [2b] Migrar bot UChat a plataforma propia ✓
- [3a] Datadicoco prepara flujo bot genérico ✓
- [4a] Diseño arquitectura callbots + transcripciones ✓
- [5b] Mejoras plataforma: UX, permisos, rendimiento ✓

**Paralelismo Estratégico:**
- Luiz: migración bot UChat
- Daniel + equipo: diseño flujo genérico
- Rafa + Luiz: arquitectura callbots

**Entregables Verificables:**
- Bot UChat replicado con testing completo
- Especificación de flujo genérico documentada
- Diagrama de arquitectura callbots

---

### Semana 3 — 9–13 de Junio (Integración)
**Objetivo:** Unir todos los threads

**Tarefas Críticas:**
- [3b] Conectar bot genérico a plataforma ✓
- [4b] Implementar sección callbots en dashboard ✓
- [5b] Continuación mejoras plataforma ✓

**Integración:**
- Bot genérico se conecta como tercer bot de prueba
- Dashboard muestra 3 bots + transcripciones
- UX refinada para la demo

**Entregables Verificables:**
- Panel unificado con 3 bots
- Historial de llamadas + transcripciones
- UI/UX lista para presentación

---

### Semana 4 — 16–20 de Junio (Demo + Consolidación)
**Objetivo:** QA, demo al cliente, consolidación final

**Tarefas Críticas:**
- [✓] QA integral: testing end-to-end de 4 bots
- [✓] Demo interna y presentación al cliente
- [5c] Plataforma 100% en servidor Datadicoco ✓

**Flujo de QA:**
1. Cada bot probado en aislamiento
2. Panel unificado probado con todos los bots
3. Transcripciones verificadas
4. Performance y seguridad auditados

**Entregables Verificables:**
- Reporte de QA completo
- Demo exitosa con cliente
- Código en infraestructura Datadicoco
- Acceso a plataforma original cortado

---

## FASE 5: COMUNICACIÓN AL CLIENTE

### Narrative Estratégica
"En 4 semanas, Datadicoco tendrá una plataforma unificada que consolida 4 chatbots en un panel centralizado con transcripciones de llamadas. Esto elimina la fragmentación, proporciona visibilidad total y posiciona a la empresa para escalar sin depender de proveedores externos."

### Mapa de Dependencias
```
Semana 1: [1] Bot Actual ────→ [2a] Auditoría UChat
          [5a] Infraestructura ────→ [5b] Mejoras
                                    ↓
Semana 2: [2b] Migración UChat  |  [3a] Bot Genérico  |  [4a] Diseño Callbots
                                    ↓
Semana 3: [3b] Integración Bot  |  [4b] Implementación Callbots
                                    ↓
Semana 4: [✓] QA Integral + Demo  |  [5c] Infraestructura Final
```

### Riesgos Identificados
1. **Acceso a UChat retrasado** → Mitiga: [2a] en Semana 1, contingencia: análisis estático
2. **Scope creep en diseño genérico** → Mitiga: Daniel define spec clara en Semana 1
3. **Performance en callbots** → Mitiga: POC temprano en Semana 2

### Puntos Abiertos (A Confirmar)
- **Email automático:** ¿Entra en Semana 1 o se pospone? (Confirmar con Daniel)
- **Facturación:** €500 plataforma Semana 1 + €90/mes mantenimiento (A partir entrega)

---

## MÉTRICAS DE ÉXITO (EOD Semana 4)

| Métrica | Target |
|---------|--------|
| Bots activos en plataforma | 4 |
| Transcripciones centralizadas | 100% de llamadas |
| QA Pass Rate | ≥95% |
| Demo al cliente | Completada con feedback |
| Infraestructura | 100% Datadicoco |
| Documentación | Técnica + usuario completa |

---

**Documento preparado por:** IA Operators (Luiz)  
**Fecha:** 25 de Mayo, 2026  
**Estado:** Listo para ejecución
