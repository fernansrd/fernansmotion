# fernansmotion

Portafolio estático de Fernan Valdez. HTML, CSS y JavaScript nativos, sin compilación ni dependencias nuevas.

## Vista previa

Desde la raíz: `python3 -m http.server 8765 --bind 127.0.0.1`. Abrir `http://127.0.0.1:8765`.

La implementación actual vive en `index.html`, `proyectos.html`, `contacto.html` y `assets/`. La carpeta y el ZIP `fernansmotion-hostinger` son copias previas; no se actualizaron ni publicaron en esta revisión. Para desplegar, empaquetar la implementación de la raíz y todos sus recursos, incluidos los nuevos scripts y pósteres.

## Añadir o editar un proyecto

Editar el catálogo compartido en `assets/proyectos.js`. Las dos galerías se generan desde ese catálogo. Conservar los nombres existentes y sus archivos originales.

Campos:

- `titulo`, `cliente`, `texto`, `chips`: contenido real aprobado.
- `video`: ruta del archivo, con espacios codificados como `%20`.
- `aspecto`: `h` o `v`, para agrupar por orientación.
- `dur`: duración visible.
- `id`: opcional; enlace estable como `proyectos.html#flowmind`. Por defecto deriva del archivo.
- `poster`: opcional; por defecto `assets/posters/<id>.jpg`. Extraerlo del video real.
- `categoria`: opcional; por defecto deriva de las etiquetas existentes.
- `formatos`: lista opcional de entregas realmente disponibles. Por defecto muestra la orientación del archivo publicado.
- `rol`: crédito confirmado. Se omite de la ficha cuando está vacío; no se deduce de la categoría.

Los créditos concretos aún no están documentados. `rol` se dejó vacío deliberadamente. No se anuncian versiones adaptativas que no existan.

La galería incluye un respaldo HTML dentro de `<noscript>`; actualizarlo también al cambiar el catálogo.

## Organización

- `assets/smooth-scroll.js`: motor de scrolling suave con inercia cinemática (Lenis-style), planeo de anclas, micro-inclinación por velocidad (tilt) y widget flotante con indicador SVG de progreso.
- `assets/home.js`: titular, portada, destacados y reveals.
- `assets/gallery.js`: galería completa y diálogo nativo.
- `assets/portfolio.js`: preferencias de movimiento, previews, fichas y errores de video.
- `assets/refinements.css`: ajustes compartidos y responsive sobre los estilos existentes.
- `assets/project-form.js`: resumen y preparación del mensaje de WhatsApp.
- `assets/posters/`: fotogramas JPEG derivados de los videos originales.

## Contacto y condiciones

Se conserva `fernansmotion@hotmail.com`, WhatsApp `18098047825`, el mínimo **superior a US$200**, los rangos y condiciones existentes. El formulario prepara una conversación; el visitante confirma el envío en WhatsApp.

Posible correo profesional: `hola@fernansmotion.com`. **Es una propuesta, no un buzón verificado ni activado.** Crear el buzón y comprobar recepción antes de reemplazar el correo actual en las páginas y metadatos. No publicar un enlace a un buzón inexistente.

Los enlaces sociales existentes se conservan en los pies de inicio y proyectos. Añadir otros solo con URLs confirmadas.

Diagnóstico, verificaciones y límites: `docs/AUDITORIA.md`.
