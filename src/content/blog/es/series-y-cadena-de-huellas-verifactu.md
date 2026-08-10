---
title: "Varias cajas, una sola cadena: series y encadenamiento en Verifactu"
seoTitle: "Encadenamiento Verifactu: series y multipunto"
description: "En Verifactu la serie de facturación y la cadena de huellas son dos cosas distintas. Qué implica eso cuando facturas desde varias cajas, tiendas o módulos a la vez."
category: compliance
articleSection: "Cumplimiento normativo"
date: 2026-08-10T09:00:00+02:00
tags:
  - encadenamiento Verifactu
  - series de facturación
  - huella hash registros facturación
  - RD 1007/2023
  - TPV multitienda
  - cumplimiento normativo empresas
about:
  - type: Thing
    name: "Real Decreto 1007/2023, Reglamento de sistemas informáticos de facturación"
locale: es
translationKey: verifactu-cadena-series
related:
  - qr-verifactu-ticket-termico-tpv
  - anulaciones-y-rectificativas-verifactu
author: "Luiz Fernando Brazão"
authorTitle: "Fundador de IA Operators"
authorUrl: "https://iaoperators.com/es/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
draft: false
ctaTitle: "¿Sabes cuántas cadenas necesita tu operación?"
ctaText: "Ocho preguntas y dos minutos: te decimos si Verifactu te obliga, en qué fecha y qué le falta a tu sistema, obligación por obligación."
ctaPrimaryLabel: "Hacer el test de Verifactu"
ctaPrimaryHref: "/es/cumplimiento/verifactu/test/"
faq:
  - q: "¿Hace falta una cadena de huellas por cada serie de facturación?"
    a: "No. Son dos numeraciones independientes: la serie ordena las facturas y la cadena ordena los registros de facturación. Dentro de un mismo sistema informático de facturación todos los registros van a una única cadena, aunque las facturas pertenezcan a series distintas. Confundir ambas cosas es el error de diseño más caro del proyecto, porque obliga a rehacer el modelo de datos."
  - q: "Si tengo varias tiendas, ¿puedo tener varias cadenas independientes?"
    a: "Depende de si son realmente sistemas separados. La AEAT admite varios sistemas informáticos de facturación cuando la necesidad del negocio lo justifica —por ejemplo, centros de negocio no interconectados—, y cada uno lleva su propia cadena. Pero si todas las tiendas son módulos del mismo ERP con facturación centralizada, el criterio es el contrario: un solo sistema y una sola cadena. La frontera es la interconexión real, no el organigrama."
  - q: "¿Qué pasa si dos puntos de emisión generan un registro exactamente a la vez?"
    a: "Que uno de los dos tiene que esperar. Dentro de una misma cadena solo hay un «registro anterior» posible, así que el sistema necesita un punto que serialice las peticiones y reparta los eslabones en orden. Si no lo tiene, se producen bifurcaciones o huecos, y ambos son detectables a posteriori."
  - q: "¿Puedo cambiar la estrategia de series una vez empezado?"
    a: "Las series se pueden reorganizar, pero la cadena ya escrita no se reescribe: es su razón de existir. Por eso el momento natural para ordenar la numeración es antes de la fecha en la que la obligación te alcanza, no después. Una vez arrancada la cadena, cualquier limpieza de series se convierte en un cambio con historia detrás."
---

Si tu proyecto de Verifactu se va a torcer, hay bastantes probabilidades de que lo haga aquí: en la diferencia entre una serie de facturación y una cadena de huellas.

> **En 30 segundos:** son dos cosas distintas. La serie ordena las facturas —y puede haber muchas—. La cadena ordena los registros de facturación, y dentro de un mismo sistema informático de facturación solo hay una. Cada registro lleva incrustada la referencia del anterior, incluidos los primeros 64 caracteres de su huella. Eso convierte el multipunto de emisión en un problema de escritura ordenada: si cinco cajas facturan a la vez, alguien tiene que decidir quién es el eslabón siguiente. La decisión que hay que tomar antes de escribir código es cuántos sistemas de facturación tiene realmente tu operación.

<nav aria-label="Tabla de contenidos">

**En este artículo**

1. [Serie no es cadena](#serie-no-es-cadena)
2. [Qué guarda cada eslabón](#eslabon)
3. [El problema real es escribir en orden](#orden)
4. [¿Cuántos sistemas de facturación tienes?](#cuantos-sif)
5. [Tres arquitecturas y cuándo usar cada una](#arquitecturas)
6. [Qué hacer con las series que ya tienes](#series-actuales)

</nav>

<h2 id="serie-no-es-cadena">Serie no es cadena</h2>

La serie de facturación es un concepto viejo y comercial. Existe para separar tipos de documento, tiendas, ejercicios o líneas de negocio, y su regla es que dentro de cada serie la numeración sea correlativa. Nada de esto lo inventó Verifactu.

La cadena de huellas es un concepto nuevo y forense. El [Real Decreto 1007/2023](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840) obliga a que cada registro de facturación quede enlazado con el anterior mediante una huella criptográfica, de modo que el conjunto sea verificable como bloque: si falta un eslabón o alguien reescribe uno, se nota.

Y aquí está el malentendido que hay que despejar antes de tocar el modelo de datos: **el enlace no se establece dentro de la serie, sino dentro del sistema**. Los registros se encadenan por orden cronológico de generación, con independencia de a qué serie pertenezca la factura que los origina. Una empresa con nueve series tiene nueve numeraciones y una sola cadena.

Lo he visto ir por el camino contrario más de una vez: alguien lee «encadenamiento», piensa «correlatividad», y diseña una cadena por serie porque parece la traducción natural. Funciona en pruebas —cada serie encadena consigo misma sin conflictos— y no funciona en cuanto llega la primera validación seria. Rehacerlo no es un parche: es cambiar la clave sobre la que gira todo el módulo.

<h2 id="eslabon">Qué guarda cada eslabón</h2>

El artículo 7 de la [Orden HAC/1177/2024](https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138), que desarrolla las especificaciones técnicas del reglamento, describe qué información del registro anterior incorpora cada registro de alta: el NIF del emisor, la serie y el número de la factura anterior, su fecha, y **los primeros 64 caracteres de la huella** de ese registro previo. El primer registro de la cadena se identifica a sí mismo como origen.

Dos consecuencias prácticas que conviene tener claras desde el diseño:

**No puedes generar un registro sin conocer el anterior.** La huella del eslabón previo es un dato de entrada obligatorio. Eso significa que el punto de emisión, en el momento de emitir, necesita saber quién va delante. No es un cálculo que se pueda posponer al cierre del día sin romper la correspondencia entre factura y registro.

**Los registros de anulación también encadenan.** Anular no saca nada de la cadena; añade un eslabón más. Es coherente con la lógica de la norma —lo que se persigue es que no se pueda borrar— pero rompe la intuición de quien está acostumbrado a tratar la anulación como un `DELETE`. Ese tema tiene suficiente casuística propia como para merecer [su propio artículo sobre anulaciones y rectificativas](/es/blog/anulaciones-y-rectificativas-verifactu/).

El algoritmo, según la propia [sede electrónica de la AEAT](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/huella-hash.html), es SHA-256 «por el momento» —esa cautela es literal, y es una buena razón para no incrustar el nombre del algoritmo en cincuenta sitios del código—. Los campos exactos que entran en el cálculo están en la documentación técnica de la Agencia, y ahí es donde hay que ir a leerlos: reproducirlos de memoria en un artículo o en una especificación interna es la forma más rápida de construir sobre una versión caducada.

<h2 id="orden">El problema real es escribir en orden</h2>

Reducido a lo esencial, el encadenamiento es una lista enlazada con una única cola de escritura. Y cuando varios procesos quieren añadir a la vez, aparece el problema clásico:

- **Bifurcación.** Dos registros apuntan al mismo anterior. La cadena deja de ser una cadena.
- **Hueco.** Un registro se genera, no se persiste y el siguiente encadena contra algo que no existe.
- **Desorden.** Los registros llegan a la cola de remisión en un orden distinto al de la cadena, y el estado deja de ser reconstruible.

Ninguno de los tres se arregla con reintentos. Se arreglan con una decisión de arquitectura: **dentro de una cadena, la asignación del eslabón tiene que estar serializada**, con un único punto que reparte turnos. En la práctica eso es una transacción con bloqueo sobre la última huella, o un servicio de secuenciación al que todos los puntos de emisión piden número.

Y aquí es donde la conversación deja de ser técnica y pasa a ser operativa: si todas las cajas de todas las tiendas tienen que pedir turno al mismo servicio, ese servicio se convierte en una dependencia dura de la facturación. Una tienda sin red deja de facturar. Para muchos negocios esto es inaceptable, y con razón.

De ahí que la pregunta que de verdad hay que responder no sea cómo encadenar, sino cuántas cadenas hay.

<h2 id="cuantos-sif">¿Cuántos sistemas de facturación tienes?</h2>

La norma no encadena «por empresa»: encadena por sistema informático de facturación. Y la AEAT, en sus [preguntas frecuentes sobre sistemas VERI*FACTU](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/sistemas-verifactu.html), admite expresamente que un mismo obligado tributario tenga varios cuando la necesidad del negocio lo justifica —cita, entre otros supuestos, varios centros de negocio no interconectados o varias líneas de producto diferenciadas—. Cada uno de esos sistemas cumple el reglamento por separado y lleva su propia cadena.

Pero pone también el límite en la dirección contraria, y es el que más gente se salta: si esos módulos pertenecen al mismo ERP y están interconectados en una facturación centralizada, entonces son **un** sistema, y todos sus registros van a una cadena única.

Traducido a la conversación que hay que tener internamente: la frontera no la dibuja el organigrama ni la contabilidad analítica, la dibuja la interconexión real de los sistemas. Cinco tiendas con cinco instalaciones autónomas que solo se consolidan en contabilidad son un caso. Cinco tiendas que consultan el mismo stock en tiempo real y facturan contra el mismo backend son otro muy distinto. Y esta calificación —cuántos sistemas hay— no es una decisión técnica que se tome sola en una sala de desarrollo: se cierra con la asesoría, porque tiene consecuencias declarativas.

<h2 id="arquitecturas">Tres arquitecturas y cuándo usar cada una</h2>

**Cadena única con secuenciador central.** Todos los puntos de emisión piden el eslabón a un mismo servicio, que serializa. Es la arquitectura más simple de auditar: una cadena, un orden, una verdad. A cambio, exige conectividad interna fiable y convierte al secuenciador en un componente crítico, con lo que eso implica de alta disponibilidad. Encaja bien en operaciones con un ERP centralizado, facturación por back-office y pocos puntos de emisión simultáneos.

**Un sistema por punto de emisión, con cadenas independientes.** Cada caja o cada tienda es su propio sistema, encadena localmente y remite por su cuenta. Sobrevive a los cortes de red porque no depende de nadie para emitir. El precio es multiplicar la superficie de cumplimiento: cada sistema necesita su documentación, su versión identificada y su declaración responsable, y el panel de estado pasa a vigilar N colas en lugar de una. Es el escenario natural de un [TPV repartido en varias tiendas](/es/cumplimiento/verifactu/tpv-multitienda/) que operan de forma autónoma, y solo es defendible si esa autonomía es real.

**Emisión local con encadenamiento diferido.** La tentación evidente: la caja emite y el registro se encadena luego, en un proceso central. Conviene decirlo con claridad —esto es exactamente la trampa que el reglamento persigue. El registro de facturación tiene que generarse en el mismo acto de expedición de la factura, y su eslabón forma parte del registro. Un diseño que emite ahora y encadena por la noche rompe la correspondencia uno a uno entre factura y registro, que es el corazón de la norma. Si alguien lo propone porque «así no hay que tocar el TPV», la respuesta corta es que sí hay que tocarlo.

Hay un matiz que suele desatascar esta discusión, y es una de las pocas buenas noticias del reglamento: **el código QR de la factura no depende de la cadena**. Codifica el NIF, la serie y número, la fecha y el importe —no la huella—, así que el punto de emisión puede imprimirlo sin esperar a nadie. Lo detallo en el [artículo sobre el QR y el ticket térmico](/es/blog/qr-verifactu-ticket-termico-tpv/). Eso separa dos problemas que muchos equipos abordan como si fueran uno.

<h2 id="series-actuales">Qué hacer con las series que ya tienes</h2>

Casi ninguna empresa con más de cinco años llega a esta conversación con las series limpias. Lo habitual es una lista con historia: series que nacieron para un cliente que ya no está, saltos que nadie sabe explicar, numeraciones que se reiniciaron cuando se cambió de programa.

Antes de Verifactu, eso era un incordio contable. Después, el problema cambia de naturaleza: la cadena hace que el conjunto de registros sea auditable de punta a punta, y las rarezas dejan de pasar desapercibidas. No es que la norma prohíba tener muchas series —no lo hace—; es que cada una debe poder explicarse.

El orden de trabajo que funciona es este:

1. **Inventariar los puntos de emisión de verdad.** No las personas: los módulos, cajas, integraciones y procesos automáticos que pueden generar una factura. Casi siempre aparecen dos o tres que nadie tenía en la lista, normalmente automatismos antiguos.
2. **Justificar cada serie viva.** Si no hay una razón que se pueda decir en voz alta, la serie sobra. Cerrar series es más barato antes de que arranque la cadena.
3. **Decidir la frontera de sistemas.** Con la asesoría, y por escrito. Esta decisión determina el resto del diseño.
4. **Fijar el corte.** La fecha en la que la obligación te alcanza —[1 de enero o 1 de julio de 2027 según cómo tributes](/es/cumplimiento/verifactu/plazos/)— es el punto natural para arrancar limpio.

Nada de esto es trabajo de programación, y ese es justo el motivo por el que se pospone. Pero es el trabajo que determina si la integración dura tres semanas o tres meses. Cuando lo abordamos en un proyecto, es la primera fase de la [integración de Verifactu sobre el sistema que la empresa ya tiene](/es/cumplimiento/verifactu/), antes de escribir una línea del conector.

---

*Información técnica sobre implementación de sistemas. No constituye asesoramiento fiscal ni jurídico: la calificación de tu caso concreto —incluida la de cuántos sistemas informáticos de facturación tienes— corresponde a tu asesoría.*
