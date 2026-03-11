---
title: "GEMS de Gemini: cómo crear asistentes con herramientas predeterminadas (Canvas, Deep Research, Nanobanana)"
description: "GEMS de Gemini: aprende a configurar asistentes con herramientas predeterminadas (Canvas, Deep Research, Nanobanana) para ahorrar tiempo, estandarizar procesos y trabajar en equipo sin repetir instrucciones."
category: tools
date: 2026-12-01
image: https://s3.eu-north-1.amazonaws.com/ia-operators/IA%20Operators%20Website/gems-de-gemini-como-crear-asistentes-con-herramientas-predeterminadas-canvas-deep-research-nanobanana.webp
locale: es
author: Luiz Brazão
draft: false
---

Hay una cosa que me fascina (y me da un poquito de rabia a la vez): lo mucho que nos acostumbramos a hacer tareas tontas “porque siempre se ha hecho así”. Abrir un asistente y tener que decirle *cada vez* “oye, busca en internet”, “oye, usa Canvas”, “oye, genera imágenes”… es como entrar a tu propia casa y pedir permiso para encender la luz.

La actualización brutal de Gemini con los GEMS viene a decirte: “Cristina, deja de mendigarle al robot”. Porque ahora puedes **configurar un asistente para que nazca ya con las herramientas correctas puestas**. Y no es un cambio pequeño: es el tipo de mejora que convierte a un “chat” en un compañero de trabajo con criterio… o al menos con instrucciones claras.

## El problema de antes (y por qué te estaba robando tiempo)

Hasta hace nada, abrir un GEM era como contratar a un becario brillantísimo… que cada mañana se olvida de lo que tiene que hacer. Tú entrabas, y tocaba repetir la cantinela:
“Busca en internet.”
- “Activa Canvas.”
- “Genera imágenes.”
- “Haz deep research.”

Y claro, si lo usas tú sola, pues vale: un poco pesado, pero lo soportas. El drama real llega cuando lo **compartes con tu equipo** o con un cliente. Porque cada persona lo usa distinto. Y el asistente deja de ser “un sistema” para ser una tómbola.

## La actualización: un GEM con herramientas predeterminadas (por fin)

Ahora, al crear un nuevo GEM, puedes **vincular herramientas del propio chatbot** y dejarlas activadas por defecto. Esto incluye, por ejemplo:
**Canvas** (para generar/editar/previsualizar código y textos)
- **Deep Research** (investigación profunda)
- **Nanobanana** (generación de imágenes/infografías)
- **Conexión dinámica con documentos** (Drive/Sheets/Docs “en vivo”)

Lo mejor: crear cada asistente puede llevarte **menos de 2 minutos**. Y sí, los GEMS siguen siendo una función **gratuita**.

## Ejemplo 1: Un GEM con Canvas que te construye componentes web/app alineados a tu marca

Este es de mis favoritos porque es el tipo de cosa que, si lo haces bien, te ahorra horas… y si lo haces mal, te deja una web Frankenstein.

### La idea

Crear un GEM que genere “assets” visuales para una web o app (sliders, carruseles, botones, tiles de blog…), pero con una condición no negociable: **que respete el 100% de la identidad de marca**.

### El truco que lo hace funcionar

Subes la documentación de marca como conocimiento: paleta cromática, tipografías, jerarquías de tamaño, reglas de uso. Y configuras el GEM para que su herramienta predeterminada sea **Canvas**, porque Canvas no es solo escribir bonito: también **genera, edita y previsualiza código**.

### Qué puede generar (ejemplos reales del vídeo)
**Slider horizontal controlado por scroll**: 4 diapositivas
- Imagen de fondo + texto centrado (título y subtítulo)
- Capa con color y opacidad para legibilidad sin cargarte la imagen
- Scroll invisible
- **Modo oscuro** generado automáticamente
**Carrusel de entradas de blog**: 3 columnas
- Imagen destacada
- Hover con aparición del título
- Versión clara/oscura coherente
**Botón con hover**: Animación ligera “hacia arriba”
- Intercambio de colores positivo/negativo
- En modo claro y oscuro se invierte con lógica (no al azar)

### Cómo se configura (estructura simple)
ElementoQué ponesPor qué importaNombre y descripciónAlgo específico (“Assets CSS para Lucit”)Evita que lo uses “para todo” y no sirva para nadaInstruccionesDetalladas: cómo debe pensar, qué priorizar, qué entregarLe marcas el estándar (accesibilidad, responsive, coherencia visual)ConocimientosMarkdown con tipografías, colores, reglas, ejemplosLa marca deja de ser “opinión” y pasa a ser sistemaHerramienta predeterminada**Canvas**Para que produzca código con preview y puedas descargarlo
## Ejemplo 2: Un GEM con Nanobanana que convierte transcripciones en apuntes + infografías

Este caso es oro puro si haces formación, contenido educativo o tienes una academia: metes una transcripción de un directo/vídeo y obtienes material didáctico listo.

### Entrada y salida
**Entrada**: transcripción (aunque sea caótica, con muletillas, interrupciones… vida real)
- **Salida**: texto lectivo (apuntes estructurados) + **infografías intercaladas** que ilustran lo que acabas de explicar

### El insight importante: alternar texto e imagen en la misma respuesta

No es “hazme 5 imágenes sueltas”. Es: **texto → infografía → texto → infografía**. Eso mantiene coherencia, ritmo y refuerza aprendizaje. En el ejemplo del vídeo, aparecen los “pilares de tu marca personal” (misión, visión, valores, propuesta de valor, tono de comunicación) y justo después una infografía con esos mismos elementos.

### Configuración mínima (y aquí viene lo bonito)

No hace falta montar una NASA. Este GEM puede funcionar sin conocimientos adicionales: solo con **una instrucción generosa** y la herramienta predeterminada en **Nanobanana**.

#### Extra potente: identidad visual persistente

Si cargas fotos de referencia en el conocimiento del GEM, puedes generar imágenes coherentes de una persona sin volver a pedir “te adjunto fotos” cada vez. Esto, para marcas personales, es una locura: consistencia visual y rapidez. Básicamente, el asistente ya “sabe quién eres”.

## Ejemplo 3: Un GEM con Deep Research para informes profundos con fuentes fijadas

Aquí entramos en modo “serio”: investigación de verdad, con corpus controlado. En lugar de que el asistente “busque por ahí”, tú le das una biblioteca cerrada y le dices: **investiga dentro de esto**.

### Qué se le carga

Documentos densos: informes de consultoras, el informe anual de IA de Stanford (centenares de páginas), papers sobre productividad, regulación europea (AI Act), PEW Research, World Economic Forum… Vamos, el tipo de lectura que dices “me lo leo el finde” y luego pasan tres meses.

### Qué consigue
Informes temáticos (ej.: impacto de la IA en educación)
- Un **plan de investigación** implícito (se nota que está tirando del material cargado)
- Documento exportable (en el ejemplo, un resultado de 11 páginas)

Y aquí está la clave estratégica: **fijas las fuentes**. Esto es control editorial. Control de calidad. Y sí: tranquilidad mental.

## Ejemplo 4: Un GEM conectado dinámicamente a Drive/Sheets con datos en vivo

Este es el típico “nadie habla de esto y luego te cambia el negocio”. Conectar un GEM a documentos de Google Drive (Sheets/Docs) para que consulte datos **cada vez que le preguntas**. No es un archivo subido una vez y olvidado: es una conexión dinámica.

### Demostración simple (pero demoledora)

GEM de una “tienda de bicicletas” conectado a una hoja con pedidos. Preguntas: “¿Cuánto se ha gastado Hugo López?”. Responde 30 €. Cambias la celda en el Sheet (actualizas unidades, total 75 €). Vuelves a preguntar. Responde 75 €.

Eso significa que el GEM puede ser:
un consultor de ventas que mira tu histórico
- un “asistente de operaciones” que revisa stock/precios
- un lector de documentos colaborativos (“¿qué actualizó el equipo hoy?”)

## Mi conclusión (de persona a persona): esto no va de “IA”, va de diseñar sistemas

El salto real no es “Gemini hace más cosas”. Es que ahora tú puedes crear asistentes que se comporten como deben desde el minuto uno. Con herramientas predeterminadas, conocimiento bien cargado y un objetivo claro, un GEM deja de ser un juguete y se convierte en un proceso repetible.

Y si te quedas con una sola idea, que sea esta: **un buen GEM no es el que responde bonito; es el que trabaja igual de bien cuando no estás tú para corregirlo**. Ahí empieza la magia. Y ahí, por fin, empieza la utilidad multiplicada.

También te puede interesar

        - [Revolución de herramientas de inteligencia artificial para simplificar tu vida](https://iaoperators.com/blog/revolucion-herramientas-inteligencia-artificial)

        - [Gemini 3 Flash: El modelo de inteligencia artificial rápido, eficiente y económico de Google](https://iaoperators.com/blog/gemini-3-flash-inteligencia-artificial-google)

        - [Notebook LM y Gemini: Revolucionando la creatividad y la productividad con IA](https://iaoperators.com/blog/notebook-lm-gemini-revolucion-creatividad-productividad-ia)
