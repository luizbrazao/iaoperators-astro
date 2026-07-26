---
title: "Auditoría anual de atención a la clientela: qué evidencias tendrás que presentar"
seoTitle: "Auditoría ENAC de atención al cliente: qué evidencias"
description: "La Ley 10/2025 obliga a una auditoría anual por entidad acreditada por ENAC. Qué evidencia hace falta por cada obligación y por qué no se improvisa en diciembre."
category: compliance
articleSection: "Cumplimiento normativo"
date: 2026-07-26T12:00:00+02:00
tags:
  - auditoría ENAC atención al cliente
  - Ley 10/2025
  - evidencias de cumplimiento
  - trazabilidad atención a la clientela
  - registro inmutable
  - cumplimiento normativo empresas
about:
  - type: Thing
    name: "Ley 10/2025 de servicios de atención a la clientela"
  - type: Organization
    name: "ENAC (Entidad Nacional de Acreditación)"
locale: es
translationKey: sac-auditoria-enac
author: "Luiz Fernando Brazão"
authorTitle: "Fundador de IA Operators"
authorUrl: "https://iaoperators.com/es/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
draft: false
faq:
  - q: "¿Quién puede auditar el servicio de atención a la clientela?"
    a: "La Ley 10/2025 exige una auditoría anual de calidad realizada por una entidad debidamente acreditada por ENAC, la Entidad Nacional de Acreditación. No es una autoevaluación ni un informe interno: lo firma un tercero acreditado."
  - q: "¿Sirve el registro de nuestro CRM como evidencia?"
    a: "Depende de si se puede demostrar que no ha sido alterado. Un CRM donde cualquier usuario con permisos puede editar una fecha o borrar un comentario aporta información, pero no prueba. La evidencia necesita registro append-only, sellado temporal y exportación en un formato que el auditor pueda revisar sin depender de vuestra interfaz."
  - q: "¿Se puede preparar la evidencia justo antes de la auditoría?"
    a: "No de forma honesta. La auditoría revisa un periodo completo, y los datos de ese periodo o se capturaron mientras ocurría o no existen. Reconstruir a posteriori tiempos de espera, fechas de resolución y trazas de escalado es imposible cuando el sistema nunca los guardó."
  - q: "¿Qué pasa si no superamos la auditoría?"
    a: "El régimen sancionador se remite a la normativa de defensa de consumidores y usuarios y a la legislación autonómica aplicable, que es donde se determinan las consecuencias concretas. Ese análisis corresponde a tu asesoría jurídica; lo que sí es nuestro terreno es que el sistema llegue a la auditoría con la evidencia completa."
---

La conversación incómoda no ocurre el día de la auditoría. Ocurre tres semanas antes, cuando alguien pregunta de dónde se sacan los datos del primer trimestre y la respuesta es un silencio.

> **En 30 segundos:** la Ley 10/2025 obliga a someter el servicio de atención a la clientela a una auditoría anual de calidad realizada por una entidad acreditada por ENAC. Cada obligación de la norma se traduce en una evidencia concreta que hay que poder enseñar: series de tiempos, fechas selladas, trazas de escalado, registro no alterable. Ninguna de esas cosas se reconstruye a posteriori. O el sistema las capturó mientras ocurrían, o el periodo auditado no tiene defensa.

<nav aria-label="Tabla de contenidos">

**En este artículo**

1. [Qué significa "acreditada por ENAC"](#que-significa)
2. [La evidencia que pide cada obligación](#evidencia)
3. [Por qué un CRM no es una evidencia](#crm)
4. [El dossier que hay que tener montado](#dossier)
5. [Cuándo hay que empezar a capturar](#cuando)

</nav>

<h2 id="que-significa">Qué significa "acreditada por ENAC"</h2>

La [Ley 10/2025](https://www.boe.es/buscar/act.php?id=BOE-A-2025-26698) no se conforma con que la empresa declare que cumple. Exige una **auditoría anual de calidad** realizada por una entidad debidamente acreditada por [ENAC](https://www.enac.es/), la Entidad Nacional de Acreditación.

La diferencia con una autoevaluación es la que separa decir de demostrar. Un tercero acreditado no revisa vuestras intenciones ni vuestro manual de procedimientos: pide los datos del periodo y comprueba si sostienen lo que afirmáis. Los detalles del esquema de auditoría pueden concretarse en desarrollo normativo posterior, pero el principio operativo no va a cambiar: quien audita necesita evidencia, y la evidencia es un producto del sistema, no del departamento de calidad.

Esto tiene una consecuencia práctica que conviene asimilar antes de diseñar nada: **la evidencia no es un entregable del final del proyecto, es un requisito de la arquitectura**. Se decide al mismo tiempo que se decide cómo entra un ticket.

<h2 id="evidencia">La evidencia que pide cada obligación</h2>

Cada obligación de la norma se traduce en un artefacto concreto. Esta es la traducción que usamos en los proyectos:

| Obligación | Evidencia que hay que poder enseñar |
| --- | --- |
| 95 % de llamadas atendidas en menos de 3 minutos de media | Serie temporal de tiempos de espera con el cálculo de la media, exportable por el periodo que se pida |
| Atención personalizada bajo demanda | Registro de los traspasos de sistema automático a persona, con marca de cuándo se solicitó y cuándo se produjo |
| Resolución en 15 días hábiles | Fecha de entrada y de resolución selladas sobre el mismo identificador, con el cómputo en días hábiles |
| 2 horas en continuidad · 5 días en facturación | Clasificación del asunto en la entrada y cumplimiento medido por tipología, no en agregado |
| Clave identificativa | Traza de emisión, entrega a la clientela y consultas realizadas, por canal |
| Registro y trazabilidad | Log append-only con sellado temporal y prueba de no alteración |
| Disponibilidad 24/7/365 en servicios básicos | Acuse de recibo inmediato fuera de horario y registro de activación de guardia |

Fíjate en un patrón: casi todas las filas piden **dos marcas de tiempo y un identificador que las une**. Ese es, en realidad, el requisito técnico central de toda la ley. Si el sistema garantiza eso de forma fiable, el resto del dossier es organización.

El peso relativo de cada fila cambia por sector. En [transporte de viajeros](/es/cumplimiento/ley-atencion-al-cliente/transporte-viajeros/) la serie de tiempos de espera es la que se mira con lupa, porque los picos de incidencia distorsionan la media. En [servicios postales](/es/cumplimiento/ley-atencion-al-cliente/servicios-postales/) el punto débil suele ser la trazabilidad cuando la gestión pasa por delegaciones o franquicias.

<h2 id="crm">Por qué un CRM no es una evidencia</h2>

Casi todas las empresas con las que hablamos tienen la información. Lo que no tienen es la prueba.

La diferencia es la mutabilidad. En un CRM convencional, un usuario con permisos puede corregir una fecha, reabrir un ticket cerrado, editar un comentario o borrar un registro. Es una funcionalidad deseable para operar, y es exactamente lo que invalida ese mismo registro como evidencia ante un tercero: nada permite distinguir un dato original de uno corregido después de que el plazo venciera.

La solución no es prohibir la edición. Es separar dos cosas que suelen estar mezcladas:

- **El sistema de trabajo**, editable, donde el equipo gestiona. Debe seguir siendo cómodo.
- **El registro de evidencia**, append-only, donde cada cambio de estado se anota con sello temporal y nada se sobrescribe. Corregir no borra: añade una anotación de corrección con su propia marca de tiempo.

Ese segundo registro es barato de construir si se diseña desde el principio, y caro de retrofitear cuando ya hay dos años de operación encima.

<h2 id="dossier">El dossier que hay que tener montado</h2>

Llegado el momento, lo que se entrega no es una base de datos: es un paquete ordenado. Merece la pena diseñarlo antes, porque condiciona qué se guarda.

Un dossier defendible tiene cuatro piezas:

1. **Cuadro de mando por obligación**, con el indicador de cada una y su evolución en el periodo. No un informe genérico de atención al cliente: una vista organizada según la estructura de la norma, porque así es como la va a recorrer el auditor.
2. **Exportaciones de origen**, en formato abierto, que respalden cada número del cuadro de mando. El auditor tiene que poder recalcular.
3. **Documentación del método**: qué se mide, cómo se calcula la media, qué calendario de días hábiles se aplica, cómo se clasifican las tipologías. Una decisión razonable y documentada se defiende; una decisión sin criterio escrito, no.
4. **Registro de incidencias del propio sistema**: caídas, reprocesos, huecos de datos y qué se hizo. Ocultarlos es peor que declararlos —un hueco explicado es un incidente, un hueco silencioso es un problema de fiabilidad de todo el conjunto.

<h2 id="cuando">Cuándo hay que empezar a capturar</h2>

Aquí está la parte que descoloca a mucha gente. El plazo de adaptación termina el **28 de diciembre de 2026**, pero la auditoría revisa un periodo, y un periodo se compone de días que ya pasaron.

Dicho de otra forma: la fecha límite no marca cuándo hay que tener el sistema, marca cuándo hay que llevar tiempo capturando con él. Cada mes que pasa sin instrumentar es un mes que, cuando toque auditar, no tendrá datos.

Y hay una segunda razón para no apurar. Un proyecto de este tipo —capa omnicanal, motor de plazos, clave identificativa y registro auditable, integrado con el CRM y la telefonía que ya existen— lleva entre seis y diez semanas contando el diagnóstico. Empezar en noviembre no es empezar tarde: es no llegar.

---

**Antes de planificar nada, conviene saber dónde estás.** El [test de cumplimiento](/es/cumplimiento/ley-atencion-al-cliente/test/) evalúa tu situación obligación por obligación en dos minutos y te dice qué evidencia te falta hoy. Si prefieres el contexto completo primero, está en la [página sobre la Ley 10/2025](/es/cumplimiento/ley-atencion-al-cliente/).

*Información técnica sobre implementación de sistemas. No constituye asesoramiento jurídico: la interpretación del alcance de la norma y de su régimen sancionador corresponde a tu asesoría o despacho.*
