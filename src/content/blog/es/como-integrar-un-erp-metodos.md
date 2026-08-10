---
title: "Cómo integrar un ERP: los cuatro caminos y cuál te toca"
seoTitle: "Cómo integrar un ERP: los 4 métodos reales"
description: "API, eventos, base de datos o ficheros. Cuál aplica a tu ERP, qué cuesta cada uno y las cuatro decisiones que hay que cerrar antes de escribir código."
category: others
articleSection: "Integración de sistemas"
date: 2026-08-10T16:00:00+02:00
tags:
  - integración ERP
  - conectar ERP
  - integración de sistemas
  - API ERP
  - automatización de procesos
  - empresas medianas
about:
  - type: Thing
    name: "Integración de sistemas ERP"
locale: es
translationKey: como-integrar-un-erp
related:
  - auditoria-de-sistemas-tecnologicos
  - que-es-un-roadmap-tecnologico
  - n8n-vs-zapier-vs-make-empresas
author: "Luiz Fernando Brazão"
authorTitle: "Fundador de IA Operators"
authorUrl: "https://iaoperators.com/es/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
draft: false
ctaTitle: "¿Cuál de los cuatro caminos te toca a ti?"
ctaText: "En el diagnóstico lo comprobamos sobre tu ERP real: qué expone, qué límites tiene y qué flujos compensa conectar primero. Tres a cinco días, alcance y precio cerrados."
ctaPrimaryLabel: "Ver integración de ERP"
ctaPrimaryHref: "/es/integracion/erp/"
faq:
  - q: "¿Cuál es la mejor forma de integrar un ERP?"
    a: "Por orden de preferencia: API documentada, eventos o webhooks, lectura de la base de datos y, en último lugar, ficheros de intercambio. No es una cuestión de gusto: cada escalón hacia abajo añade latencia, fragilidad y trabajo de mantenimiento. Lo que decide no es cuál te gusta más, es cuál te permite tu ERP — y eso se comprueba mirando su documentación y sus límites, no preguntando al comercial."
  - q: "¿Se puede integrar un ERP sin API?"
    a: "Sí, y es más habitual de lo que parece. Las vías son leer la base de datos —preferiblemente una réplica—, detectar cambios con marca de tiempo o tabla de auditoría, o intercambiar ficheros en una carpeta acordada. Todas funcionan; todas son más frágiles que una API, porque dependen de detalles internos que el proveedor puede cambiar sin avisar. Lo que no se debe hacer casi nunca es escribir directamente en las tablas del ERP: eso salta sus validaciones y produce datos que la propia aplicación no sabe interpretar."
  - q: "¿Cuánto cuesta integrar un ERP?"
    a: "Depende mucho más del número de flujos y de la casuística del negocio que de la tecnología. Un flujo simple y bien definido —pedidos entrantes, por ejemplo— con un ERP que expone API se resuelve en semanas. Lo que dispara el coste son las excepciones: el cliente que factura a otra razón social, el descuento que se aplica a mano, el pedido que se parte en dos albaranes. Por eso el diagnóstico va antes del presupuesto y no al revés."
  - q: "¿Es mejor integrar o cambiar de ERP?"
    a: "Si el ERP cumple su función y el problema es que está aislado, integrar sale mucho más barato y no pone en riesgo la operación. Cambiar tiene sentido cuando el proveedor ha desaparecido, cuando la tecnología impide cumplir una obligación legal que no se puede resolver por fuera, o cuando mantenerlo ya cuesta más que rehacerlo. La mayoría de los casos reales son el primero, aunque la conversación empiece siempre por el segundo."
  - q: "¿Qué es un middleware o iPaaS y hace falta?"
    a: "Es una capa intermedia que orquesta las integraciones en lugar de que cada sistema hable directamente con los demás. Compensa a partir de tres o cuatro sistemas conectados, porque evita que el número de conexiones crezca de forma cuadrática, y porque centraliza reintentos, registro y transformaciones. Con dos sistemas suele ser sobreingeniería."
---

Casi todo lo que se escribe sobre integrar un ERP responde a «qué es» y «qué beneficios tiene». Este artículo asume que eso ya lo tienes claro y va a la pregunta siguiente: cómo se hace, cuál de los caminos te toca, y qué se rompe en cada uno.

> **En 30 segundos:** hay cuatro vías técnicas para conectar un ERP —API, eventos, base de datos y ficheros— y una quinta que es la que casi todo el mundo usa sin llamarla así: exportar a mano. El camino no lo eliges tú, lo determina lo que tu ERP expone. Lo que sí eliges, y es donde se decide si la integración aguanta, son cuatro cosas: quién manda en cada dato, cómo se evita duplicar al reintentar, cuánto retraso es aceptable y qué pasa cuando el otro lado no responde.

<nav aria-label="Tabla de contenidos">

**En este artículo**

1. [No integras «el ERP», integras flujos](#flujos)
2. [Los cuatro caminos, en orden de preferencia](#caminos)
3. [El quinto camino, que nadie llama integración](#quinto)
4. [Cómo saber cuál te toca](#cual)
5. [Las cuatro decisiones previas al código](#decisiones)
6. [Por qué una integración se cae seis meses después](#se-cae)
7. [Cuándo no integrar](#no-integrar)

</nav>

<h2 id="flujos">No integras «el ERP», integras flujos</h2>

El primer error es de encuadre. «Integrar el ERP con la web» no es un proyecto: es una categoría. Dentro caben cosas con dificultad, riesgo y valor muy distintos.

Cuando desglosas ese enunciado, aparecen normalmente entre tres y seis flujos concretos, cada uno con su dirección y su frecuencia:

| Flujo | Dirección | Frecuencia típica |
| --- | --- | --- |
| Pedido nuevo | Canal → ERP | Inmediata |
| Estado del pedido | ERP → canal | Minutos |
| Existencias | ERP → canales | Minutos u horas |
| Alta y cambios de cliente | Ambas | Inmediata |
| Facturas emitidas | ERP → contabilidad o cliente | Diaria |
| Cobros y conciliación | Banco → ERP | Diaria |

Esta tabla vale más que cualquier decisión técnica que venga después, por dos motivos. Primero, porque casi siempre resulta que uno o dos flujos concentran el 80 % del dolor, y esos son los que hay que hacer primero. Segundo, porque cada fila puede necesitar un camino distinto: nada obliga a que el stock y las facturas viajen por el mismo mecanismo.

Si al hacer este ejercicio no tienes claro qué sistemas hay ni cuáles se hablan, el paso previo no es técnico. Es una [auditoría de sistemas](/es/blog/auditoria-de-sistemas-tecnologicos/) que ponga la lista encima de la mesa.

<h2 id="caminos">Los cuatro caminos, en orden de preferencia</h2>

**1. API documentada.** El ERP expone operaciones sobre HTTP: crear pedido, consultar stock, listar facturas. Es el mejor escenario y por bastante margen: el proveedor mantiene un contrato explícito, las validaciones del ERP siguen aplicándose y una actualización rara vez rompe nada sin avisar.

Lo que hay que comprobar antes de darlo por bueno: si la API permite **escribir** o solo leer, cuál es su límite de llamadas por minuto, cómo pagina los listados grandes, y si expone los campos personalizados que tu empresa ha ido añadiendo. Es frecuente encontrar una API que cubre el 90 % del catálogo estándar y ninguno de los campos que de verdad usa tu operación.

**2. Eventos o webhooks.** El ERP avisa cuando algo cambia, en lugar de esperar a que preguntes. Reduce muchísimo el tráfico y la latencia, y es la diferencia entre enterarte en segundos o en la siguiente pasada.

El precio es que tienes que estar disponible siempre y tolerar que el mismo aviso llegue más de una vez —prácticamente ningún emisor garantiza entrega única—. En la práctica se combinan con la API: el evento te dice que algo pasó, la API te dice exactamente qué. Ese diseño, con sus colas y sus reintentos, es lo que cubrimos en [integraciones por API y webhooks](/es/integracion/api-y-webhooks/).

**3. Lectura de la base de datos.** Cuando no hay API, se leen las tablas. Funciona, y en ERPs antiguos es a menudo la única opción real.

Dos reglas que no conviene saltarse. La primera: **contra una réplica, nunca contra la base de producción**, porque una consulta pesada lanzada a las once de la mañana bloquea la facturación de la empresa. La segunda: **solo lectura**. Escribir directamente en las tablas de un ERP salta sus validaciones internas y genera registros que la propia aplicación no sabe interpretar; el problema aparece semanas después y es carísimo de localizar.

Para detectar qué ha cambiado hay tres niveles: marca de tiempo de modificación (lo más simple, pero se pierde los borrados), tabla de auditoría si el ERP la mantiene, o lectura del registro de transacciones de la base de datos, que es lo más completo y lo más invasivo.

**4. Ficheros de intercambio.** Una carpeta acordada, un formato acordado, una hora acordada. Suena antiguo porque lo es, y sigue moviendo una parte enorme de los datos entre empresas.

Es aceptable cuando la frecuencia diaria basta y ambos lados están de acuerdo en el contrato. Exige disciplina que a menudo se olvida: nombres de fichero con marca temporal, un fichero de control que confirme que la escritura terminó, gestión explícita de reprocesos y una política de qué se hace con lo que llega mal formado. Sin eso, el día que el fichero llega a medias nadie se entera hasta que los números no cuadran.

<h2 id="quinto">El quinto camino, que nadie llama integración</h2>

Y luego está lo que hace la mayoría de las empresas ahora mismo: alguien exporta un CSV del ERP cada mañana y lo sube a otro sitio.

Merece la pena decirlo claro: **eso también es una integración**. Tiene un origen, un destino, una transformación y una frecuencia. Lo único que la diferencia de las cuatro anteriores es que el ejecutor es una persona, y eso tiene tres consecuencias que rara vez se contabilizan.

No falla de forma visible: cuando alguien se equivoca de columna, el error entra en el sistema como si fuera un dato bueno. No escala: el día de más volumen es justo el día en el que nadie tiene tiempo de hacerlo. Y no está documentada: el conocimiento vive en la cabeza de quien la ejecuta, y desaparece con esa persona.

Cuando calculas el retorno de automatizar un flujo, el punto de comparación honesto no es cero. Es el coste de esa exportación manual, incluidos sus errores.

<h2 id="cual">Cómo saber cuál te toca</h2>

El orden de comprobación es corto y se puede hacer en una tarde:

1. **¿El ERP tiene API documentada y permite escribir?** Si sí, camino 1 para todo lo que cubra.
2. **¿Emite eventos o webhooks?** Si sí, se combina con el anterior para lo que necesite inmediatez.
3. **¿Podemos leer una réplica de su base de datos?** Si sí, camino 3 para lo que la API no cubra.
4. **¿Hay alguna vía acordada de ficheros?** Si es lo único que queda, camino 4 y frecuencia diaria.
5. **¿Nada de lo anterior?** Entonces la conversación no es técnica: es con el proveedor del ERP, o es un proyecto de [modernización alrededor del sistema](/es/integracion/sistemas-legados/) sin sustituirlo.

Una advertencia sobre el paso 1: la respuesta que da el comercial y la que da la documentación no siempre coinciden. Conviene pedir la documentación técnica y mirar dos cosas concretas —los límites de llamadas y si aparecen los campos personalizados—, porque son las dos que suelen tumbar un alcance ya presupuestado.

<h2 id="decisiones">Las cuatro decisiones previas al código</h2>

Estas se toman una vez y condicionan todo lo demás. Cambiarlas después es caro.

**Quién manda en cada dato.** Para cada campo compartido tiene que haber un sistema que decide y otros que obedecen. El dato fiscal del cliente suele ser del ERP; el nombre comercial y la etapa de venta, del CRM. Una sincronización bidireccional sin esta regla acaba en bucles —A escribe, B lo detecta y reescribe, A vuelve a detectarlo— y en datos que parecen cambiar solos.

**Cómo se evita duplicar al reintentar.** Toda operación tiene que poder repetirse sin crear nada dos veces, porque los reintentos van a ocurrir. En la práctica es una clave de idempotencia derivada de la referencia externa —el número de pedido del canal, por ejemplo—, guardada junto al efecto y en la misma transacción. Es el fallo más común de las integraciones de ERP y el más caro de deshacer, porque cuando lo detectas ya hay pedidos duplicados en contabilidad.

**Cuánto retraso es aceptable, flujo por flujo.** No es una pregunta técnica, es de negocio. El stock de un producto con rotación alta en campaña no admite lo mismo que el de un catálogo estable. Y la respuesta condiciona directamente el camino: si un flujo necesita segundos, los ficheros quedan descartados de entrada.

**Qué pasa cuando el otro lado no responde.** La respuesta correcta casi nunca es «se para». Los mensajes se encolan, se reintentan con espaciado creciente y se envían cuando el servicio vuelve, manteniendo el estado de cada uno. Lo que no puede pasar es que la caída de un tercero detenga tu facturación — y eso es exactamente lo que provoca un diseño síncrono sin cola.

<h2 id="se-cae">Por qué una integración se cae seis meses después</h2>

Las integraciones rara vez fallan el día del despliegue. Fallan más tarde, y casi siempre por una de estas cuatro razones:

- **El ERP se actualizó.** Cambió un campo, se endureció una validación, se retiró una versión de la API. Si nadie vigila las notas de versión del proveedor, se descubre por una queja de cliente.
- **El volumen creció y apareció el límite de llamadas.** Funcionaba con doscientos pedidos al día y no con dos mil. Los límites se manifiestan justo en los picos, que es cuando peor viene.
- **Alguien añadió un campo personalizado.** El ERP lo admite, la integración no lo conoce, y ese dato deja de viajar sin que salte ningún error.
- **La persona que lo montó se fue.** Es la causa raíz de las otras tres. Una integración sin dueño declarado y sin panel de estado funciona hasta que deja de hacerlo.

De ahí que la parte aburrida —registro de qué pasó con cada mensaje, alarma cuando algo lleva demasiado tiempo pendiente, y alguien responsable de mirar— no sea un extra. Es lo que separa una integración de un experimento con fecha de caducidad.

<h2 id="no-integrar">Cuándo no integrar</h2>

Tres situaciones en las que la respuesta correcta es esperar:

**Cuando el proceso no está documentado.** Automatizar un flujo que nadie sabe explicar convierte una ambigüedad en un comportamiento fijo y equivocado. Primero se escribe cómo funciona de verdad, con sus excepciones; después se conecta.

**Cuando el volumen no lo justifica.** Si una tarea manual ocupa diez minutos a la semana y no es crítica, el coste de construir y mantener la integración no se recupera. Conviene decirlo aunque el proyecto sea nuestro.

**Cuando el ERP está a punto de cambiar.** Si la sustitución es una decisión tomada y con fecha, lo sensato es esperar o diseñar la integración con contratos de datos explícitos para que sobreviva al cambio. Lo que no compensa es acoplar automatizaciones a los nombres de las tablas de un sistema que se va.

---

**Si el ERP factura, hay una integración con fecha límite.** El reglamento de sistemas de facturación obliga desde 2027, y el detalle de cómo se acopla a un ERP propio está en la [página de Verifactu para ERP a medida](/es/cumplimiento/verifactu/erp-a-medida/). El resto de flujos —pedidos, stock, clientes, reporting— y los patrones concretos de cada uno están en el [servicio de integración de ERP](/es/integracion/erp/).
