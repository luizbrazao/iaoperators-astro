---
title: "Modernizar un sistema legado sin reescribirlo: por dónde se empieza"
seoTitle: "Modernizar un sistema legado: por dónde empezar"
description: "Las siete opciones clásicas, las tres que de verdad se usan, y el problema del que nadie habla: las reglas de negocio solo existen dentro del código viejo."
category: others
articleSection: "Integración de sistemas"
date: 2026-08-11T09:00:00+02:00
tags:
  - sistemas legados
  - modernización de software
  - software a medida
  - integración de sistemas
  - deuda técnica
  - empresas medianas
about:
  - type: Thing
    name: "Modernización de sistemas legados"
locale: es
translationKey: modernizar-sistema-legado
related:
  - auditoria-de-sistemas-tecnologicos
  - como-integrar-un-erp-metodos
  - que-es-un-roadmap-tecnologico
author: "Luiz Fernando Brazão"
authorTitle: "Fundador de IA Operators"
authorUrl: "https://iaoperators.com/es/autores/luiz-fernando-brazao/"
authorSameAs:
  - "https://www.linkedin.com/in/ferbrazao/"
draft: false
ctaTitle: "¿Sabes qué reglas viven solo dentro del sistema viejo?"
ctaText: "Empezamos por ahí: recuperar lo que hace, ponerle una capa que traduzca y sacar funciones de una en una. Sin fecha única de corte y sin parar la operación."
ctaPrimaryLabel: "Ver integración de sistemas legados"
ctaPrimaryHref: "/es/integracion/sistemas-legados/"
faq:
  - q: "¿Qué es un sistema legado?"
    a: "Un sistema que sigue siendo crítico para la operación y que a la vez se ha vuelto difícil de cambiar: porque la tecnología está obsoleta, porque el proveedor ya no lo mantiene, o porque la única persona que lo entendía se fue. Legado no significa malo — significa que funciona y que nadie se atreve a tocarlo. Esas dos cosas juntas son las que crean el problema."
  - q: "¿Cuáles son las opciones para modernizar un sistema heredado?"
    a: "El marco clásico enumera siete: encapsular, rehospedar, replataformar, refactorizar, rearquitecturar, reconstruir y reemplazar. En proyectos reales de empresa mediana casi todo se resuelve con tres —encapsular, refactorizar por partes y reemplazar módulos concretos—, y muchas veces con las tres a la vez sobre distintas partes del mismo sistema. Las opciones de infraestructura resuelven dónde se ejecuta, que rara vez es el problema de negocio."
  - q: "¿Es mejor reescribir el sistema desde cero?"
    a: "Casi nunca, y no por motivos técnicos. La reescritura obliga a mantener dos sistemas en paralelo durante meses, a redescubrir reglas de negocio que solo existen dentro del código viejo, y a aguantar un proyecto largo sin entregas visibles. Compensa cuando el proveedor ha desaparecido, cuando la tecnología impide cumplir una obligación legal que no se puede resolver por fuera, o cuando mantenerlo ya cuesta más que rehacerlo."
  - q: "¿Se puede integrar un sistema legado que no tiene API?"
    a: "Casi siempre. Las vías, de mejor a peor: lectura de una réplica de su base de datos, detección de cambios por marca de tiempo o tabla de auditoría, ficheros de intercambio en una carpeta acordada y, como último recurso, automatización de la interfaz de pantalla. Lo que decide la viabilidad no es la edad del sistema, es si existe alguna forma controlada de leer y de escribir."
  - q: "¿Cuánto tarda modernizar un sistema legado?"
    a: "La capa de traducción y la primera función sacada del sistema antiguo suelen estar en producción en cuatro a ocho semanas. La sustitución completa, si se decide hacerla, se mide en trimestres y por diseño no tiene fecha única de corte: cada función que sale es una entrega en sí misma. Esa es la ventaja frente a la reescritura, no un efecto secundario."
---

Todo el mundo que vende modernización de sistemas legados publica la misma lista de opciones. Ninguna de esas listas resuelve el problema real, que aparece la primera semana del proyecto: nadie sabe exactamente qué hace el sistema viejo.

> **En 30 segundos:** el marco clásico enumera siete opciones y en la práctica se usan tres, muchas veces simultáneamente sobre partes distintas del mismo sistema. La reescritura completa es la que más se propone y la que peor sale, por motivos que no son técnicos. Lo que de verdad bloquea estos proyectos es que las reglas de negocio solo existen dentro del código viejo y la persona que lo escribió ya no está. Recuperarlas es la primera fase, es arqueología más que programación, y conviene presupuestarla como tal.

<nav aria-label="Tabla de contenidos">

**En este artículo**

1. [Legado no significa malo](#legado)
2. [Las siete opciones y las tres que se usan](#opciones)
3. [Por qué la reescritura sale mal](#reescritura)
4. [El problema del que nadie habla](#reglas)
5. [Cómo se hace la arqueología](#arqueologia)
6. [Se empieza por los bordes, no por el núcleo](#bordes)
7. [Cómo saber si vas bien](#senales)

</nav>

<h2 id="legado">Legado no significa malo</h2>

Un sistema legado no es un sistema mal hecho. Es uno que cumple dos condiciones a la vez: **sigue siendo crítico para la operación** y **se ha vuelto difícil de cambiar**. Cualquiera de las dos por separado no es un problema; juntas sí.

La segunda condición puede venir de sitios distintos, y conviene saber de cuál viene el tuyo porque cambia la estrategia:

- **Tecnología obsoleta.** El lenguaje o la plataforma ya no tienen soporte, o no queda quien programe en ellos.
- **Proveedor desaparecido.** El sistema funciona pero nadie puede evolucionarlo, y cada cambio es una negociación o una imposibilidad.
- **Conocimiento perdido.** El sistema es moderno pero lo escribió alguien que ya no está y no dejó documentación. Este caso sorprende a quien lo sufre: se puede tener un sistema legado de cinco años.
- **Miedo acumulado.** Funciona, nadie sabe por qué, y cada cambio se prueba en producción a las siete de la mañana. Técnicamente no está obsoleto; en la práctica está congelado.

Los dos últimos son los más frecuentes en empresas medianas, y son los que peor encajan con la conversación habitual del mercado, que asume que el problema es la tecnología.

<h2 id="opciones">Las siete opciones y las tres que se usan</h2>

El marco que casi todo el mundo cita enumera siete caminos: **encapsular, rehospedar, replataformar, refactorizar, rearquitecturar, reconstruir y reemplazar**. Es una taxonomía correcta y sirve para ordenar la conversación. Lo que no dice es cuál te toca.

En proyectos reales de empresa mediana, la lista se reduce mucho:

**Encapsular.** Se le pone delante una capa que traduce, y los sistemas nuevos hablan con ella y nunca con el sistema viejo. Es lo primero que se hace casi siempre, porque es barato, reversible y no toca el legado por dentro. Su valor no es técnico: es que a partir de ahí las rarezas del sistema antiguo —códigos numéricos, campos con doble significado, fechas en formatos propios— quedan encerradas en un solo sitio en lugar de contagiarse a cada nueva integración.

**Refactorizar por partes.** Las funciones salen del sistema viejo de una en una, y la capa que va delante decide en cada momento si una petición va al sistema nuevo o al antiguo. El sistema viejo se apaga cuando ya no hace nada, no en una fecha señalada en un plan.

**Reemplazar módulos concretos.** Cuando una parte tiene sustituto claro de mercado —nóminas, contabilidad, facturación— se cambia esa pieza y se conecta, en lugar de arrastrarla.

Las otras cuatro no son inútiles, pero resuelven una pregunta distinta: **dónde se ejecuta el sistema**, no qué hace. Mover una aplicación antigua a la nube tal cual la deja igual de rígida, solo que en otro sitio y con otra factura. A veces hay motivos buenos para hacerlo —el centro de datos se cierra, el hardware ya no tiene repuestos—, pero conviene no confundirlo con modernizar.

<h2 id="reescritura">Por qué la reescritura sale mal</h2>

Rehacerlo todo desde cero es la propuesta más frecuente y la más atractiva, porque promete terminar con el problema en lugar de convivir con él. Falla por cuatro motivos, y ninguno es técnico:

**Hay que mantener dos sistemas a la vez.** Durante meses, el viejo sigue operando y el nuevo se construye. Cada cambio de negocio que ocurre en ese periodo —y ocurren— hay que hacerlo dos veces.

**Se descubren reglas a mitad de camino.** El sistema viejo hace cosas que nadie recordaba: una excepción para un cliente concreto, un redondeo particular, un caso que solo se da en agosto. Aparecen cuando ya hay una fecha comprometida.

**No hay entregas visibles.** Durante meses no se puede enseñar nada que funcione de punta a punta. Es cuando el proyecto pierde el apoyo de dirección, y es lo que convierte un retraso en una cancelación.

**El día del cambio es un evento con todo el riesgo concentrado.** Todo lo que puede salir mal sale mal a la vez, y a menudo un viernes.

La alternativa que sí funciona es aburrida, y esa es exactamente su virtud: cada paso entrega valor, cada paso es reversible, y no hay ningún día señalado en el calendario en el que todo tenga que salir bien.

<h2 id="reglas">El problema del que nadie habla</h2>

Aquí está la parte que las páginas de servicio no mencionan porque no se vende bien.

En un sistema antiguo, **buena parte de las reglas de negocio no está escrita en ningún sitio salvo dentro del código**. No están en un manual, no están en un procedimiento y no están completas en la cabeza de nadie. Están repartidas en condiciones, excepciones y valores por defecto que alguien puso hace doce años por una razón que entonces era obvia.

Y hay un agravante: **algunas de esas reglas ya no son correctas**. Reflejan cómo funcionaba el negocio cuando se escribieron. Nadie las ha revisado porque nadie sabía que existían. Cuando salen a la luz, la pregunta no es solo cómo replicarlas — es si hay que replicarlas.

Esto tiene dos consecuencias prácticas que conviene aceptar antes de firmar nada:

1. **La primera fase no es técnica, es de descubrimiento**, y hay que presupuestarla. Un proyecto que asume que las reglas se conocen empieza con un error de estimación que crece durante meses.
2. **Documentar lo que se descubre es un entregable**, no una cortesía. Es, muchas veces, el activo más valioso que deja el proyecto — más que el código nuevo.

<h2 id="arqueologia">Cómo se hace la arqueología</h2>

Cuando no hay documentación ni queda quien lo escribiera, las reglas se reconstruyen desde tres fuentes, en este orden:

**Los datos.** Es la fuente más fiable porque no opina. Mirando los registros históricos se ven los patrones reales: qué combinaciones existen y cuáles no, qué valores aparecen siempre juntos, dónde hay excepciones sistemáticas. Un campo que en teoría admite diez valores y en la práctica solo tiene tres te está diciendo algo.

**El comportamiento observado.** Ejecutar el sistema con casos preparados y anotar qué hace. Es lento y es la única forma de capturar la lógica de las ramas raras.

**Las personas, al final y con cuidado.** Quien usa el sistema a diario sabe qué hace, pero cuenta el proceso ideal, no el real — y omite sin querer las excepciones que ejecuta en automático. Sus respuestas son mejores como hipótesis a contrastar contra los datos que como especificación.

Un aviso sobre el orden: empezar por las entrevistas es lo más rápido y lo que más veces produce una especificación que parece completa y no lo es. Los datos primero, las conversaciones después para explicar lo que los datos ya mostraron.

Si el punto de partida es aún más difuso —no está claro ni cuántos sistemas hay ni cuáles se hablan entre ellos—, el paso previo es una [auditoría de sistemas](/es/blog/auditoria-de-sistemas-tecnologicos/) que ponga el inventario encima de la mesa.

<h2 id="bordes">Se empieza por los bordes, no por el núcleo</h2>

La tentación es atacar primero el módulo central, porque es el importante. Es la forma más rápida de que el proyecto se pare a mitad.

El orden que funciona es el contrario, y responde a tres criterios:

- **Pocas dependencias.** Cuantas menos cosas dependan de esa función, menos superficie de rotura.
- **Dolor alto.** Algo que moleste de verdad hoy, para que la primera entrega se note.
- **Reversibilidad.** Que se pueda volver atrás sin drama si algo sale mal.

Los informes y las consultas suelen cumplir los tres, y por eso son un buen primer paso: se sacan del sistema viejo sin tocarlo, entregan valor visible en semanas y no ponen en riesgo nada.

Las funciones que **escriben** vienen después, cuando la capa de traducción ya está probada con lecturas. Y el núcleo transaccional va al final, o no va: cuando todo lo demás ha salido, muchas veces resulta que lo que queda dentro del sistema antiguo es lo bastante pequeño y estable como para dejarlo ahí. Terminar el proyecto sin apagar el legado no es un fracaso; a menudo es la decisión correcta, y solo se puede ver desde el final.

<h2 id="senales">Cómo saber si vas bien</h2>

Estos proyectos duran, así que hacen falta señales de progreso que no dependan de la sensación de nadie:

- **Número de funciones que ya no pasan por el sistema antiguo.** Sube de forma discreta y es el indicador más honesto.
- **Número de personas capaces de tocar cada parte.** Si sigue siendo una, el riesgo no ha bajado aunque el código sea nuevo.
- **Tiempo desde que se pide un cambio hasta que está en producción.** Es el motivo por el que se empezó el proyecto, y el que dirección entiende sin traducción.
- **Cuántas reglas de negocio hay documentadas** que antes no lo estaban.

La última es la que más se olvida y la que mejor mide si el proyecto está creando valor duradero. Un sistema nuevo con las mismas reglas escondidas —ahora en código moderno— es un legado más joven, no un problema resuelto.

---

**Si el sistema funciona y el problema es que está aislado**, envolverlo cuesta una fracción de sustituirlo y no pone en riesgo la operación. Los patrones concretos —capa de traducción, captura de cambios, sustitución por partes y qué hacer cuando no hay ninguna vía de datos— están en [integrar sistemas legados sin reemplazarlos](/es/integracion/sistemas-legados/). Y si lo que falta es decidir en qué orden atacar todo lo que hay pendiente, eso se resuelve antes con un [roadmap tecnológico](/es/blog/que-es-un-roadmap-tecnologico/).
