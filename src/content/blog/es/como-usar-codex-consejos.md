---
title: "Cómo usar Codex: 15 consejos para resultados reales"
description: "Aprende cómo usar Codex de OpenAI con 15 consejos prácticos para programar, automatizar tareas, trabajar con archivos y ejecutar con seguridad."
category: tools
articleSection: "Herramientas de IA"
date: 2026-08-05T19:18:00+02:00
image: https://scribos.s3.us-east-1.amazonaws.com/workspaces/2/articles/7/cover/1785958349-938e0c31c666.png
cover: https://scribos.s3.us-east-1.amazonaws.com/workspaces/2/articles/7/cover/1785958349-938e0c31c666.png
imageSchema:
  - https://scribos.s3.us-east-1.amazonaws.com/workspaces/2/articles/7/cover/1785958349-938e0c31c666.png
imageAlt: "Desarrollador revisando los cambios propuestos por Codex antes de aprobarlos"
optimizeImage: true
ogImage: /og/es/como-usar-codex-consejos.png
ogImageWidth: 1200
ogImageHeight: 630
about:
  - type: SoftwareApplication
    name: Codex
  - type: Organization
    name: OpenAI
  - type: Thing
    name: Agentes de programación
tags:
  - cómo usar Codex
  - Codex de OpenAI
  - consejos para usar Codex
  - cómo funciona Codex
  - automatizar tareas con Codex
  - agentes de programación
  - Codex Computer Use
  - Skills de Codex
  - Goal mode de Codex
  - vibe coding
locale: es
related:
  - 9-herramientas-inteligencia-artificial-desarrollo
  - aprender-a-programar-en-la-era-de-la-ia
  - fin-desarrollo-software-ia
translationKey: como-usar-codex
author: "Luiz Fernando Brazão"
authorTitle: "Fundador de IA Operators"
authorUrl: "https://iaoperators.com/es/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
authorBio: "Luiz Fernando Brazão es fundador de IA Operators y trabaja con arquitectura de agentes, automatización empresarial, integración de sistemas e implementación de inteligencia artificial en producción."
faqSchema: true
draft: false
ctaTitle: "¿Quieres implementar agentes de IA sin perder control sobre datos, permisos y resultados?"
ctaText: "Analizamos tus procesos, sistemas y riesgos, diseñamos el flujo y construimos la automatización dentro de tu entorno actual."
ctaPrimaryLabel: "Solicitar una auditoría de automatización"
ctaPrimaryHref: "/es/auditoria-de-sistemas/"
faq:
  - q: "¿Qué es Codex de OpenAI?"
    a: "Codex es el agente de OpenAI especializado en programación y trabajo técnico. Puede escribir y depurar código, ejecutar comandos y pruebas, revisar modificaciones, trabajar con repositorios y utilizar herramientas adicionales según el entorno y los permisos disponibles."
  - q: "¿Cuál es la diferencia entre Codex y ChatGPT Work?"
    a: "Codex está orientado principalmente al desarrollo de software, terminal, repositorios y tareas técnicas. ChatGPT Work está diseñado para investigaciones, análisis y creación de entregables como documentos, hojas de cálculo, presentaciones, informes y Sites."
  - q: "¿Qué modelo debería utilizar en Codex?"
    a: "Sol es la mejor opción para problemas complejos o ambiguos. Terra funciona bien para trabajo cotidiano que requiere razonamiento y herramientas. Luna es apropiado para tareas claras, repetibles y de alto volumen. Cuando no sabes cuál elegir, OpenAI recomienda empezar con Sol."
  - q: "¿Codex puede controlar mi ordenador?"
    a: "En entornos compatibles y con los permisos correspondientes, Codex puede utilizar Computer Use para observar y operar aplicaciones. Debes limitar el acceso, exigir confirmación para acciones sensibles y evitar conceder permisos innecesarios."
  - q: "¿Qué es Goal mode en Codex?"
    a: "Goal mode permite definir un objetivo duradero y criterios de éxito para trabajos que necesitan múltiples iteraciones. Funciona mejor cuando la meta puede medirse mediante pruebas, métricas, estados o entregables verificables."
  - q: "¿Cómo evitar que Codex borre archivos o realice acciones incorrectas?"
    a: "Limita el acceso a carpetas concretas, pide una vista previa antes de acciones destructivas, utiliza copias de seguridad o control de versiones y exige una confirmación explícita antes de borrar, publicar, desplegar o sobrescribir información."
  - q: "¿Codex puede trabajar mientras no estoy delante del ordenador?"
    a: "Codex puede ejecutar automatizaciones y determinados trabajos de larga duración. El funcionamiento exacto depende de si la tarea es local, remota o cloud. En el acceso remoto a una sesión local, el ordenador host debe permanecer encendido, conectado y con Codex funcionando."
  - q: "¿Codex sirve solamente para programadores?"
    a: "Codex continúa especializado en software y trabajo técnico, pero puede utilizar código, Skills, plugins y Computer Use para completar tareas en otras áreas. Para entregables generales sin un componente técnico importante, ChatGPT Work suele ser una alternativa más directa."
---

¿Te pasa que pides algo a una inteligencia artificial, recibes una respuesta aparentemente correcta, pero el trabajo real sigue sin hacerse?

Codex cambia esa dinámica. En lugar de limitarse a sugerir código o explicar lo que deberías hacer, puede trabajar sobre un proyecto, modificar archivos, ejecutar comandos, comprobar resultados y entregarte cambios que puedes revisar.

Pero aprender **cómo usar Codex** no consiste simplemente en escribir prompts más largos. La diferencia entre una demostración sorprendente y un resultado útil está en cómo defines la tarea, qué contexto proporcionas, qué permisos concedes y cómo compruebas el resultado.

En esta guía encontrarás 15 consejos prácticos para pasar del *vibe coding* —pedir cambios de manera intuitiva y esperar que funcionen— a una forma de trabajo más controlada, verificable y segura.

> **Nota de actualización — agosto de 2026:** las funciones disponibles pueden variar según el plan, el sistema operativo, la región, los permisos del espacio de trabajo y la versión de la aplicación.

## En esta guía

- [Qué es Codex y para qué sirve](#qué-es-codex-y-para-qué-sirve)
- [Antes de empezar: elige dónde usar Codex](#antes-de-empezar-elige-dónde-usar-codex)
- [Cómo empezar con Codex en 5 minutos](#cómo-empezar-con-codex-en-5-minutos)
- [Los 15 consejos](#cómo-usar-codex-para-ejecutar-trabajo-real)
- [Ejemplo práctico](#ejemplo-práctico)
- [Seguridad](#seguridad-las-reglas-que-deberían-acompañar-a-todos-tus-prompts)
- [Errores frecuentes](#errores-frecuentes-al-usar-codex)
- [Plantilla de prompt](#plantilla-de-prompt-para-usar-codex)
- [Checklist](#checklist-para-empezar-hoy)
- [Preguntas frecuentes](#preguntas-frecuentes)
- [Fuentes oficiales](#fuentes-oficiales)

## Qué es Codex y para qué sirve

Codex es el agente de OpenAI especializado en desarrollo de software y trabajo técnico. Puede escribir y depurar código, ejecutar pruebas y comandos, revisar cambios, trabajar con repositorios y operar sobre carpetas locales cuando le concedes permiso.

OpenAI [diferencia actualmente tres experiencias principales](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex):

- **Chat:** para preguntas, búsquedas, ideas y asistencia conversacional.
- **Work:** para investigaciones, análisis y creación de entregables como documentos, hojas de cálculo, presentaciones, informes o Sites.
- **Codex:** para programación, terminal, repositorios, pruebas, cambios técnicos y automatizaciones relacionadas con proyectos.

Codex nació como un agente de programación, pero sus capacidades se han ampliado. En la aplicación de escritorio puede utilizar Skills, plugins, navegador, Computer Use, voz y otras herramientas para trabajar con aplicaciones y completar flujos que van más allá de escribir código. Aun así, para producir un informe, una presentación o una hoja de cálculo sin un componente técnico relevante, ChatGPT Work suele ser la experiencia más natural.

Si vienes de la pregunta más general —[qué son los agentes de IA](/es/blog/que-son-los-agentes-de-ia/) y en qué se diferencian de un chatbot—, Codex es exactamente eso aplicado al trabajo técnico: un sistema que recibe un objetivo, decide los pasos y actúa sobre tus herramientas.

## Antes de empezar: elige dónde usar Codex

Codex puede utilizarse desde diferentes superficies:

- [Aplicación de escritorio de ChatGPT para macOS o Windows](https://openai.com/index/introducing-the-codex-app/).
- Extensión para entornos de desarrollo.
- Codex CLI desde el terminal.
- Entornos cloud compatibles.
- Acceso remoto a determinadas sesiones desde la aplicación móvil.

La mejor opción depende del trabajo. Usa la **aplicación de escritorio** cuando necesites combinar código, archivos locales, terminal, navegador y aplicaciones. Utiliza la **extensión del IDE** cuando quieras revisar cambios dentro de tu editor. Elige la **CLI** si prefieres trabajar desde el terminal o integrar Codex en un flujo técnico existente.

## Cómo empezar con Codex en 5 minutos

Si todavía no has usado Codex, este es el camino más corto para tener un primer resultado revisable:

1. **Abre Codex en el entorno que tengas disponible:** aplicación de escritorio, extensión del IDE, CLI o cloud.
2. **Selecciona una carpeta o conecta el repositorio** sobre el que vas a trabajar, y solo ese.
3. **Explica el contexto del proyecto y la fuente de verdad:** qué hace, qué archivo manda cuando hay contradicciones y qué documentación está vigente.
4. **Envía una primera tarea pequeña y verificable**, con una condición de éxito que puedas comprobar.
5. **Revisa el plan, el diff y las pruebas antes de aprobar** cualquier cambio.

Un primer prompt que funciona bien:

> Estamos trabajando en una aplicación React y Node.js. Corrige el error que permite crear dos reservas cuando el usuario hace doble clic. No cambies el diseño ni el esquema de la base de datos. Primero analiza la causa y presenta un plan. No modifiques nada hasta que yo apruebe el plan.

Elige una primera tarea pequeña, reversible y objetivamente verificable: así puedes comprobar el resultado en minutos y, si sale mal, deshacerlo sin consecuencias.

Con esta distinción clara, vamos a los 15 consejos.

## Cómo usar Codex para ejecutar trabajo real

### 1. Decide primero si la tarea pertenece a Codex o a Work

Uno de los errores más frecuentes es utilizar Codex para cualquier tarea relacionada con inteligencia artificial.

Codex es especialmente fuerte cuando el resultado exige una acción técnica:

- modificar un repositorio;
- crear o corregir una funcionalidad;
- ejecutar pruebas;
- analizar logs;
- migrar código;
- configurar una integración;
- trabajar con archivos y herramientas de desarrollo;
- automatizar un proceso mediante scripts.

En cambio, si quieres investigar cámaras y recibir una hoja de cálculo comparativa, preparar una presentación comercial o transformar varios documentos en un informe, probablemente deberías empezar en ChatGPT Work.

Regla práctica:

- Si el resultado principal es **código, una configuración técnica o una acción sobre un sistema**, utiliza Codex.
- Si el resultado principal es **un documento, análisis, hoja de cálculo, presentación o informe**, empieza en Work.
- Si solo necesitas **entender algo o explorar una idea**, utiliza Chat.

Elegir bien la superficie reduce consumo, errores y cambios de contexto.

### 2. Define un entregable, no una intención vaga

Una instrucción como esta deja demasiado espacio para interpretar:

> Mejora esta aplicación.

Codex no sabe si "mejorar" significa hacerla más rápida, cambiar el diseño, eliminar errores o reescribir su arquitectura.

Una instrucción ejecutable debería contener cuatro elementos:

1. **Contexto:** qué proyecto es y cuál es su estado.
2. **Objetivo:** qué resultado quieres obtener.
3. **Restricciones:** qué no debe cambiar.
4. **Definición de éxito:** cómo se comprobará el resultado.

Por ejemplo:

> Esta aplicación React permite reservar citas. Corrige el problema que duplica reservas cuando el usuario hace doble clic. No cambies el diseño ni la estructura de la base de datos. Considera completada la tarea cuando exista una protección contra doble envío y las pruebas correspondientes pasen correctamente.

Ahora Codex tiene un problema delimitado y una condición de victoria. Cuanto más verificable sea el resultado, menos dependerás de interpretar si "parece que funciona".

### 3. Proporciona el contexto correcto y declara la fuente de verdad

Codex puede analizar carpetas, repositorios, documentación y archivos relacionados con un proyecto. Pero tener acceso a más información no significa comprender automáticamente cuál es la correcta.

Explícale:

- qué carpeta contiene el proyecto activo;
- qué rama debe utilizar;
- dónde están los requisitos;
- qué archivo contiene las reglas del negocio;
- qué documentación está actualizada;
- qué archivos son históricos o están obsoletos;
- qué servicios externos intervienen.

Un buen prompt podría decir:

> Usa `/docs/booking-rules.md` como fuente de verdad para las reglas de reserva. El archivo `/docs/old-flow.md` es histórico y no debe influir en la solución. Antes de modificar el código, indica cualquier contradicción que encuentres entre los requisitos y la implementación actual.

Esto evita que el agente intente reconciliar silenciosamente documentos incompatibles.

En proyectos grandes, también conviene mantener un archivo permanente con arquitectura, convenciones, comandos de desarrollo, criterios de calidad, reglas de seguridad y definición de terminado. No obligues al agente a reconstruir el proyecto desde cero en cada conversación.

### 4. Pide un plan antes de permitir cambios importantes

Para una corrección pequeña, Codex puede actuar directamente. Para migraciones, refactors, cambios de infraestructura o tareas que afectan varias partes del sistema, pide primero un plan.

Utiliza una instrucción como:

> Analiza el problema y presenta un plan de ejecución. Incluye archivos afectados, riesgos, dependencias, estrategia de rollback y forma de validar el resultado. No modifiques nada todavía.

Revisa especialmente:

- si el orden de ejecución tiene sentido;
- si el agente ha identificado dependencias ocultas;
- si existe una forma objetiva de validar;
- si propone copias o puntos de restauración;
- si el cambio afecta más componentes de los necesarios.

Pedir un plan no significa introducir burocracia en todas las tareas. Significa aumentar el nivel de supervisión cuando el coste de equivocarse es elevado.

### 5. Permite la navegación solo cuando aporta información necesaria

Navegar puede ser útil para consultar documentación actualizada, cambios recientes de una API, versiones de librerías, especificaciones técnicas, incidencias conocidas o precios y límites vigentes.

Pero abrir el navegador para todo añade tiempo, consumo y riesgo de utilizar fuentes de mala calidad. Puedes establecer esta regla:

> Utiliza primero los archivos y la documentación incluidos en el proyecto. Navega solamente si falta información que pueda haber cambiado o si necesitas consultar la documentación oficial. Si navegas, indica qué buscas, por qué es necesario y qué fuentes utilizaste.

También puedes limitar las fuentes:

> Para esta integración, utiliza únicamente la documentación oficial del proveedor. No bases la implementación en tutoriales, foros o respuestas antiguas sin verificar.

La navegación no debe sustituir el razonamiento sobre el contexto que ya proporcionaste.

### 6. Utiliza Computer Use con permisos mínimos

Codex puede operar aplicaciones mediante [Computer Use](https://openai.com/index/codex-for-almost-everything/): observar interfaces, hacer clic, escribir y trabajar con herramientas que no ofrecen una API adecuada.

Esto puede ser útil para probar una interfaz, realizar acciones en una aplicación interna, comprobar un proceso de registro, comparar el comportamiento visual antes y después de un cambio, trabajar con sistemas heredados o automatizar tareas en herramientas sin integración.

Pero controlar una interfaz también introduce riesgos. Una identificación incorrecta de un botón, una ventana inesperada o un cambio de diseño pueden provocar acciones no deseadas.

Define límites explícitos:

> Puedes utilizar el navegador y la aplicación de pruebas. No accedas al gestor de contraseñas, a la facturación ni a cuentas personales. No confirmes compras, publicaciones, envíos o eliminaciones sin mi autorización.

Para trabajar con archivos:

> Trabaja únicamente dentro de la carpeta `/proyecto-demo`. No muevas, renombres ni elimines archivos fuera de ella. Antes de borrar cualquier archivo, muestra una vista previa y espera confirmación.

OpenAI describe Computer Use como una capacidad para trabajar con aplicaciones mediante su propio cursor. Esa libertad debe ir acompañada de permisos acotados y supervisión proporcional al riesgo.

### 7. Revisa cambios, ejecuta pruebas y exige evidencia

Una respuesta convincente no demuestra que el trabajo esté bien hecho.

Cuando Codex modifique un proyecto, pídele que entregue resumen de los cambios, lista de archivos modificados, diff relevante, pruebas ejecutadas, resultados de las pruebas, errores pendientes, decisiones o supuestos e instrucciones para reproducir la validación.

Por ejemplo:

> Al terminar, entrega un resumen de máximo diez puntos, enumera los archivos modificados, ejecuta las pruebas relevantes y explica cómo puedo reproducir el resultado localmente.

Para un problema de rendimiento:

> Reduce el LCP móvil de 4,0 segundos a un máximo de 2,5 segundos. Mide antes y después en las mismas condiciones y adjunta los resultados de Lighthouse.

Aquí importa una corrección conceptual: mejorar el LCP significa **reducir** el tiempo, no aumentarlo.

Para código, las mejores evidencias suelen ser pruebas automatizadas, compilación correcta, linters, type checks, benchmarks, capturas, logs y comparación antes/después.

Sin evidencia, sigues dependiendo de la confianza. Con evidencia, puedes revisar.

### 8. Usa la voz para coordinar, no para definir detalles críticos

ChatGPT Voice permite hablar con Work y Codex en la aplicación de escritorio compatible. Puedes iniciar tareas, preguntar por el progreso, interrumpir y coordinar trabajo mediante conversación.

La voz es especialmente útil para explicar rápidamente el contexto, capturar una idea mientras revisas algo, pedir un diagnóstico inicial, preguntar qué está bloqueando una tarea, coordinar varios hilos o solicitar un resumen del progreso.

Sin embargo, los detalles sensibles deberían confirmarse por escrito: rutas, nombres de variables, cantidades, dominios, comandos, condiciones de aceptación, exclusiones, credenciales y acciones destructivas.

Una buena dinámica es: **usa la voz para preparar y dirigir; usa el texto para autorizar y finalizar.** Así aprovechas la velocidad de hablar sin perder precisión en las decisiones críticas.

### 9. Elige entre Sol, Terra y Luna según la tarea

Codex ofrece actualmente [tres modelos principales de la familia GPT-5.6](https://help.openai.com/en/articles/20001325-a-preview-of-gpt-56-sol-terra-and-luna):

- **Sol:** para trabajo complejo, ambiguo o de alto valor.
- **Terra:** para tareas cotidianas que requieren buen razonamiento y uso de herramientas.
- **Luna:** para trabajo claro, repetible, estructurado o de alto volumen.

La recomendación oficial es empezar con Sol cuando no sabes qué modelo elegir. La configuración Power utiliza Sol con razonamiento medio. Pero eso no significa utilizar siempre la máxima capacidad.

**Cuándo usar Sol:** arquitectura compleja, errores difíciles de reproducir, migraciones, investigación técnica profunda, cambios con múltiples dependencias, decisiones con trade-offs importantes.

**Cuándo usar Terra:** funcionalidades bien especificadas, refactors moderados, análisis de código, pruebas, documentación técnica, automatizaciones de complejidad media.

**Cuándo usar Luna:** clasificación, extracción, transformaciones repetitivas, cambios mecánicos, resúmenes estructurados, tareas de gran volumen con formato estable.

Utiliza el menor nivel de razonamiento que produzca un resultado fiable. Más razonamiento puede mejorar tareas difíciles, pero también implica mayor consumo y latencia.

### 10. Convierte los procesos repetitivos en Skills

Las [Skills](https://help.openai.com/en/articles/20001066-skills-in-chatgpt) son flujos reutilizables que enseñan a ChatGPT o Codex a realizar una tarea de manera consistente. Una Skill puede contener instrucciones, ejemplos, scripts, plantillas, criterios de calidad, recursos de referencia y una secuencia fija de pasos.

Después de instalarla, el sistema puede seleccionarla automáticamente cuando sea relevante o puedes pedir explícitamente que la utilice.

Ejemplos de Skills útiles:

- revisar un pull request con el estándar de tu empresa;
- preparar una release;
- comprobar accesibilidad;
- convertir una reunión técnica en tareas;
- revisar una integración de [n8n](/es/blog/n8n-vs-zapier-vs-make-empresas/);
- generar documentación siguiendo una plantilla;
- analizar logs de producción;
- crear una landing page con tu sistema visual.

No conviertas cualquier prompt en una Skill. Crea una cuando repites el flujo con frecuencia, existe un estándar reconocible, varias personas deberían obtener resultados consistentes o los errores por omitir un paso tienen un coste relevante.

Una Skill bien diseñada convierte experiencia tácita en un proceso reutilizable.

### 11. Usa plugins e integraciones antes de automatizar la interfaz

Antes de pedirle a Codex que abra una aplicación y haga clic repetidamente, comprueba si existe un plugin, una integración oficial, una API, un servidor MCP, una Skill específica o una herramienta de línea de comandos.

Los [plugins pueden agrupar Skills, aplicaciones, plantillas e integraciones](https://help.openai.com/en/articles/20001256) para que Codex obtenga contexto y realice acciones dentro de herramientas compatibles. OpenAI ha ampliado el catálogo de plugins disponibles para trabajar con servicios de desarrollo y productividad.

Orden recomendado:

1. API o integración oficial.
2. Plugin o servidor MCP confiable.
3. CLI.
4. Computer Use como alternativa.

Las integraciones estructuradas suelen ser más fiables que automatizar una interfaz visual, especialmente cuando el proceso se ejecutará muchas veces. Es el mismo criterio que aplicamos al elegir entre [herramientas de automatización](/es/blog/n8n-vs-zapier-vs-make-empresas/): lo que se ejecuta mil veces necesita un contrato estable, no una pantalla que puede cambiar.

Cuando no exista una integración adecuada, utiliza Computer Use con validaciones intermedias y confirmación antes de acciones irreversibles.

### 12. Programa automatizaciones que entreguen resultados auditables

Codex puede [ejecutar trabajo recurrente mediante Automations](https://openai.com/codex/): revisar issues sin clasificar, analizar errores de CI, preparar un resumen de pull requests, comprobar documentación desactualizada, revisar dependencias, analizar logs, continuar una tarea de larga duración o hacer seguimiento de conversaciones relacionadas con un proyecto.

Las automatizaciones pueden reutilizar hilos existentes, mantener contexto y retomar trabajo a lo largo del tiempo.

No programes solamente una acción. Define también qué debe entregar:

> Cada mañana revisa los errores de producción de las últimas 24 horas. Agrúpalos por causa probable, indica frecuencia e impacto, enlaza la evidencia y propone una prioridad. No modifiques producción.

Incluye siempre alcance, frecuencia, límite de tiempo, fuentes, condiciones para detenerse, formato del resultado, acciones permitidas y acciones prohibidas.

Una automatización que ejecuta trabajo sin producir un registro verificable se convierte rápidamente en una caja negra.

### 13. Utiliza Goal mode para objetivos duraderos y verificables

[Goal mode](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex) está pensado para trabajos que no se resuelven con una única acción. Permite establecer un objetivo duradero y definir criterios de éxito para que Codex continúe avanzando sobre el resultado.

Es adecuado para metas como aumentar la cobertura de pruebas, reducir errores de compilación, completar una migración, mantener documentación sincronizada, mejorar progresivamente una métrica o cerrar una lista definida de incidencias.

El objetivo debe incluir una condición observable.

Mal objetivo:

> Haz que el proyecto sea mejor.

Objetivo útil:

> Reduce los errores de TypeScript del proyecto de 86 a cero sin desactivar reglas ni utilizar `any` como solución general. Ejecuta el type check después de cada bloque de cambios y conserva un registro de los errores resueltos.

Otro ejemplo:

> Eleva la cobertura de pruebas de los módulos de facturación del 54 % al 80 %, priorizando caminos críticos. No escribas pruebas que solo aumenten cobertura sin validar comportamiento.

Goal mode no elimina la supervisión. Cuanto más tiempo pueda trabajar el agente, más importante es definir límites, checkpoints y criterios de aceptación.

### 14. Entiende la diferencia entre trabajo local, remoto y cloud

Esta distinción evita muchos problemas de permisos y expectativas, y depende de [qué cliente de Codex estés usando](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan).

**Trabajo local.** Codex accede a una carpeta o entorno de tu ordenador. Es útil cuando necesita archivos locales, herramientas instaladas, un entorno de desarrollo específico, servicios que solo funcionan en tu red o aplicaciones del escritorio. Concede acceso únicamente a las carpetas necesarias.

**Trabajo remoto.** Puedes acceder desde la aplicación móvil a determinadas sesiones de Codex que se ejecutan en un ordenador compatible. El equipo host debe permanecer encendido, conectado y con Codex funcionando para que el acceso remoto continúe. Es útil para revisar el progreso, responder preguntas, aprobar acciones o continuar una tarea iniciada en el ordenador. No equivale a ejecutar Codex completamente dentro del teléfono.

**Trabajo cloud.** En los flujos cloud, la tarea se ejecuta en un entorno gestionado y aislado. Este modelo es adecuado para trabajar sobre repositorios, ejecutar tareas en paralelo o delegar procesos que no dependen directamente de tu escritorio.

Antes de elegir, pregúntate:

- ¿Necesita archivos o programas de mi ordenador? **Local.**
- ¿Necesito supervisar desde otro dispositivo una sesión del ordenador? **Remoto.**
- ¿Puede ejecutarse en un entorno aislado conectado al repositorio? **Cloud.**

La ubicación de la ejecución determina a qué datos y herramientas puede acceder el agente.

### 15. Cierra cada tarea con un entregable, no con "ya está"

El último mensaje de Codex debería permitir que otra persona entienda qué ocurrió sin releer toda la conversación.

Pide siempre un cierre con objetivo inicial, estado final, archivos modificados, pruebas realizadas, evidencia, riesgos pendientes, decisiones tomadas, pasos para desplegar o continuar e instrucciones de rollback cuando corresponda.

Puedes utilizar este prompt:

> Cierra la tarea con un informe breve. Incluye qué cambiaste, qué no cambiaste, cómo validaste el resultado, riesgos pendientes y los pasos exactos para que otra persona pueda continuar.

Cuando el resultado deba compartirse de forma visual, también puedes utilizar [ChatGPT Sites](https://help.openai.com/en/articles/20001339-creating-and-managing-chatgpt-sites) para crear una página, aplicación ligera, panel o prototipo. Sites puede utilizarse desde Work en la web y desde Work o Codex en la aplicación de escritorio, cuando esté disponible para el plan, región y espacio de trabajo.

No publiques automáticamente un resultado sensible. Revisa archivos incluidos, datos personales, claves o secretos, permisos de acceso, visibilidad, dominio y versión desplegada.

Entregar no es simplemente terminar de ejecutar. Es dejar el resultado listo para revisión, aprobación o uso.

## Ejemplo práctico

> Este bloque es un **escenario demostrativo**, no un caso real de cliente. No incluye métricas, tiempos ni resultados medidos: sirve para mostrar cómo encajan las piezas anteriores en una sola tarea.

**Contexto.** Una aplicación de reservas en React y Node.js. Las reglas de negocio viven en `/docs/booking-rules.md`. Un usuario impaciente pulsa dos veces el botón de confirmar y se crean dos reservas.

**Tarea.** Corregir la duplicación sin tocar el esquema de base de datos ni el diseño.

**Prompt.**

> Usa `/docs/booking-rules.md` como fuente de verdad. Corrige el problema que permite crear dos reservas cuando el usuario pulsa dos veces el botón de confirmación. Puedes modificar el frontend, la API y las pruebas relacionadas; no cambies el esquema de la base de datos ni el diseño visual. Antes de editar, presenta un plan con la causa probable, los archivos afectados y la estrategia de validación.

**Alcance esperado.** El componente del botón de confirmación, el handler de creación de reservas en la API y las pruebas asociadas.

**Validación.** Protección en frontend y backend, pruebas en verde y una comprobación explícita: dos solicitudes con el mismo identificador de idempotencia no deben generar una segunda reserva.

**Límite que conviene anticipar.** Bloquear el botón en el frontend parece suficiente hasta que llega una petición repetida desde otro cliente. La protección que cuenta es la del servidor; la del navegador solo mejora la experiencia.

## Seguridad: las reglas que deberían acompañar a todos tus prompts

Cuanto más capaz es un agente, mayor es el coste potencial de una instrucción ambigua. Estas reglas reducen la superficie de riesgo:

- **Permisos mínimos.** Trabaja únicamente dentro de la carpeta autorizada.
- **Vista previa antes de acciones destructivas.** Muestra qué archivos serían eliminados o sobrescritos. No ejecutes todavía.
- **Confirmación explícita.** No publiques, compres, envíes, elimines ni despliegues sin una confirmación escrita.
- **Límites de consumo.** Detente si superas el límite definido de tiempo, llamadas externas o coste.
- **Credenciales fuera del prompt.** No pegues contraseñas o tokens directamente en una conversación cuando exista un mecanismo de secretos, variables de entorno o credenciales administradas.
- **Registro de cambios.** Genera un log con fecha, acciones, archivos afectados y resultado.
- **Rollback.** Antes de modificar producción, explica cómo volver al estado anterior.

La seguridad no es una revisión que se añade al final. Forma parte de la definición inicial de la tarea.

## Errores frecuentes al usar Codex

**Pedir una solución sin definir éxito.** Si no puede medirse, el agente tendrá que interpretar cuándo terminar.

**Conceder acceso a todo el ordenador.** Un agente no necesita permiso global para modificar una carpeta de proyecto.

**Utilizar Computer Use cuando existe una API.** Automatizar clics suele ser más frágil que usar una integración estructurada.

**Elegir el modelo más potente para cualquier tarea.** La potencia innecesaria aumenta consumo y latencia sin garantizar una mejora proporcional.

**No revisar el diff.** Que las pruebas pasen no significa que el cambio sea correcto, mantenible o compatible con el negocio.

**Permitir navegación sin controlar las fuentes.** Una respuesta reciente no es necesariamente una respuesta confiable.

**Programar tareas sin pedir reportes.** Las automatizaciones deben producir evidencia y mantener trazabilidad.

**Confundir Codex con ChatGPT Work.** Ambas experiencias comparten capacidades, pero fueron diseñadas para resultados diferentes.

**Dar instrucciones contradictorias.** Si pides "actúa de forma autónoma" y también "consulta antes de tomar cualquier decisión", el agente no sabrá qué criterio priorizar.

**Considerar "funciona en mi máquina" como validación suficiente.** Define entornos, pruebas y condiciones reproducibles.

## Plantilla de prompt para usar Codex

Puedes reutilizar esta estructura:

- **Contexto.** Describe el proyecto, el estado actual y la fuente de verdad.
- **Objetivo.** Indica el resultado concreto que necesitas.
- **Alcance.** Explica qué archivos, sistemas o componentes puede modificar.
- **Exclusiones.** Aclara qué no debe tocar.
- **Restricciones.** Incluye seguridad, compatibilidad, costes y tecnologías permitidas.
- **Plan.** Indica si debe presentar un plan antes de ejecutar.
- **Validación.** Define pruebas, métricas o evidencias.
- **Entrega.** Especifica el formato del resultado final.

### Ejemplo completo

> Estamos trabajando en una aplicación React y Node.js para gestionar reservas. Las reglas actualizadas están en `/docs/booking-rules.md`.
>
> Corrige el problema que permite crear dos reservas cuando el usuario pulsa dos veces el botón de confirmación.
>
> Puedes modificar el frontend, la API y las pruebas relacionadas con la creación de reservas. No cambies el esquema de la base de datos ni el diseño visual.
>
> Antes de editar, presenta un plan breve con la causa probable, archivos afectados y estrategia de validación.
>
> Considera terminada la tarea cuando exista protección en frontend y backend, las pruebas pasen y una solicitud repetida con el mismo identificador no genere una segunda reserva.
>
> Al finalizar, entrega el resumen, los archivos modificados, las pruebas ejecutadas y cualquier riesgo pendiente.

## Checklist para empezar hoy

- Elige una tarea real y delimitada.
- Decide si corresponde a Chat, Work o Codex.
- Define el entregable.
- Indica la fuente de verdad.
- Limita los permisos.
- Pide un plan cuando el riesgo sea relevante.
- Define cómo comprobar el resultado.
- Selecciona el modelo adecuado.
- Revisa cambios y evidencia.
- Documenta el cierre.

No necesitas empezar con una migración completa ni con una automatización que controle toda tu empresa. Empieza con una tarea que actualmente te quite entre 30 y 60 minutos, tenga un resultado verificable y pueda ejecutarse dentro de un entorno controlado.

## Conclusión

Aprender cómo usar Codex no consiste en encontrar una frase mágica.

Consiste en pasar de instrucciones vagas a objetivos comprobables; de permisos globales a accesos mínimos; de aceptar respuestas a revisar evidencias; y de utilizar inteligencia artificial como asistente a dirigirla como un operador técnico.

El *vibe coding* puede ser útil para explorar ideas y crear prototipos. Pero cuando el resultado afecta clientes, datos, producción o dinero, necesitas algo más: contexto, límites, pruebas y trazabilidad.

Codex puede programar, ejecutar comandos, trabajar con repositorios, operar herramientas y mantener tareas a lo largo del tiempo. Tu ventaja no viene solamente de tener acceso al agente. Viene de saber diseñar el sistema de trabajo alrededor de él.

Empieza con un resultado pequeño. Define qué significa terminar. Permite únicamente lo necesario. Exige pruebas. Y solo entonces aumenta la autonomía.

---

¿Quieres aplicar agentes de IA en procesos reales de tu empresa? En **IA Operators** analizamos procesos, herramientas, datos y riesgos antes de automatizar. Diseñamos sistemas que no solo responden: ejecutan, se integran con el entorno existente y producen resultados medibles. Empieza por una [auditoría de sistemas y automatización](/es/auditoria-de-sistemas/) o conoce nuestro servicio de [automatización con IA](/es/servicios/automatizacion-ia/).

## Fuentes oficiales

- [OpenAI — Codex in ChatGPT](https://openai.com/codex/)
- [OpenAI Help Center — ChatGPT Work and Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)
- [OpenAI Developers — Modelos recomendados para Codex](https://developers.openai.com/codex/models)
- [OpenAI Help Center — Skills in ChatGPT](https://help.openai.com/en/articles/20001066-skills-in-chatgpt)
- [OpenAI — Introducing the Codex app](https://openai.com/index/introducing-the-codex-app/)
- [OpenAI — Codex for (almost) everything](https://openai.com/index/codex-for-almost-everything/)
- [OpenAI Help Center — Creating and managing ChatGPT Sites](https://help.openai.com/en/articles/20001339-creating-and-managing-chatgpt-sites)
