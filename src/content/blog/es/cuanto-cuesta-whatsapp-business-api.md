---
title: "Cuánto cuesta WhatsApp Business API (y cuándo no compensa)"
seoTitle: "Cuánto cuesta WhatsApp Business API en 2026"
description: "El cobro pasó a ser por mensaje, no por conversación. Qué te cobra Meta, qué es gratis, los tres costes que nadie suma y cómo estimar tu factura sin adivinar."
category: others
articleSection: "Integración de sistemas"
date: 2026-08-10T18:00:00+02:00
tags:
  - WhatsApp Business API
  - precio WhatsApp API
  - automatización de WhatsApp
  - atención al cliente
  - integración de sistemas
  - empresas medianas
about:
  - type: Thing
    name: "WhatsApp Business Platform"
locale: es
translationKey: cuanto-cuesta-whatsapp-business-api
related:
  - como-integrar-un-erp-metodos
  - errores-comunes-whatsapp-salones-de-belleza
  - n8n-vs-zapier-vs-make-empresas
author: "Luiz Fernando Brazão"
authorTitle: "Fundador de IA Operators"
authorUrl: "https://iaoperators.com/es/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
draft: false
ctaTitle: "¿Te sale a cuenta la API en tu volumen?"
ctaText: "Lo estimamos con tus números reales —conversaciones al mes, quién inicia, qué categoría— antes de que te comprometas con ningún proveedor."
ctaPrimaryLabel: "Ver integración de WhatsApp Business API"
ctaPrimaryHref: "/es/integracion/whatsapp-business-api/"
faq:
  - q: "¿WhatsApp Business API es gratis?"
    a: "La plataforma no tiene cuota de alta por parte de Meta, pero el uso sí se factura. Meta cobra por mensaje enviado en las categorías de plantilla —marketing, utility y authentication—, con tarifas que dependen del país del destinatario. Lo que no se cobra son los mensajes que recibes, los mensajes libres que envías dentro de una ventana de atención abierta, y todo lo que ocurre dentro de una ventana de free entry point. Aparte del coste de Meta está el del proveedor a través del que accedes, que es un contrato distinto."
  - q: "¿Se cobra por conversación o por mensaje?"
    a: "Por mensaje. El modelo por conversación quedó obsoleto, y conviene tenerlo presente porque buena parte de los artículos en español que siguen circulando lo describen del modo antiguo. La diferencia es importante para estimar: en el modelo viejo abrías una conversación y enviabas dentro sin coste adicional; ahora cada plantilla enviada cuenta."
  - q: "¿Cuánto cuesta enviar un mensaje en España?"
    a: "Depende de la categoría de la plantilla y del volumen. Meta publica las tarifas en tablas descargables por moneda, con tramos por volumen, y solo las revisa el primer día de cada trimestre avisando con al menos un mes de antelación. Por eso no reproducimos importes concretos aquí: cualquier cifra escrita en un artículo caduca, y una estimación con números viejos es peor que no tener estimación."
  - q: "¿Puedo usar la API sin pagar a un proveedor?"
    a: "Técnicamente sí, conectando directamente contra la plataforma en la nube de Meta. En la práctica eso significa que alguien tiene que construir y mantener la gestión de plantillas, la bandeja de agentes, el historial y las métricas — es decir, reconstruir lo que hace un proveedor. Compensa cuando el volumen es alto o cuando la lógica de negocio es tan propia que ninguna herramienta de mercado encaja; no compensa para empezar."
  - q: "¿Merece la pena si atiendo pocas conversaciones al mes?"
    a: "Probablemente no. Con volumen bajo y un solo agente, la app de WhatsApp Business cubre el caso sin coste y sin proyecto. La API empieza a compensar cuando aparece alguna de estas tres cosas: varias personas atendiendo el mismo número, necesidad de que el sistema consulte o escriba en tu ERP o CRM, o la obligación de demostrar tiempos de respuesta. Si no se da ninguna, esperar es la decisión correcta."
---

Casi todos los artículos en español que explican cuánto cuesta WhatsApp Business API describen un modelo de precios que ya no existe. No es culpa suya: cambió, y los textos se quedaron.

> **En 30 segundos:** Meta cobra **por mensaje enviado**, no por conversación, y solo en las categorías de plantilla —marketing, utility y authentication—. Los mensajes que recibes no se cobran, ni los libres que envías dentro de la ventana de atención de 24 horas que abre el cliente al escribirte, ni nada dentro de una ventana de free entry point de 72 horas. A eso hay que sumarle tres costes que casi nadie contabiliza: el proveedor, la construcción de la integración y su mantenimiento. Y hay un caso muy común en el que la respuesta correcta es no dar el paso.

<nav aria-label="Tabla de contenidos">

**En este artículo**

1. [Qué te cobra Meta y qué no](#meta)
2. [Las ventanas gratis que deciden la factura](#ventanas)
3. [Los otros tres costes](#otros-costes)
4. [Cómo estimar tu factura sin adivinar](#estimar)
5. [Por qué aquí no hay tarifas en euros](#tarifas)
6. [Cuándo no compensa la API](#no-compensa)

</nav>

<h2 id="meta">Qué te cobra Meta y qué no</h2>

La [documentación de precios de la plataforma](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) lo dice sin rodeos: el cobro es **por mensaje entregado**, y se aplica a los mensajes de plantilla, que son los que inicia la empresa. Hay tres categorías, y la categoría la determina el contenido, no tu intención comercial:

- **Marketing.** Promociones, novedades, recuperación de carrito, reactivación. Es la categoría más cara.
- **Utility.** Confirmaciones, actualizaciones de estado de un pedido, recordatorios de cita — mensajes ligados a una transacción concreta que el cliente ya tiene en marcha.
- **Authentication.** Códigos de verificación y de un solo uso.

Lo que **no** se cobra:

- Todos los mensajes que te envían los usuarios.
- Los mensajes libres que envías dentro de una ventana de atención abierta.
- Los mensajes de utility enviados como respuesta dentro de una ventana de atención abierta.
- Todo lo enviado dentro de una ventana de free entry point, incluidas las plantillas.

Aquí está la primera consecuencia práctica, y es de diseño, no de negociación: **la diferencia entre una factura razonable y una desagradable la marca cuánto de tu operación cae dentro de las ventanas gratis**. Eso no se optimiza a posteriori, se decide al montar los flujos.

<h2 id="ventanas">Las ventanas gratis que deciden la factura</h2>

**La ventana de atención de 24 horas.** Se abre cuando el cliente te escribe. Durante ese tiempo puedes responder con mensajes libres —sin plantilla y sin coste— tantas veces como haga falta. Es el corazón de cualquier flujo de soporte bien diseñado: si el cliente inicia, la conversación entera es gratis.

**La ventana de free entry point, de 72 horas.** Es más generosa y bastante menos conocida. Se abre cuando el usuario llega a tu WhatsApp desde un punto de entrada reconocido, y durante ese tiempo **todos** los mensajes son gratis, incluidas las plantillas de marketing. Que un canal de captación entre o no por esa puerta puede cambiar el coste de una campaña de forma nada trivial.

**Las respuestas de utility dentro de una ventana abierta.** Si el cliente pregunta por su pedido y le contestas con la actualización correspondiente mientras la ventana sigue abierta, esa respuesta no se cobra.

La lectura conjunta de las tres es una regla de diseño simple: **cada vez que consigues que sea el cliente quien inicia, el coste baja**. Un botón de WhatsApp bien colocado en la web, en el ticket o en el email de confirmación no es solo mejor experiencia — es más barato que perseguir a esa misma persona con una plantilla tres días después.

<h2 id="otros-costes">Los otros tres costes</h2>

La factura de Meta suele ser la única que se contabiliza al decidir, y rara vez es la mayor.

**El proveedor.** Salvo que conectes directamente contra la plataforma en la nube de Meta, accedes a través de un proveedor. Los modelos comerciales varían muchísimo: cuota fija, precio por agente, margen sobre el coste de los mensajes o combinaciones de todo. Al comparar, la pregunta que ordena la conversación es qué pasa cuando duplicas el volumen — algunos modelos escalan de forma razonable y otros no.

**La construcción.** Es el coste que se descubre tarde. Dar de alta el número es lo rápido; lo que lleva tiempo es conectar el canal con el sistema que tiene la respuesta. Un agente que no puede consultar el estado de un pedido en tu ERP solo puede hablar de generalidades, y eso no resuelve conversaciones ni ahorra horas. Aquí aplican los mismos [métodos de integración que en cualquier otro sistema](/es/blog/como-integrar-un-erp-metodos/): API, eventos, base de datos o ficheros, con sus mismas restricciones.

**El mantenimiento.** Las plantillas se aprueban una a una y hay que gestionarlas; la calidad de la cuenta sube y baja según cómo reaccionen los usuarios; las políticas cambian. No es mucho trabajo al mes, pero es trabajo continuo, y una cuenta cuya calidad se degrada ve reducido el volumen que se le permite enviar — justo el problema que más caro sale.

<h2 id="estimar">Cómo estimar tu factura sin adivinar</h2>

La estimación útil no necesita tarifas exactas para tomar la decisión. Necesita cuatro números tuyos:

1. **Conversaciones al mes**, contadas como asuntos distintos, no como mensajes.
2. **Qué porcentaje lo inicia el cliente.** Es la variable que más mueve el resultado, porque es la que determina cuánto cae dentro de la ventana gratis.
3. **Cuántas plantillas envías tú, por categoría.** Un recordatorio de cita y una campaña de rebajas no valen lo mismo ni de lejos.
4. **Cuántos agentes** van a atender, si el proveedor cobra por usuario.

Con eso, el cálculo es directo: mensajes de plantilla por categoría × tarifa vigente de tu país, más el modelo del proveedor. Y el ejercicio que de verdad informa la decisión no es el escenario central, son los extremos: cómo queda la factura el mes de la campaña grande, y cómo queda un mes flojo.

Un patrón que aparece a menudo al hacer este ejercicio con datos reales: empresas que creían tener un problema de coste de mensajería tenían en realidad un problema de reparto. Enviaban como marketing cosas que eran utility, o perseguían con plantillas a clientes que habrían escrito ellos mismos si hubiera habido un botón de WhatsApp en el sitio correcto.

<h2 id="tarifas">Por qué aquí no hay tarifas en euros</h2>

Es una decisión deliberada, y creo que conviene explicarla.

Meta publica las tarifas en tablas descargables por moneda, con **tramos por volumen** —el precio por mensaje baja según cuánto envías—, y las revisa **solo el primer día de cada trimestre**, avisando con al menos un mes de antelación. Es decir: hay tres variables (país, categoría, tramo) y una fecha de caducidad conocida.

Un artículo que fija un importe hace dos cosas malas a la vez. Envejece sin avisar, y da una falsa sensación de precisión: el número que verías aquí no sería el tuyo salvo casualidad, porque tu tramo de volumen no es el del ejemplo.

Lo que sí tiene valor duradero es lo otro: que el modelo es por mensaje, que las categorías son tres, que las ventanas gratis existen y cuáles son, y que las revisiones son trimestrales y anunciadas. Con eso puedes ir a la tabla vigente y calcular tu caso — y planificar, porque sabes que el precio no se te va a mover a mitad de trimestre.

La comprobación rápida para cualquier fuente que consultes sobre esto: **si habla de precio «por conversación», está desactualizada**. Es un buen filtro, y descarta bastante de lo que hay escrito en español.

<h2 id="no-compensa">Cuándo no compensa la API</h2>

Vale la pena decirlo aunque vivamos de montar estas integraciones: hay un caso muy común en el que la respuesta correcta es esperar.

Si atiendes poco volumen, con una sola persona, y no necesitas que el sistema consulte nada, la **app de WhatsApp Business** cubre el caso sin coste y sin proyecto. Pasar a la API ahí solo añade factura y complejidad.

La API empieza a compensar cuando aparece al menos una de estas tres cosas:

- **Varias personas atendiendo el mismo número.** La app no lo permite de forma seria, y es el motivo más frecuente para dar el salto.
- **Necesidad de que el canal hable con tus sistemas.** Consultar un pedido, reservar una cita, escribir en el [CRM](/es/integracion/crm/). Sin esto, un agente automático solo puede dar respuestas genéricas.
- **Obligación de demostrar tiempos de respuesta.** Si atiendes reclamaciones por WhatsApp, el canal entra en el ámbito de la [Ley 10/2025 de atención a la clientela](/es/cumplimiento/ley-atencion-al-cliente/), y sus plazos hay que poder probarlos con datos. Un número en el móvil de alguien no produce evidencia.

Y hay un cuarto motivo, menos citado y bastante real: **el número deja de depender de una persona**. Cuando el WhatsApp de la empresa está instalado en un teléfono concreto, el historial de clientes se va el día que se va esa persona. Eso no es un coste que aparezca en ninguna factura, pero es el que más caro sale cuando ocurre.

---

**Si el paso tiene sentido en tu caso**, lo que viene después es decidir plantillas, ventana, agente y conexión con el sistema que tiene la respuesta. Está desglosado en la [página de WhatsApp Business API](/es/integracion/whatsapp-business-api/), con los cuatro flujos que hay que resolver y dónde se rompe cada uno.
