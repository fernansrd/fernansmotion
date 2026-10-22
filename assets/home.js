/* ============================================================
   Hero — ruleta de palabras
   ============================================================ */
function initRuleta() {
  const words = ['claro', 'visible', 'memorable'];
  const track = document.getElementById('roulette-track');
  const box = document.getElementById('roulette');
  track.replaceChildren(...words.map(word => {
    const span = document.createElement('span'); span.textContent = word; return span;
  }));
  let index = 0;
  const measure = () => {
    // Intrinsic text widths, recalculated on resize and font loading.
    box.style.setProperty('--rw', `${Math.max(...[...track.children].map(el => el.scrollWidth))}px`);
  };
  measure();
  document.fonts.ready.then(measure);
  window.addEventListener('resize', measure, {passive:true});
  setInterval(() => {
    if (!motionAllowed() || document.hidden) return;
    index = (index + 1) % words.length;
    track.style.transform = `translateY(-${index * 1.12}em)`;
  }, 2800);
  motionPreference.addEventListener('change', () => {
    if (!motionAllowed()) { index = 0; track.style.transform = 'none'; }
  });
}

function initReel() {
  const video = document.getElementById('hero-reel');
  if (!video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('autoplay', '');

  const tryPlay = () => {
    if (document.querySelector('dialog[open]') || window.__popup) return;
    if (document.documentElement.classList.contains('motion-paused')) return;
    const p = video.play();
    if (p !== undefined) {
      p.catch(() => {
        video.addEventListener('canplay', () => {
          if (document.querySelector('dialog[open]') || window.__popup) return;
          if (document.documentElement.classList.contains('motion-paused')) return;
          video.play().catch(() => {});
        }, { once: true });
      });
    }
  };

  // Reproducir de inmediato al cargar la página
  tryPlay();
  video.addEventListener('loadeddata', tryPlay, { once: true });
  video.addEventListener('canplay', tryPlay, { once: true });

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      tryPlay();
    } else {
      video.pause();
    }
  }, { threshold: 0.05 });
  observer.observe(video);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else tryPlay();
  });

  // Si el usuario hace clic en el reel principal, abrir el reproductor completo
  const reelFrame = document.getElementById('reel-frame');
  if (reelFrame) {
    reelFrame.setAttribute('role', 'button');
    reelFrame.setAttribute('tabindex', '0');
    reelFrame.setAttribute('aria-label', 'Ver VulnAudit en el reproductor');
    const abrirReelCompleto = () => {
      const vulnProject = (typeof proyectos !== 'undefined' && proyectos.find(p => p.video.includes('Vulnaudit-1'))) || proyectos[1];
      if (vulnProject) openFeaturedVideo(vulnProject, reelFrame);
    };
    reelFrame.addEventListener('click', abrirReelCompleto);
    reelFrame.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirReelCompleto(); }
    });
  }

  const toggle = document.getElementById('motion-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const paused = document.documentElement.classList.toggle('motion-paused');
      document.dispatchEvent(new Event('portfolio:motionchange'));
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.textContent = paused ? 'Reanudar animaciones' : 'Pausar animaciones';
      if (paused) { video.pause(); stopBackgroundMedia(); }
      else { tryPlay(); resumeVisiblePreviews(); }
    });
  }
}

/* ============================================================
   Trabajo — lista acordeón + tarjetas de video
   ============================================================ */
const featuredDialog = document.getElementById('featured-dialog');
const featuredPlayer = featuredDialog.querySelector('video');
let featuredTrigger = null;
let previousOverflow = '';
function openFeaturedVideo(project, trigger) {
  featuredTrigger = trigger;
  previousOverflow = document.body.style.overflow;
  window.__popup = true;
  document.querySelectorAll('video').forEach(v => { v.pause(); v.muted = true; });
  featuredDialog.classList.toggle('vertical', project.aspecto === 'v');
  featuredDialog.setAttribute('aria-label', project.titulo);
  featuredPlayer.setAttribute('aria-label', project.titulo);
  featuredDialog.querySelectorAll('.video-error').forEach(el => el.remove());
  delete featuredPlayer.dataset.errorShown;
  featuredPlayer.poster = project.poster;
  featuredPlayer.src = project.video;
  featuredPlayer.controls = true;
  const info = document.getElementById('featured-info');
  const title = document.createElement('h2'); title.textContent = project.titulo;
  const description = document.createElement('p'); description.textContent = project.texto;
  const contact = document.createElement('a'); contact.className = 'btn-dark'; contact.href = 'contacto.html'; contact.textContent = 'Hablemos de una pieza así ↗';
  info.replaceChildren(title, description, projectFacts(project), contact);
  featuredPlayer.muted = false;
  document.body.style.overflow = 'hidden';
  window.SmoothScroll?.pause();
  featuredDialog.showModal();
  featuredPlayer.play().catch(() => {});
}
featuredDialog.querySelector('button').addEventListener('click', () => featuredDialog.close());
featuredDialog.addEventListener('click', e => {
  if (e.target !== featuredDialog) return;
  const r = featuredDialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) featuredDialog.close();
});
featuredDialog.addEventListener('close', () => {
  featuredPlayer.pause();
  featuredPlayer.removeAttribute('src');
  featuredPlayer.load();
  window.__popup = false;
  document.body.style.overflow = previousOverflow;
  window.SmoothScroll?.resume();
  featuredTrigger?.focus({preventScroll: true});
  if (typeof resumeVisiblePreviews === 'function') {
    resumeVisiblePreviews();
  }
  const heroReel = document.getElementById('hero-reel');
  if (heroReel && !document.documentElement.classList.contains('motion-paused')) {
    heroReel.play().catch(() => {});
  }
});

function initTrabajo() {
  const grid = document.getElementById('featured-videos');
  const tabs = [...document.querySelectorAll('#fmt-tabs .fmt')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => {
      if (isIntersecting) { target.classList.add('visible'); observer.unobserve(target); }
    });
  }, {threshold: 0.1});

  function render(format) {
    observer.disconnect();
    grid.querySelectorAll('.featured-card').forEach(card => {
      if (typeof unobservePreview === 'function') unobservePreview(card);
      else previewObserver.unobserve(card);
    });
    grid.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });
    grid.replaceChildren();
    grid.scrollLeft = 0;
    grid.className = 'featured-videos ' + format;
    grid.setAttribute('aria-label', format === 'v' ? 'Videos verticales' : 'Videos horizontales');
    proyectos.filter(p => p.aspecto === format).slice().reverse().forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'featured-card slide';
      card.style.setProperty('--delay', `${i * 65}ms`);
      const video = document.createElement('video');
      video.dataset.src = p.video;
      video.poster = p.poster;
      video.setAttribute('aria-hidden', 'true');
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('autoplay', '');
      video.preload = 'metadata';
      video.src = p.video;

      const button = document.createElement('button');
      button.className = 'featured-audio';
      button.type = 'button';
      button.setAttribute('aria-label', `Abrir reproductor de ${p.titulo}`);
      button.setAttribute('aria-haspopup', 'dialog');
      button.addEventListener('click', () => openFeaturedVideo(p, button));
      const caption = document.createElement('div'); caption.className = 'featured-caption';
      const title = document.createElement('strong'); title.textContent = p.titulo;
      const category = document.createElement('span'); category.textContent = `${p.categoria} · ${p.dur}`;
      caption.append(title, category);
      card.append(video, caption, button);
      grid.append(card);
      setupPreview(card, video);
      observer.observe(card);
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.toggle('on', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
        t.tabIndex = t === tab ? 0 : -1;
      });
      render(tab.dataset.fmt);
    });
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const next = tabs[e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + 1) % tabs.length];
      next.focus(); next.click();
    });
  });
  render('v');
}

/* ============================================================
   Frase — las palabras se encienden con el scroll
   ============================================================ */
function initFrase() {
  if (!motionAllowed()) return;
  const el = document.getElementById('quote-text');
  const stage = document.getElementById('quote-stage');
  if (!el || !stage) return;

  const acento = ['claridad.', 'movimiento.'];
  const palabras = el.textContent.trim().split(/\s+/);
  el.innerHTML = palabras
    .map(p => `<w class="${acento.includes(p) ? 'accent' : ''}">${p}</w>`)
    .join(' ');
  const ws = el.querySelectorAll('w');

  const pintar = () => {
    const r = stage.getBoundingClientRect();
    const total = r.height + window.innerHeight;
    const avance = (window.innerHeight - r.top) / total;
    const p = Math.max(0, Math.min(1, (avance - 0.18) / 0.44));
    const n = Math.round(p * ws.length);
    ws.forEach((w, i) => w.classList.toggle('on', i < n));
  };

  window.addEventListener('scroll', pintar, { passive: true });
  window.addEventListener('resize', pintar);
  pintar();
}

/* ============================================================
   Clientes — se encienden en cascada
   ============================================================ */
/* ============================================================
   Reveals + nav que se esconde al bajar
   ============================================================ */
function initReveals() {
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
}

/* El nav queda fijo y visible siempre: nada de esconderlo al bajar. */

/* ============================================================
   INTERACTIVIDAD CON EL SCROLL
   Cada elemento con data-fx reacciona a su posición en pantalla.
   Un solo bucle para todos: nada de un listener por efecto.
   ============================================================ */
const FX = (() => {
  let piezas = [];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = v => Math.max(0, Math.min(1, v));

  function medir() {
    piezas = [...document.querySelectorAll('[data-fx]')].map(el => ({
      el,
      tipo: el.dataset.fx,
      fuerza: parseFloat(el.dataset.fuerza || '1')
    }));
  }

  function pintar() {
    if (!motionAllowed()) return;
    const vh = window.innerHeight;

    piezas.forEach(({ el, tipo, fuerza }) => {
      const r = el.getBoundingClientRect();
      // 0 = acaba de entrar por abajo, 1 = ya salió por arriba
      const p = clamp01((vh - r.top) / (vh + r.height));

      if (tipo === 'portada') {
        // La portada se asienta y se aleja apenas al subir la página
        const salida = clamp01((-r.top) / (r.height * 0.9));
        el.style.transform =
          `translate3d(0, ${salida * -40}px, 0) scale(${lerp(1, 0.945, salida)})`;
        el.style.opacity = String(lerp(1, 0.55, salida * salida));
      }

      else if (tipo === 'capsula') {
        // La cápsula de la frase se abre al entrar
        const e = clamp01((p - 0.15) / 0.4);
        el.style.transform = `scale(${lerp(0.93, 1, e)})`;
        el.style.opacity = String(lerp(0.35, 1, e));
      }

      else if (tipo === 'parallax') {
        el.style.transform = `translate3d(0, ${(0.5 - p) * 90 * fuerza}px, 0)`;
      }

      else if (tipo === 'deriva') {
        // Los shapes del fondo se mueven a otra velocidad que el contenido
        el.style.setProperty('--fx-y', ((0.5 - p) * 120 * fuerza) + 'px');
      }
    });

    // Barra de progreso de lectura
    const barra = document.getElementById('progreso');
    if (barra) {
      const max = document.documentElement.scrollHeight - vh;
      barra.style.transform = `scaleX(${max > 0 ? clamp01(window.scrollY / max) : 0})`;
    }

    // Fondo: los shapes se desplazan más lento que la página (profundidad)
    const fondo = document.querySelector('.bg-layer');
    if (fondo) {
      const y = Math.max(-95, Math.min(95, window.scrollY * 0.05 - 40));
      fondo.style.setProperty('--bg-y', y.toFixed(1) + 'px');
    }
  }

  return { medir, pintar };
})();

function initFX() {
  FX.medir();
  FX.pintar();
  window.addEventListener('resize', () => { FX.medir(); FX.pintar(); });
}

/* ============================================================
   SCROLL SUAVE
   - Rueda del mouse: interpolación continua (arranca y frena solo).
   - Anclas del menú: curva ease-in-out real (easeInOutCubic).
   En táctil y con "reducir movimiento" se respeta el scroll nativo,
   que ahí se siente mejor y es lo accesible.
   ============================================================ */
// Native scrolling preserves keyboard, touchpad, anchor history and browser find.
function initAnclas() {
  if (window.SmoothScroll) {
    window.SmoothScroll.onScroll(() => FX.pintar());
  }
  window.addEventListener('scroll', () => FX.pintar(), {passive:true});
}

function initInfo() {
  /* btn-info removed — was the cryptic 'i' ghost button */
}

initRuleta();
initReel();
initTrabajo();
initFrase();
initReveals();
initFX();
initAnclas();
initInfo();
