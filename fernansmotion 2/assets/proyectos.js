/* Datos de los proyectos — compartidos entre index.html y proyectos.html.
   Formatos y duraciones tomados de los archivos reales.
   aspecto: 'h' = horizontal (16:9), 'v' = vertical (9:16) */
const proyectos = [
  {
    titulo: "Reel principal",
    cliente: "fernansmotion",
    dur: "0:14",
    aspecto: "v",
    video: "assets/Work/REEL%20.mp4",
    chips: ["Showreel", "Vertical", "Edición"],
    texto: "El resumen de cómo trabajo: cortes que respiran, transiciones que no se notan hasta que las buscas, y tipografía que entra justo cuando tiene que entrar. Catorce segundos para decir lo que hago."
  },
  {
    titulo: "VulnAudit — Reel 01",
    cliente: "VulnAudit",
    dur: "0:59",
    aspecto: "h",
    video: "assets/Work/Vulnaudit-1.mp4",
    chips: ["Horizontal", "Tech", "2D/3D"],
    texto: "Ciberseguridad explicada sin tecnicismos visuales. Casi un minuto sostenido con ritmo alto y jerarquía clara: cada dato aparece cuando el ojo ya está listo para recibirlo."
  },
  {
    titulo: "VulnAudit — Reel 02",
    cliente: "VulnAudit",
    dur: "0:54",
    aspecto: "h",
    video: "assets/Work/Vulnaudit-2.mp4",
    chips: ["Horizontal", "3D", "Producto"],
    texto: "Segunda entrega de la misma familia visual. Aquí el peso está en el 3D de producto: iluminación controlada y movimientos de cámara cortos, sin adornos."
  },
  {
    titulo: "Lamarca",
    cliente: "Lamarca",
    dur: "0:23",
    aspecto: "v",
    video: "assets/Work/Lamarca.mp4",
    chips: ["Vertical", "Marca", "Comercial"],
    texto: "Narrativa de marca y visuales de producto en formato vertical. El reto era que el producto se viera premium sin caer en el cliché del render frío — la respuesta fue el timing, no el brillo."
  },
  {
    titulo: "Digo Network",
    cliente: "Digo",
    dur: "0:22",
    aspecto: "v",
    video: "assets/Work/digonetwork.mp4",
    chips: ["Vertical", "Tech", "Motion"],
    texto: "Paquete de motion graphics para una marca de tecnología y conectividad. Sistema modular: las mismas piezas sirven para redes, presentaciones y pantallas en evento."
  },
  {
    titulo: "Paleta de colores",
    cliente: "Estudio",
    dur: "0:15",
    aspecto: "v",
    video: "assets/Work/Paleta%20de%20colores.mp4",
    chips: ["Vertical", "Color", "Identidad"],
    texto: "Ejercicio de color en movimiento para identidad de marca. Quince segundos donde el color hace todo el trabajo narrativo y la forma solo lo acompaña."
  },
  {
    titulo: "Campaña de premios",
    cliente: "Premios",
    dur: "0:27",
    aspecto: "v",
    video: "assets/Work/premios.mp4",
    chips: ["Vertical", "Evento", "Campaña"],
    texto: "Visuales y edición para una campaña de premiación. Tono de gala sin rigidez: brillo medido, tipografía grande y transiciones que sostienen la emoción."
  },
{
    titulo: "Motion de interfaces",
    cliente: "Estudio",
    dur: "0:25",
    aspecto: "h",
    video: "assets/Work/motion-interface.mp4",
    chips: ["Horizontal", "UI Motion", "Composición"],
    texto: "Estudio de animación aplicada a interfaces: cómo el movimiento puede guiar la atención, dar retroalimentación y hacer que una pantalla se sienta viva. Cada transición tiene un propósito funcional, no solo estético."
},
{
    titulo: "Teaser — Soon",
    cliente: "Estudio",
    dur: "0:09",
    aspecto: "v",
    video: "assets/Work/teaser-soon.mp4",
    chips: ["Vertical", "Teaser", "Tipografía"],
    texto: "Pieza de anticipación: nueve segundos para generar expectativa sin mostrar nada. El timing es el mensaje. Un ejercicio de economía narrativa donde la tensión lo hace todo."
},
{
    titulo: "Information Memorandum",
    cliente: "Estudio",
    dur: "0:10",
    aspecto: "h",
    video: "assets/Work/information-memorandum.mp4",
    chips: ["Horizontal", "Editorial", "Financiero"],
    texto: "Visualización de datos para un memorando de inversión. El reto fue hacer que la información financiera se leyera con fluidez sin sacrificar precisión: cada cifra entra cuando el ojo está listo para procesarla."
},
{
    titulo: "FlowMind",
    cliente: "Estudio",
    dur: "0:23",
    aspecto: "v",
    video: "assets/Work/flowmind.mp4",
    chips: ["Vertical", "IA", "SaaS"],
    texto: "Demo de producto para una herramienta de productividad con IA. El foco estaba en hacer visibles los flujos de trabajo internos de la app: mostrar la lógica, no solo la interfaz. Ritmo alto sin saturar."
},
{
    titulo: "Animaciones sin tutoriales",
    cliente: "Estudio",
    dur: "0:23",
    aspecto: "h",
    video: "assets/Work/animaciones-sin-tutoriales.mp4",
    chips: ["Horizontal", "Tutorial", "Motion"],
    texto: "Pieza de contenido propio sobre el proceso de aprender motion design desde el criterio, no desde los atajos. Una vuelta de tuerca al formato tutorial: sin revelar técnicas, solo mostrando resultados y razonamiento."
}
];


// Stable URLs and real poster files; add rol only after confirming the credit.
proyectos.forEach(project => {
  project.id ??= decodeURIComponent(project.video.split('/').pop()).replace(/\.mp4$/, '').trim().replaceAll(' ', '-').toLowerCase();
  project.poster ??= `assets/posters/${project.id}.jpg`;
  project.categoria ??= project.chips.filter(chip => !['Horizontal', 'Vertical'].includes(chip)).join(' · ');
  project.formatos ??= [project.aspecto === 'h' ? 'Horizontal · 16:9' : 'Vertical · 9:16'];
  project.rol ??= null;
});
