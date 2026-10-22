/* ============================================================
   Retículas por formato
   ============================================================ */
function pintarPiezas() {
  const grupos = {
    h: { cont: document.getElementById('rej-h'), n: document.getElementById('n-h') },
    v: { cont: document.getElementById('rej-v'), n: document.getElementById('n-v') }
  };

  proyectos.forEach((p, i) => {
    const g = grupos[p.aspecto];
    if (!g) return;

    const el = document.createElement('article');
    el.className = 'pieza ' + p.aspecto + ' rv';
    el.id = p.id;
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Ver ${p.titulo}, ${p.cliente}`);
    // #t=0.5 muestra un fotograma real en vez de un cuadro negro
    el.innerHTML = `
      <video aria-hidden="true" src="${p.video}" data-src="${p.video}" poster="${p.poster}" autoplay muted loop playsinline preload="metadata"></video>
      <div class="pieza-veil"></div>
      <div class="pieza-dur">${p.dur}</div>
      <div class="pieza-play" aria-hidden="true"><span>Reproductor ↗</span></div>
      <div class="pieza-meta"><b>${p.titulo}</b><span>${p.cliente}</span></div>`;
    g.cont.appendChild(el);

    const v = el.querySelector('video');
    v.muted = true;
    v.defaultMuted = true;
    setupPreview(el, v);
    el.addEventListener('click', () => abrirPopup(i));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirPopup(i); }
    });
  });

  const nH = proyectos.filter(p => p.aspecto === 'h').length;
  const nV = proyectos.length - nH;
  grupos.h.n.textContent = nH + (nH === 1 ? ' pieza' : ' piezas');
  grupos.v.n.textContent = nV + (nV === 1 ? ' pieza' : ' piezas');
  document.getElementById('pg-sub').textContent =
    `Interfaces, historias y productos en movimiento. ${proyectos.length} piezas para explorar; abre cualquiera para verla completa.`;
}

/* ============================================================
   Popup
   ============================================================ */
let ultimoFoco = null;

function abrirPopup(i) {
  const p = proyectos[i];
  const lb = document.getElementById('lb');
  const v = document.getElementById('lb-video');
  ultimoFoco = document.activeElement;
  window.__popup = true;

  if (typeof stopBackgroundMedia === 'function') {
    stopBackgroundMedia();
  }

  document.getElementById('lb-cliente').textContent = p.cliente;
  document.getElementById('lb-titulo').textContent  = p.titulo;
  document.getElementById('lb-dur').textContent     = p.dur;
  document.getElementById('lb-desc').textContent    = p.texto;
  document.getElementById('lb-facts').replaceWith(Object.assign(projectFacts(p), {id: 'lb-facts'}));
  document.getElementById('lb-tags').innerHTML =
    p.chips.map(c => `<span class="wl-chip">${c}</span>`).join('');

  const nombre = p.titulo.toLowerCase().includes(p.cliente.toLowerCase())
    ? p.titulo : `${p.titulo} de ${p.cliente}`;
  document.getElementById('lb-cta').href = 'https://wa.me/18098047825?text=' +
    encodeURIComponent(`Hola Fernan, vi "${nombre}" en tu portafolio y me interesa hacer algo así.`);

  document.getElementById('lb-box').className = 'lb-box ' + p.aspecto;

  document.querySelectorAll('video').forEach(o => { if (o !== v) o.pause(); });

  v.setAttribute('aria-label', p.titulo);
  lb.querySelectorAll('.video-error').forEach(el => el.remove());
  delete v.dataset.errorShown;
  v.poster = p.poster;
  v.src = p.video;
  v.controls = true;
  v.muted = false;
  v.currentTime = 0;

  lb.showModal();
  document.body.style.overflow = 'hidden';
  window.SmoothScroll?.pause();

  // El clic ya es gesto del usuario: puede sonar. Si el navegador
  // igual lo bloquea, arranca en silencio.
  v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
  document.getElementById('lb-x').focus();
}

function cerrarPopup() { document.getElementById('lb').close(); }
document.getElementById('lb').addEventListener('close', () => {
  const v = document.getElementById('lb-video');
  v.pause(); v.removeAttribute('src'); v.load();
  window.__popup = false;
  document.body.style.overflow = '';
  window.SmoothScroll?.resume();
  ultimoFoco?.focus({preventScroll:true});
  if (typeof resumeVisiblePreviews === 'function') {
    resumeVisiblePreviews();
  }
});

/* ============================================================
   Reveals, progreso y paralaje del fondo
   ============================================================ */
function initReveals() {
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
}

function pintarScroll() {
  const barra = document.getElementById('progreso');
  const max = document.documentElement.scrollHeight - window.innerHeight;
  barra.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;

  if (!motionAllowed()) return;
  const fondo = document.querySelector('.bg-layer');
  const y = Math.max(-95, Math.min(95, window.scrollY * 0.05 - 40));
  fondo.style.setProperty('--bg-y', y.toFixed(1) + 'px');
}

document.getElementById('lb-x').addEventListener('click', cerrarPopup);
document.getElementById('lb-bg').addEventListener('click', cerrarPopup);
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarPopup(); });
if (window.SmoothScroll) window.SmoothScroll.onScroll(pintarScroll);
window.addEventListener('scroll', pintarScroll, { passive: true });

pintarPiezas();
initReveals();
pintarScroll();

// Service links take visitors to a real example without starting sound.
function focusLinkedProject() {
  const id = location.hash.slice(1);
  const card = id ? document.getElementById(id) : null;
  if (card?.classList.contains('pieza')) {
    card.classList.add('in');
    card.scrollIntoView({block:'center', behavior:'instant'});
    card.focus({preventScroll:true});
  }
}
window.addEventListener('hashchange', focusLinkedProject);
focusLinkedProject();
