# Auditoría e implementación — 30 de septiembre de 2026

## Alcance y punto de partida

Se revisaron los archivos actuales de la raíz, incluidos cambios previos sin commit. La web pública mostró una comprobación del navegador y no pudo auditarse de forma completa. Las pruebas funcionales se realizaron sobre una vista previa local; no se publicó esta revisión ni se modificó la copia antigua de Hostinger.

La documentación anterior describía una versión oscura con recursos ficticios. La implementación real ya era luminosa, con violetas, tipografía de sistema/Inter, fotografía personal, 12 proyectos reales y contacto funcional. Esa implementación fue la base del trabajo.

## Diagnóstico previo y prioridades

| Hallazgo concreto | Impacto | Esfuerzo | Resolución |
| --- | --- | --- | --- |
| La ruleta calculaba anchos de bloques y no se recalculaba al redimensionar; el titular podía perder su segunda palabra en móvil | Alto | Bajo | Texto inicial estático, anchura intrínseca, medición tras cargar fuentes y al redimensionar; nombre accesible estable |
| El velo de fondo quedaba delante del video del hero y disminuía su contraste | Alto | Bajo | Corregida la jerarquía de capas del hero |
| La altura mínima de escritorio recortaba el video horizontal en tablet | Alto | Bajo | Proporción reservada y reproducción sin recorte |
| Hero con autoplay/preload intensivo, sin póster y solo botón de sonido | Alto | Medio | Póster real, controles nativos, carga diferida y pausa al salir de pantalla; autoplay sujeto a preferencias |
| La galería solicitaba metadatos de todos los videos; varios archivos pesan entre 16 y 37 MB | Alto | Medio | Previews sin src hasta interacción, pósteres reales y una preview activa por vez |
| Destacados sin títulos visibles; información difícil de evaluar antes de abrir | Alto | Medio | Nombre, categoría y duración visibles; ficha con descripción y formato; crédito de rol opcional confirmado |
| Modal de proyectos con aria-modal pero sin aislamiento nativo del fondo | Alto | Medio | Dialog nativo, Escape, restauración de foco y ciclo de Tab explícito |
| JavaScript seguía animando ruleta, previews y paralaje con movimiento reducido | Alto | Medio | Preferencia compartida, estilos de reducción y controles de pausa; eliminada la interceptación de la rueda |
| Servicios con tarjetas de igual peso y fondos intensos debajo del texto | Medio | Medio | Índice editorial con títulos más claros, acentos de color conservados y ejemplos reales |
| Contacto exigía atravesar el formulario para iniciar conversación desde esa página | Alto | Bajo | WhatsApp y correo directos; datos opcionales agrupados |
| Etiquetas con contraste bajo y controles pequeños | Medio | Bajo | Texto secundario más oscuro y controles clave de al menos 44 px |
| Contacto ausente del sitemap y sin metadatos sociales | Medio | Bajo | Añadidos; canonical y metadatos existentes conservados |

## Qué se conservó

Paleta principal, familia tipográfica, retrato, titular de palabras alternadas, fondos violetas, esquinas de encuadre, cuatro especialidades, biografía y metodología existentes. Se conservaron todos los proyectos y archivos de video, incluido el archivo Raldyy que no estaba publicado en el catálogo. No se añadieron clientes, testimonios, resultados, años de experiencia ni créditos no confirmados.

Se mantiene literalmente la inversión superior a US$200 y sus condiciones, los rangos del formulario, correo actual, WhatsApp y enlaces sociales existentes. Las fichas aceptan `rol`, `categoria`, `formatos`, `poster` e identificadores estables; los roles se dejan vacíos hasta confirmarlos.

## Verificaciones realizadas

- Inicio, proyectos y contacto: anchos de 320, 390, 768 y 1440 px; sin desbordamiento horizontal de documento en los doce casos. Inspección visual de escritorio, tablet y móvil en el navegador integrado.
- Se abrieron las doce piezas en el reproductor. Todas llegaron a readyState 4 sin error de medios; las de mayor tamaño se comprobaron de nuevo tras terminar de cargar. Se comprobaron dimensiones reales de los archivos con AVFoundation.
- Conservados cinco proyectos horizontales y siete verticales. Archivos y pósteres presentes para los doce registros.
- Flechas del teclado cambian pestaña, selección y tabIndex; el grupo horizontal muestra cinco proyectos.
- Escape cierra la ficha y devuelve el foco al control que la abrió. Shift+Tab desde cerrar vuelve al enlace final de la ficha.
- Pausa global detiene hero y movimiento. Controles nativos permanecen disponibles para reproducir por decisión del visitante.
- Formulario vacío: validación nativa enfoca nombre e impide continuar. Nombre y presupuesto actualizan el resumen. Se rellenaron datos de prueba locales sin enviar mensajes.
- Scripts modificados pasan comprobación de sintaxis. No se instalaron dependencias.
- Se conserva acceso a videos originales mediante HTML de respaldo si JavaScript está desactivado; el titular también tiene contenido estático. Este respaldo se verificó en el código, no desactivando JavaScript en el navegador.
- `prefers-reduced-motion` se revisó en CSS y lógica de reproducción/animación; el navegador de prueba no expuso emulación de esa preferencia. La pausa manual sí se comprobó funcionalmente.

Capturas en `docs/qa/`.

## Límites y siguientes pasos concretos

1. **Producción y Core Web Vitals:** no se dispone de medición de campo ni de Lighthouse de la versión publicada. No se atribuyen puntuaciones ni mejoras porcentuales. La vista local no representa latencia móvil, caché, compresión ni soporte de rangos del hosting. Verificar LCP, INP y CLS después de publicar y con tráfico real.
2. **Videos:** se usan los MP4 originales. No existen versiones adaptativas confirmadas. Los pósteres y la carga por interacción reducen las solicitudes iniciales, pero las piezas grandes siguen pesando lo mismo cuando se reproducen. Conviene preparar copias web comprimidas aprobadas conservando los originales. No se inventaron subtítulos: cualquier transcripción requiere revisar el audio y aprobar su contenido.
3. **Correo profesional:** se propone `hola@fernansmotion.com`, pendiente de crear y probar el buzón. El sitio conserva el Hotmail operativo. No se modificaron DNS ni cuentas.
4. **Roles:** completar créditos por proyecto con información del autor. Los campos están preparados y solo aparecen si contienen información.
5. **Compatibilidad:** pruebas en el navegador integrado de escritorio con tamaños adaptables; no sustituyen pruebas físicas en Safari/iOS y Chrome/Android, lectores de pantalla ni una certificación de accesibilidad.
6. **Publicación:** los archivos de trabajo están en la raíz. La carpeta y el ZIP anteriores de Hostinger no incorporan estos cambios. No subir esas copias antiguas pensando que contienen esta revisión.
