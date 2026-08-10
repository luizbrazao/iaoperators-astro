---
title: "Anulaciones y rectificativas en Verifactu: la casuística que retrasa los proyectos"
seoTitle: "Anular o rectificar en Verifactu: qué cambia"
description: "Anular no es borrar y rectificar no es editar. La diferencia entre ambos casos es fiscal, no técnica, y es lo que más veces obliga a rehacer el conector."
category: compliance
articleSection: "Cumplimiento normativo"
date: 2026-08-10T13:00:00+02:00
tags:
  - factura rectificativa Verifactu
  - registro de anulación
  - RD 1007/2023
  - RD 1619/2012 reglamento facturación
  - ERP facturación
  - cumplimiento normativo empresas
about:
  - type: Thing
    name: "Real Decreto 1007/2023, Reglamento de sistemas informáticos de facturación"
locale: es
translationKey: verifactu-anulaciones-rectificativas
related:
  - series-y-cadena-de-huellas-verifactu
  - qr-verifactu-ticket-termico-tpv
author: "Luiz Fernando Brazão"
authorTitle: "Fundador de IA Operators"
authorUrl: "https://iaoperators.com/es/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
draft: false
ctaTitle: "¿Tu sistema distingue anular de rectificar?"
ctaText: "Ocho preguntas y dos minutos: te decimos si Verifactu te obliga, en qué fecha y qué le falta a tu sistema de facturación, obligación por obligación."
ctaPrimaryLabel: "Hacer el test de Verifactu"
ctaPrimaryHref: "/es/cumplimiento/verifactu/test/"
faq:
  - q: "¿Cuál es la diferencia entre anular una factura y rectificarla?"
    a: "Anular corresponde a una factura que no debió existir: un error material, una operación inexistente, un documento generado por equivocación. Rectificar corresponde a una factura que sí existió pero cuyos datos deben corregirse, normalmente por un error fundado en derecho o por alguno de los supuestos de modificación de la base imponible. La calificación es fiscal, no técnica, y es tu asesoría quien la determina —el sistema solo debe permitir ejecutar ambos caminos por separado."
  - q: "¿Una factura rectificativa genera un registro de anulación?"
    a: "No. Genera su propio registro de facturación de alta, con la clave de tipo rectificativa que corresponda. El registro de anulación se reserva para dar de baja un registro de alta que no procedía, identificando la factura original. Son dos flujos distintos y un sistema que los mezcla acaba enviando registros que no cuadran."
  - q: "¿Las rectificativas necesitan una serie propia?"
    a: "Sí, y esto es anterior a Verifactu: el Reglamento de facturación obliga desde 2012 a expedir las rectificativas en series específicas. Lo que cambia con el nuevo reglamento es que la trazabilidad de esa serie deja de ser un asunto interno y pasa a estar en los registros que se remiten a la Agencia."
  - q: "¿Se puede anular un registro que ya se envió a la AEAT?"
    a: "El procedimiento para dar de baja un registro de alta que no procede es precisamente enviar un registro de anulación que identifique la factura original. Lo que no existe es la posibilidad de retirar un registro de la cadena: la anulación añade un eslabón, no lo quita. Por eso el estado de envío de cada registro tiene que ser consultable, porque anular algo que nunca llegó a remitirse crea un problema distinto del que se pretendía resolver."
---

Los proyectos de Verifactu casi nunca se retrasan por el envío a la AEAT. Se retrasan aquí: en las tres semanas que se descubren tarde, cuando alguien pregunta qué pasa cuando una factura estaba mal.

> **En 30 segundos:** el reglamento distingue dos operaciones que la mayoría de ERPs resuelven con un solo botón. Anular es para la factura que no debió existir, y genera un registro de anulación que identifica a la original. Rectificar es para la factura que existió pero era incorrecta, y genera su propio registro de alta con clave de rectificativa. Ni una ni otra borran nada: ambas añaden eslabones a la cadena. La consecuencia de diseño es que hay que separar los dos caminos en la interfaz, obligar a elegir, y guardar el estado de envío de cada registro para saber qué se puede hacer con él.

<nav aria-label="Tabla de contenidos">

**En este artículo**

1. [Dos verbos, no uno](#dos-verbos)
2. [Anular no borra: añade](#anular-no-borra)
3. [Rectificar es emitir, no editar](#rectificar)
4. [Sustitución o diferencias: una decisión de modelo de datos](#sustitucion-diferencias)
5. [El botón único es el bug](#boton-unico)
6. [Lo que se rompe en caja](#caja)
7. [La casuística que conviene tener escrita](#casuistica)

</nav>

<h2 id="dos-verbos">Dos verbos, no uno</h2>

En la mayoría de los sistemas que auditamos existe un único verbo: *anular*. Se usa cuando el cliente devuelve el producto, cuando el comercial se equivocó de cliente, cuando el importe estaba mal, cuando la factura se emitió dos veces y cuando alguien probó el TPV con una venta ficticia. Un solo botón para cinco situaciones que fiscalmente no son la misma.

El [Real Decreto 1007/2023](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840) no crea esa distinción —viene de la normativa de facturación— pero sí la vuelve visible, porque a partir de ahora cada camino produce un registro distinto que viaja a la Agencia Tributaria. Lo que antes se resolvía internamente ahora deja huella.

Las [preguntas frecuentes de la AEAT sobre procedimientos de facturación](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/procedimientos-facturacion.html) lo describen con bastante claridad: el registro de alta que no procede se da de baja mediante un registro de facturación de anulación que identifica el número de la factura original; y si además procede emitir una factura correcta, esa se registra con su propia alta. La rectificativa, en cambio, es un alta con clave de rectificativa.

La línea divisoria, en la práctica:

- **La factura no debió existir.** Error material, operación inexistente, duplicado, documento generado por equivocación. Camino: anulación.
- **La factura existió pero está mal.** Error fundado en derecho, supuestos de modificación de la base imponible, condiciones que cambian después de emitir. Camino: rectificativa.

Y una advertencia que conviene poner por escrito antes de programar nada: **quién decide en qué caso está cada situación no es el equipo técnico**. Es una calificación fiscal. Lo que el sistema tiene que garantizar es que ambos caminos existen, están separados y son ejecutables por quien corresponde.

<h2 id="anular-no-borra">Anular no borra: añade</h2>

Esta es la frase que hay que repetir en la reunión de arranque hasta que se quede: en Verifactu, anular añade.

El registro de anulación no retira nada de la cadena de huellas. Es un eslabón más, encadenado como cualquier otro, que declara que un alta anterior no procede. La cadena crece; nunca mengua. Es exactamente el comportamiento que persigue la norma —lo que se quiere impedir es que una factura desaparezca sin dejar rastro— pero choca de frente con la intuición de cualquiera que haya trabajado con un `DELETE` o con un estado `anulada` en una tabla.

De ahí salen tres exigencias concretas sobre el modelo de datos:

**El registro es inmutable; el documento tiene estado.** Los registros de facturación se guardan una vez y no se tocan. La situación de la factura —vigente, anulada, rectificada— es una proyección que se calcula a partir de la secuencia de registros, no un campo que se sobrescribe. Si el registro vive en la misma tabla que el ERP actualiza a diario, no es un registro de evidencia: es un dato más.

**La anulación necesita la identidad de la original.** Serie, número y fecha de la factura a la que se refiere. Suena obvio hasta que aparece el caso de la factura emitida por un proceso automático que no guardó bien su propia identidad.

**El orden importa.** La anulación va después del alta en la cadena, siempre. Si el sistema encola registros y los remite en paralelo, hay que garantizar que una anulación no adelanta al alta que anula. Es el mismo problema de escritura ordenada que aparece [cuando varios puntos de emisión comparten cadena](/es/blog/series-y-cadena-de-huellas-verifactu/), aquí en versión reducida pero igual de real.

<h2 id="rectificar">Rectificar es emitir, no editar</h2>

Una factura rectificativa es una factura nueva. Tiene su propio número, su propia fecha y su propio registro de alta, marcado con la clave de tipo que corresponda al motivo de la rectificación. Las claves distinguen los distintos supuestos —errores fundados en derecho, los casos de modificación de la base imponible previstos en la normativa del IVA, y un tipo específico para la rectificación de facturas simplificadas—, y elegir la correcta es, otra vez, una decisión fiscal antes que técnica.

Dos consecuencias que afectan al diseño:

**Serie propia, y esto no es nuevo.** El [Reglamento de facturación aprobado por el Real Decreto 1619/2012](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696) ya obliga en su artículo 6 a expedir las rectificativas en series específicas. Lo que cambia con Verifactu no es la obligación, es que ahora esa serie forma parte de lo que se remite. Muchas empresas descubren en este punto que su sistema venía numerando las rectificativas dentro de la serie general desde hace años.

**Encadenan como todo lo demás.** Una rectificativa de una rectificativa es posible y produce otro eslabón. El sistema no puede asumir que la cadena de correcciones tiene profundidad uno.

<h2 id="sustitucion-diferencias">Sustitución o diferencias: una decisión de modelo de datos</h2>

El artículo 15 del Reglamento de facturación admite dos formas de expresar la rectificación, y el registro que se remite refleja cuál se ha usado:

- **Por sustitución.** La rectificativa consigna los importes tal y como quedan después de corregir, y además informa de la base y la cuota rectificadas. Es la más legible para el cliente: la factura buena es la que tiene en la mano.
- **Por diferencias.** La rectificativa consigna directamente el importe de la rectificación. Es más compacta y es la habitual en abonos parciales y regularizaciones.

La elección tiene consecuencias que suelen aparecer tarde:

1. **Los importes negativos dejan de ser un caso raro.** Por diferencias, el delta puede ser negativo. Un modelo de datos con importes sin signo, o una validación que rechaza cantidades menores que cero, revienta el primer día en producción. Es sorprendentemente frecuente.
2. **Hacen falta campos que la factura normal no tiene.** Por sustitución hay que arrastrar la base y la cuota rectificadas, que no existen en el flujo ordinario. Añadirlos después obliga a migrar.
3. **La operación no puede ser mixta.** Conviene decidir el criterio por tipo de operación y dejarlo documentado, en lugar de que dependa de quién emite.

Cuando el sistema es un [ERP propio o muy adaptado](/es/cumplimiento/verifactu/erp-a-medida/), esta es la conversación que más veces obliga a tocar tablas que llevaban años quietas. Y es mucho más barato tenerla en la fase de diseño que a mitad de implementación.

<h2 id="boton-unico">El botón único es el bug</h2>

Casi todo lo anterior es resoluble en el backend. El problema que no se resuelve ahí es el de la interfaz.

Si la persona que atiende en caja tiene un botón que dice «anular» y ninguno que diga «rectificar», va a pulsar «anular» siempre, porque es lo único que hay. Y no se equivoca: hace lo que el sistema le ofrece. El error es de diseño, y ninguna cantidad de formación lo corrige de forma sostenida.

Lo que funciona:

- **Separar los caminos y obligar a elegir**, con las dos opciones descritas en el lenguaje del negocio, no en el de la norma: «esta venta no llegó a producirse» frente a «esta venta se hizo pero el importe está mal».
- **Restringir por perfil.** No todo el mundo tiene por qué poder ejecutar ambos caminos. La anulación es una operación menos frecuente y más delicada.
- **Registrar quién y por qué.** Un motivo obligatorio y trazable, que es además lo que después permite explicar una serie con muchas anulaciones.
- **Impedir la ruta imposible.** Si un registro está en un estado que no admite la operación, el sistema debe decirlo antes, no fallar después.

Sobre ese último punto hay un matiz que merece atención: **el estado de envío condiciona la respuesta**. Un registro puede estar generado y no remitido, remitido y sin confirmar, o confirmado. Anular no es lo mismo en los tres casos, y un sistema que no distingue «no enviado» de «enviado y sin respuesta» acabará duplicando registros o generando anulaciones de altas que nunca llegaron. Por eso el estado por registro, con idempotencia en la cola de remisión, no es un lujo de observabilidad: es lo que permite responder correctamente a una anulación. Es una de las razones por las que insistimos tanto en el diseño de [la capa de integración con el servicio de la AEAT](/es/cumplimiento/verifactu/api/).

<h2 id="caja">Lo que se rompe en caja</h2>

En un TPV, la casuística llega más rápido y con menos margen. Tres situaciones que aparecen siempre:

**La devolución del mismo día.** Antes se «anulaba» el ticket y el arqueo cuadraba. Ahora la venta ocurrió, el registro se generó y —si operas en modalidad VERI*FACTU— ya está remitido en cuestión de segundos. Lo que corresponde es el camino de rectificación o abono, no la anulación. El personal de tienda necesita saberlo, y la interfaz tiene que llevarle ahí.

**El ticket de prueba.** Probar el TPV emitiendo una venta ficticia deja de ser inocuo. Hace falta un entorno de pruebas de verdad, separado, que no escriba en la cadena de producción.

**El cierre de caja.** El arqueo dejará de ser «facturas emitidas menos anuladas», porque las anulaciones ya no restan del conteo: se suman como registros. Los informes internos que asumían la lógica anterior van a dar cifras raras el primer mes, y alguien va a pensar que el conector está mal cuando lo que está mal es el informe.

<h2 id="casuistica">La casuística que conviene tener escrita</h2>

Antes de escribir código, este es el documento que ahorra semanas. Cada línea es una pregunta que hay que responder con la asesoría, no una decisión técnica:

- Devolución total y devolución parcial de una venta.
- Error en los datos fiscales del cliente, con y sin cambio de importe.
- Factura duplicada por un fallo de integración.
- Descuento o abono concedido después de emitir.
- Impago que da lugar a modificación de la base imponible.
- Rectificación de una factura simplificada.
- Rectificación de una rectificativa.
- Anulación solicitada cuando el registro aún no se ha remitido.
- Operación registrada en un punto de emisión que estuvo offline.

Nueve líneas. Ninguna es exótica, todas ocurren, y cada una define un camino en el sistema. Cuando abordamos la [integración de Verifactu sobre un sistema de facturación que ya existe](/es/cumplimiento/verifactu/), esta tabla se cierra en la fase de auditoría, antes del diseño del conector —porque es justo lo que determina si el proyecto dura cuatro semanas o siete—.

---

*Información técnica sobre implementación de sistemas. No constituye asesoramiento fiscal ni jurídico. La calificación de cada supuesto como anulación o rectificación, y la elección de la clave de tipo, corresponden a tu asesoría.*
