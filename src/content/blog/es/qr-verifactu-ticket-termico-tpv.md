---
title: "El QR de Verifactu en un ticket de 58 mm: dónde se rompe la implementación"
seoTitle: "QR Verifactu en ticket térmico: 30 a 40 mm"
description: "La norma pide un QR de entre 30 y 40 mm. En un ticket térmico de 58 mm eso es casi todo el ancho útil. Qué decidir sobre módulos, impresora y plantillas."
category: compliance
articleSection: "Cumplimiento normativo"
date: 2026-08-10T11:00:00+02:00
tags:
  - QR Verifactu
  - ticket térmico TPV
  - Orden HAC/1177/2024
  - impresora térmica ESC/POS
  - factura verificable AEAT
  - cumplimiento normativo empresas
about:
  - type: Thing
    name: "Real Decreto 1007/2023, Reglamento de sistemas informáticos de facturación"
locale: es
translationKey: verifactu-qr-ticket
related:
  - series-y-cadena-de-huellas-verifactu
  - anulaciones-y-rectificativas-verifactu
author: "Luiz Fernando Brazão"
authorTitle: "Fundador de IA Operators"
authorUrl: "https://iaoperators.com/es/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
draft: false
ctaTitle: "¿En cuántas plantillas se imprime hoy tu factura?"
ctaText: "El test de Verifactu son ocho preguntas y dos minutos, y te devuelve tu brecha obligación por obligación —el QR incluido—. No pide email para ver el resultado."
ctaPrimaryLabel: "Hacer el test de Verifactu"
ctaPrimaryHref: "/es/cumplimiento/verifactu/test/"
faq:
  - q: "¿Qué tamaño tiene que tener el QR de Verifactu?"
    a: "La Orden HAC/1177/2024 fija un cuadrado de entre 30 x 30 y 40 x 40 milímetros, conforme al estándar ISO/IEC 18004 y con nivel de corrección de errores medio. Es un rango estrecho y en un ticket térmico de 58 milímetros consume la mayor parte del ancho imprimible, así que conviene diseñar cerca del mínimo."
  - q: "¿El QR incluye la huella o hash del registro?"
    a: "No. Codifica la URL del servicio de cotejo de la AEAT junto con el NIF del emisor, la serie y número de la factura, su fecha de expedición y el importe total. Eso tiene una consecuencia práctica muy útil: el punto de venta puede imprimir el QR sin depender del encadenamiento, porque no necesita conocer el registro anterior."
  - q: "¿Puedo usar el generador de QR que trae la impresora térmica?"
    a: "Si el modelo soporta el comando nativo de códigos QR del juego ESC/POS, suele ser la mejor opción: la impresora dibuja los módulos alineados a su propia rejilla de puntos y evita el emborronado típico de una imagen reescalada. Hay que comprobar dos cosas antes: que permita fijar el nivel de corrección de errores exigido y que el tamaño de módulo disponible deje el símbolo dentro del rango de milímetros de la norma."
  - q: "¿Hay que imprimir también un texto además del QR?"
    a: "Sí. Las facturas expedidas por sistemas VERI*FACTU deben incluir la mención «Factura verificable en la sede electrónica de la AEAT» o «VERI*FACTU», con un tamaño de letra claramente visible y coherente con el resto de datos de la factura. En un ticket estrecho, la versión corta es la que cabe sin partirse en dos líneas."
---

El QR de Verifactu no es un problema difícil. Es un problema pequeño repetido en ocho plantillas distintas, y una de ellas mide 58 milímetros de ancho.

> **En 30 segundos:** la norma pide un cuadrado de entre 30 y 40 milímetros. Un rollo térmico de 58 milímetros deja unos 48 imprimibles, así que el QR se come más de la mitad del ticket y el margen de maniobra es casi nulo. La buena noticia es que el QR codifica NIF, serie y número, fecha e importe —no la huella—, así que no depende de la cadena de registros y se puede imprimir en el acto. La mala es que el tamaño físico no se elige: se deriva del número de módulos y del tamaño de punto de la impresora, y esa aritmética hay que hacerla antes de comprar nada.

<nav aria-label="Tabla de contenidos">

**En este artículo**

1. [Qué exige exactamente la norma](#que-exige)
2. [Por qué el ticket de 58 mm es el punto de rotura](#58mm)
3. [No se eligen milímetros, se eligen módulos](#modulos)
4. [Generarlo en la impresora o mandarlo como imagen](#escpos)
5. [La mención es la otra mitad del artículo](#mencion)
6. [Las plantillas que nadie recuerda](#plantillas)
7. [La única prueba de aceptación que vale](#prueba)

</nav>

<h2 id="que-exige">Qué exige exactamente la norma</h2>

El artículo 21 de la [Orden HAC/1177/2024](https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138), que desarrolla las especificaciones técnicas del [Real Decreto 1007/2023](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840), fija tres cosas sobre el código:

- **Tamaño:** un cuadrado de entre 30 x 30 y 40 x 40 milímetros.
- **Estándar:** ISO/IEC 18004, con nivel de corrección de errores medio.
- **Contenido:** la URL del servicio de cotejo, el NIF del emisor, la serie y número de la factura, su fecha de expedición y el importe total.

La ubicación y presentación concretas dentro de la factura se remiten a la documentación técnica de la Agencia Tributaria, que es donde hay que ir a mirarlas —no a un artículo, ni a la memoria de nadie—.

Merece la pena detenerse en el contenido, porque es la única parte del reglamento que simplifica la vida en lugar de complicarla: **el QR no lleva la huella del registro**. Codifica datos que el punto de emisión ya tiene en el momento de cobrar. Eso significa que se puede generar e imprimir sin consultar nada, sin esperar a la AEAT y sin depender del eslabón anterior de la cadena. Es un problema independiente del [encadenamiento y la estrategia de series](/es/blog/series-y-cadena-de-huellas-verifactu/), y tratarlos por separado evita arrastrar la complejidad de uno al otro.

<h2 id="58mm">Por qué el ticket de 58 mm es el punto de rotura</h2>

Hagamos la cuenta, que es donde se ve el problema.

Un rollo térmico de 58 milímetros no imprime 58 milímetros: el área útil típica ronda los 48. En un cabezal estándar de 203 puntos por pulgada eso son unos 384 puntos de ancho, a razón de ocho puntos por milímetro.

El mínimo legal, 30 milímetros, son 240 puntos. El máximo, 40 milímetros, son 320. Es decir: **el QR ocupa entre el 62 % y el 83 % del ancho imprimible del ticket**. Cabe, pero no sobra nada. Y ese ticket también tiene que llevar la mención textual, el desglose, la razón social y todo lo demás.

En un rollo de 80 milímetros —unos 72 imprimibles, 576 puntos— la conversación no existe: el QR entra holgado y queda sitio para maquetar. Por eso la primera pregunta al abrir el proyecto de un [TPV repartido en varias tiendas](/es/cumplimiento/verifactu/tpv-multitienda/) no es de software: es qué rollo usa cada caja. Si hay parque mezclado de 58 y 80, hay dos plantillas, no una.

<h2 id="modulos">No se eligen milímetros, se eligen módulos</h2>

Aquí está el detalle que hace que esto falle en producción después de haber funcionado en la maqueta.

Un QR es una rejilla de módulos —los cuadraditos— y su cantidad depende de cuántos datos codificas y del nivel de corrección de errores. Más caracteres, más módulos. Una impresora térmica no dibuja milímetros: dibuja puntos. El tamaño físico del símbolo es, por tanto, el resultado de una multiplicación:

> módulos por lado × puntos por módulo ÷ 8 = milímetros

Y esa multiplicación solo da números limpios si los puntos por módulo son un entero. Si el generador produce una imagen y el driver la reescala para «que quepa», cada módulo acaba ocupando 4,5 o 5,3 puntos, el cabezal redondea, unos módulos salen más gordos que otros y el lector empieza a fallar de forma intermitente. Intermitente es la palabra clave: funciona en el laboratorio y falla en la caja tres de la tienda dos.

Un ejemplo con números concretos. Supongamos que el contenido cabe en una versión de 45 x 45 módulos, y que el estándar añade una zona de silencio de 4 módulos a cada lado —53 módulos de borde a borde—:

| Puntos por módulo | Símbolo | Con zona de silencio |
| --- | --- | --- |
| 4 | 22,5 mm | 26,5 mm |
| 5 | 28,1 mm | 33,1 mm |
| 6 | 33,8 mm | 39,8 mm |
| 7 | 39,4 mm | 46,4 mm |

Con 4 puntos por módulo te quedas fuera por abajo. Con 7 te sales por arriba y además no cabe en el rollo. Con 5 el símbolo mide 28,1 y el conjunto 33,1: **está por debajo del mínimo o dentro del rango según qué se considere medido**, y ese es exactamente el tipo de ambigüedad que no conviene dejar abierta. Con 6 ambas lecturas caen dentro del rango, y consume 318 de los 384 puntos disponibles.

De ahí salen dos reglas de diseño:

1. **Fija los puntos por módulo, no los milímetros.** Y verifica que las dos lecturas —con y sin zona de silencio— quedan dentro de la ventana legal. Es la forma barata de no depender de una interpretación.
2. **Acota la longitud del contenido.** El número de módulos depende de los datos, y los datos varían factura a factura: una serie larga o un importe con más dígitos pueden empujar el símbolo a la siguiente versión y cambiarle el tamaño. Si tus series se llaman `TIENDA-CENTRO-2027-A`, ese nombre te está costando milímetros en cada ticket.

Lo segundo suele sorprender, porque conecta una decisión aparentemente administrativa —cómo nombras las series— con un fallo físico de impresión.

<h2 id="escpos">Generarlo en la impresora o mandarlo como imagen</h2>

Hay dos caminos y no son equivalentes.

**El comando nativo.** La mayoría de impresoras térmicas modernas entienden el juego de comandos ESC/POS e incluyen una instrucción para imprimir un QR a partir del texto, con el tamaño de módulo y el nivel de corrección como parámetros. Es la opción preferible: la impresora dibuja los módulos alineados a su propia rejilla, sin reescalados ni interpolación, y el resultado es nítido. Antes de casarse con ella hay que verificar dos cosas en el modelo concreto: que permita fijar el nivel de corrección de errores que exige la norma, y que alguno de los tamaños de módulo disponibles deje el símbolo dentro del rango de milímetros.

**La imagen rasterizada.** Generas el QR en tu sistema y lo envías como mapa de bits. Da control total sobre el resultado, y es la única salida cuando la impresora no soporta el comando nativo o no ofrece los parámetros adecuados. Exige disciplina: la imagen tiene que ser de un bit —blanco y negro puro, sin escala de grises ni antialiasing—, generada ya al tamaño exacto en puntos, y enviada sin que ninguna capa intermedia la reescale. El tramado que un driver aplica alegremente a una foto convierte los módulos de un QR en ruido.

Un tercer factor, que no es de software y estropea implementaciones correctas: **la calidad térmica**. El nivel de corrección de errores medio tolera una degradación moderada del símbolo, pero no es infinito. Un cabezal desgastado, una temperatura de impresión demasiado baja o papel barato reducen el contraste, y el margen que da la corrección se consume antes de lo previsto. Si el parque de impresoras tiene años, esto entra en el plan de pruebas.

<h2 id="mencion">La mención es la otra mitad del artículo</h2>

El QR no viaja solo. El artículo 20 de la misma orden exige que las facturas expedidas por sistemas VERI*FACTU incluyan la mención «Factura verificable en la sede electrónica de la AEAT» o, alternativamente, «VERI*FACTU», con un tamaño de letra claramente visible y coherente con el resto de los datos de la factura.

En un ticket de 58 milímetros con fuente estándar caben unos 32 caracteres por línea. La frase larga tiene 52: se parte en dos líneas y, si el maquetado no lo previó, se corta por donde no debe. La versión corta cabe entera. No es una decisión estética —es la que determina si la mención se lee de un vistazo o queda troceada—.

Y ojo con la tentación de encogerla. «Claramente visible» y «coherente con el resto de datos» descartan la solución de reducir la fuente a un cuerpo microscópico para ganar espacio. Si no cabe, lo que hay que revisar es el resto de la plantilla.

<h2 id="plantillas">Las plantillas que nadie recuerda</h2>

Cuando preguntamos «¿en cuántos sitios se imprime una factura vuestra?», la respuesta inicial suele ser dos. La real, después de mirar, ronda las seis. El inventario típico:

- **El ticket del TPV**, en sus dos anchos si el parque es mixto.
- **El PDF A4** que genera el ERP para clientes de empresa.
- **La factura del canal online**, con su propia plantilla heredada de la plataforma de [e-commerce](/es/cumplimiento/verifactu/ecommerce-propio/).
- **El correo de confirmación** que adjunta el PDF —y a veces incrusta una versión en el cuerpo del mensaje—.
- **El portal del cliente**, donde la factura se descarga o se ve en pantalla.
- **El duplicado o la reimpresión**, que es la que más veces se olvida y la que, por definición, tiene que llevar el mismo QR que el original.

Cada una de esas salidas es un punto de fallo independiente. En proyectos reales, el QR aparece correctamente en el PDF principal desde la primera semana y tarda otras tres en llegar a la reimpresión del TPV y al portal, porque son código que nadie ha tocado en años. Merece la pena hacer el inventario al principio, cuando todavía es una lista y no una sorpresa.

<h2 id="prueba">La única prueba de aceptación que vale</h2>

Se puede validar un QR de muchas maneras en un test automatizado: comprobar que decodifica, que los campos son los correctos, que la versión y el nivel de corrección son los esperados. Todo eso es necesario y no es suficiente, porque ninguna de esas pruebas toca papel.

La prueba que cierra el asunto es analógica y dura treinta segundos: **imprimir el ticket en la impresora real, con el rollo real, y escanearlo con un móvil corriente**. Si resuelve al servicio de cotejo de la Agencia y devuelve la factura, está. Si hace falta acercar mucho, girar el papel o probar tres veces, no está —aunque el test unitario pase—.

Conviene repetirla en las condiciones peores que tenga la operación: la impresora más vieja, el final del rollo, la tienda con menos luz. Y volver a hacerla cuando se cambie de proveedor de papel, que es un cambio que nadie comunica al equipo técnico.

Es un detalle pequeño dentro de un proyecto que tiene partes bastante más difíciles —la cola de remisión, la inalterabilidad del registro, la declaración responsable—. Pero es el único que el cliente ve impreso en la mano, y por eso es el que genera la llamada. Cuando montamos el módulo de [cumplimiento de Verifactu sobre el sistema de facturación que la empresa ya tiene](/es/cumplimiento/verifactu/), la validación en papel de todas las plantillas entra en el alcance desde el primer día, precisamente porque parece trivial hasta que no lo es.

---

*Información técnica sobre implementación de sistemas. No constituye asesoramiento fiscal ni jurídico. Las especificaciones concretas de ubicación y presentación del código deben tomarse de la documentación técnica publicada por la Agencia Tributaria.*
