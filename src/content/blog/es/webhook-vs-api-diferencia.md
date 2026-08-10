---
title: "Webhook o API: la diferencia, y los cinco supuestos que rompen integraciones"
seoTitle: "Webhook vs API: la diferencia y el uso real"
description: "La diferencia se explica en una frase. Lo que casi nadie cuenta es lo que pasa después: el webhook llega dos veces, llega desordenado y a veces no es quien dice ser."
category: others
articleSection: "Integración de sistemas"
date: 2026-08-10T20:00:00+02:00
tags:
  - webhooks
  - API
  - integración de sistemas
  - idempotencia
  - automatización de procesos
  - n8n
about:
  - type: Thing
    name: "Webhooks e integración por API"
locale: es
translationKey: webhook-vs-api-diferencia
related:
  - como-integrar-un-erp-metodos
  - n8n-vs-zapier-vs-make-empresas
  - cuanto-cuesta-whatsapp-business-api
author: "Luiz Fernando Brazão"
authorTitle: "Fundador de IA Operators"
authorUrl: "https://iaoperators.com/es/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
draft: false
ctaTitle: "¿Tus integraciones aguantan un reintento?"
ctaText: "Si nadie sabe responder qué pasó con un mensaje concreto sin abrir la base de datos, falta la capa de estado. Es lo primero que montamos."
ctaPrimaryLabel: "Ver integraciones por API y webhooks"
ctaPrimaryHref: "/es/integracion/api-y-webhooks/"
faq:
  - q: "¿Cuál es la diferencia entre una API y un webhook?"
    a: "La dirección de la iniciativa. Con una API tú preguntas cuando quieres: controlas el ritmo, pero te enteras tarde y gastas llamadas preguntando por cosas que no han cambiado. Con un webhook el otro sistema te avisa en el momento en que algo ocurre: es inmediato y eficiente, pero te obliga a estar disponible siempre y a tolerar avisos repetidos. Por eso suele decirse que un webhook es una API al revés."
  - q: "¿Es mejor usar webhooks o API?"
    a: "Casi ninguna integración seria usa solo uno. El patrón habitual es webhook para enterarse y API para confirmar: el aviso te dice que el pedido cambió, y la llamada a la API te dice cómo ha quedado exactamente. Fiarse solo del contenido del webhook es frágil, porque si dos avisos llegan desordenados puedes acabar guardando un estado antiguo encima del nuevo."
  - q: "¿Por qué me llega el mismo webhook varias veces?"
    a: "Porque prácticamente ningún emisor garantiza entrega única. Si tu respuesta tarda, se pierde por el camino o devuelve un error, el emisor reintenta — y desde su punto de vista no puede saber si tú lo procesaste o no. Lo que hay que construir en el receptor es la capacidad de reconocer el evento repetido y descartarlo, guardando su identificador junto al efecto y en la misma transacción."
  - q: "¿Hace falta programar para usar webhooks?"
    a: "No necesariamente. Herramientas como n8n, Make o Zapier reciben webhooks y encadenan acciones sin escribir código, y para muchos casos son la respuesta correcta. Dejan de bastar cuando el volumen hace que el precio por ejecución no tenga sentido, cuando necesitas una transacción real entre dos pasos, o cuando la lógica de error es más compleja que la de negocio."
  - q: "¿Cómo sé si un webhook viene de quien dice venir?"
    a: "Por la firma. Los emisores serios envían una cabecera con una firma calculada sobre el cuerpo del mensaje y un secreto compartido; el receptor la recalcula y compara. Sin esa verificación, un endpoint público es un formulario de escritura abierto a internet contra tu sistema de gestión. Conviene además rechazar mensajes con marca de tiempo antigua, para que una petición capturada no se pueda reenviar más tarde."
---

La diferencia entre una API y un webhook se explica en una frase, y hay ya cientos de artículos que la explican. Este empieza por ahí y sigue por donde todos terminan: qué pasa cuando ese webhook llega dos veces, llega desordenado, o no viene de quien dice venir.

> **En 30 segundos:** con una API tú preguntas; con un webhook te avisan. La API la controlas tú y llegas tarde; el webhook es inmediato y te obliga a estar siempre disponible. En la práctica se usan los dos: el evento avisa, la llamada confirma. Y a partir de ahí empiezan los cinco supuestos falsos que rompen integraciones en producción —que llega una vez, que llega en orden, que responder 200 basta, que el emisor reintentará siempre y que viene de quien dice venir—. Ninguno se cumple.

<nav aria-label="Tabla de contenidos">

**En este artículo**

1. [La diferencia, en una frase](#diferencia)
2. [Por qué en la práctica se usan los dos](#los-dos)
3. [Los cinco supuestos que rompen integraciones](#supuestos)
4. [Cómo evaluar los webhooks de un proveedor](#evaluar)
5. [Cuándo basta con n8n o Zapier](#nocode)

</nav>

<h2 id="diferencia">La diferencia, en una frase</h2>

**Con una API tú preguntas. Con un webhook te avisan.** Todo lo demás se deriva de eso.

| | API | Webhook |
| --- | --- | --- |
| Quién toma la iniciativa | Tú | El otro sistema |
| Cuándo te enteras | Cuando preguntas | Cuando ocurre |
| Quién controla el ritmo | Tú | El emisor |
| Coste típico | Muchas llamadas para nada | Solo cuando hay novedad |
| Requiere estar disponible | No | Sí, siempre |
| Riesgo principal | Llegar tarde | Perderte un aviso |

Por eso a los webhooks se les llama a veces «APIs al revés»: el contrato es parecido, pero la llamada la hace el otro.

Hay una tercera opción que suele quedar fuera de la comparación y conviene tener en el mapa: **el sondeo periódico**. Preguntar cada minuto con la API es lo que se hace cuando el otro sistema no ofrece eventos. Funciona, y es la peor de las tres en casi todo: te enteras tarde, gastas llamadas para nada, y en cuanto el volumen crece te comes el límite de peticiones del proveedor. Se elige por falta de alternativa, no por diseño.

<h2 id="los-dos">Por qué en la práctica se usan los dos</h2>

La pregunta «¿webhook o API?» está mal planteada. Casi ninguna integración seria usa solo uno.

El patrón que funciona es **el evento avisa, la API confirma**. Llega el webhook diciendo «el pedido 4821 cambió»; en lugar de fiarte del contenido del aviso, llamas a la API y preguntas cómo ha quedado ese pedido exactamente. Parece un paso de más y evita el fallo más silencioso de todos.

El motivo es que los avisos no llegan necesariamente en el orden en que ocurrieron. Si el pedido pasa de *pagado* a *enviado* en dos segundos y los dos avisos se cruzan por el camino, fiarte del contenido significa guardar *pagado* encima de *enviado* y no enterarte. Preguntando a la API siempre obtienes el estado actual, que es el que importa.

Y hay un motivo más prosaico: el webhook suele traer menos información de la que necesitas. Trae el identificador y poco más, precisamente para que vayas a buscar el resto.

<h2 id="supuestos">Los cinco supuestos que rompen integraciones</h2>

Estos son los que se dan por buenos al montar la primera integración y se descubren, uno a uno, en producción.

**1. «El webhook llega una vez».** No. Prácticamente ningún emisor garantiza entrega única — el estándar del sector es *al menos una vez*. Si tu respuesta tarda, se pierde o devuelve error, el emisor reintenta, porque desde su lado no hay forma de saber si lo procesaste.

La consecuencia es que **el receptor tiene que ser idempotente**: reconocer el evento repetido y descartarlo. En la práctica, guardar el identificador del evento junto al efecto y en la misma transacción. Sin eso, un reintento se traduce en un pedido duplicado, un cobro duplicado o un correo enviado dos veces al cliente.

**2. «Llegan en orden».** Tampoco. Van por la red, se reintentan de forma independiente y pueden cruzarse. La solución no es intentar ordenarlos: es que cada entidad lleve un número de versión o una marca temporal fiable, y descartar lo que sea más antiguo que lo que ya tienes.

**3. «Si respondo 200, ya está».** Este es el más sutil. Responder 200 significa «me hago cargo», así que hay que **persistir el evento antes de responder**, no después. Si respondes primero y te caes al procesar, el emisor cree que fue bien y ese aviso no vuelve nunca. El orden correcto es: validar la firma, guardar el evento crudo, responder, y procesar aparte.

**4. «El emisor reintentará hasta que funcione».** No indefinidamente. Muchos servicios **desactivan un webhook que falla de forma repetida**, y avisan por email a una dirección que quizá ya no lee nadie. La integración se apaga sola y se descubre semanas después, cuando alguien nota que faltan pedidos.

**5. «Viene de quien dice venir».** Un endpoint público sin verificación es un formulario de escritura abierto a internet contra tu sistema de gestión. La verificación se hace con la firma que envía el emisor: se recalcula sobre el cuerpo recibido con el secreto compartido y se compara — con comparación en tiempo constante, no con un `==` normal. Y conviene rechazar mensajes cuya marca de tiempo sea vieja, para que una petición capturada no pueda reenviarse más tarde.

Ninguno de los cinco es exótico. Los cinco aparecen en cuanto la integración lleva unos meses y algo de volumen.

<h2 id="evaluar">Cómo evaluar los webhooks de un proveedor</h2>

Antes de elegir una herramienta o comprometer un alcance porque «tiene webhooks», hay seis preguntas que se responden leyendo su documentación en veinte minutos. La diferencia entre un proveedor que las cumple y otro que no es semanas de trabajo:

1. **¿Firma los envíos?** Si no, tendrás que inventar otra forma de autenticar, y todas son peores.
2. **¿Reintenta? ¿Cuántas veces y con qué espaciado?** Determina cuánto margen tienes cuando tu sistema se cae.
3. **¿Desactiva el endpoint tras fallos repetidos?** Si sí, necesitas una alarma propia, porque su email no basta.
4. **¿Puedes reenviar un evento a mano?** Es la diferencia entre recuperar un día perdido y reconstruirlo a mano.
5. **¿Hay registro de envíos consultable?** Sin él, «no me llegó» es una discusión sin árbitro.
6. **¿El evento trae identificador propio y estable?** Es lo que te permite deduplicar. Si no lo trae, hay que fabricarlo, y no siempre se puede.

Las dos últimas son las que más veces faltan, y las que más caro salen: sin identificador estable no hay idempotencia posible, y sin registro no hay forma de auditar qué pasó.

<h2 id="nocode">Cuándo basta con n8n o Zapier</h2>

Nada de lo anterior obliga a programar. Las plataformas de automatización visual reciben webhooks, encadenan acciones y gestionan buena parte de los reintentos por ti. Para la mayoría de los casos son la respuesta correcta, y las usamos a diario — la comparación entre las tres está en [n8n frente a Zapier y Make](/es/blog/n8n-vs-zapier-vs-make-empresas/).

Dejan de bastar en tres situaciones concretas:

- **El volumen hace que el precio por ejecución deje de tener sentido.** Es aritmética, y llega antes de lo que parece.
- **Hace falta una transacción real entre dos pasos.** O ocurren los dos o no ocurre ninguno; eso no se garantiza encadenando nodos.
- **La lógica de error es más compleja que la de negocio.** Es más frecuente de lo que suena: lo que cuesta construir no es el camino feliz, es todo lo demás.

La decisión sensata rara vez es «todo a medida». Suele ser dejar en la herramienta lo que le corresponde y sacar a código las dos o tres piezas que la desbordan.

---

**Si lo que tienes ahora es una integración que «va bien» pero cada dos semanas alguien pregunta por un pedido que no llegó**, lo que falta no es un webhook mejor: es la capa de estado que permite responder qué pasó con ese mensaje concreto sin abrir la base de datos. Está desglosada en [integraciones por API y webhooks](/es/integracion/api-y-webhooks/), y es lo mismo que aplicamos cuando el otro extremo es [un ERP](/es/blog/como-integrar-un-erp-metodos/) o el servicio de una Administración.
