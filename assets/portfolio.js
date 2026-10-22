/* Shared project presentation. Credits stay empty until confirmed by the author. */
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const motionAllowed = () => !motionPreference.matches && !document.documentElement.classList.contains('motion-paused');
const previewAllowed = () => motionAllowed() && !navigator.connection?.saveData && !document.hidden;
const projectFacts = project => {
  const facts = [['Categoría', project.categoria], ['Formato disponible', project.formatos.join(' · ')]];
  if (project.rol) facts.push(['Rol', project.rol]);
  const dl = document.createElement('dl');
  dl.className = 'project-facts';
  facts.forEach(([label, value]) => {
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = value;
    dl.append(dt, dd);
  });
  return dl;
};
// Registro de tarjetas para reproducción automática continua
const previewCards = new Set();

function playCardVideo(video) {
  if (!video) return;
  if (document.querySelector('dialog[open]') || window.__popup) return;
  if (document.documentElement.classList.contains('motion-paused')) return;

  if (!video.getAttribute('src') && video.dataset.src) {
    video.src = video.dataset.src;
  }

  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');

  const p = video.play();
  if (p !== undefined) {
    p.catch(() => {
      // Reintentar cuando los datos del video estén cargados
      video.addEventListener('canplay', () => {
        if (document.querySelector('dialog[open]') || window.__popup) return;
        if (document.documentElement.classList.contains('motion-paused')) return;
        video.play().catch(() => {});
      }, { once: true });
    });
  }
}

const previewObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const card = entry.target;
    const video = card.querySelector('video');
    if (!video) return;

    if (entry.isIntersecting) {
      playCardVideo(video);
    } else {
      video.pause();
    }
  });
}, {
  threshold: 0,
  rootMargin: '100px 0px 100px 0px'
});

function resumeVisiblePreviews() {
  if (document.querySelector('dialog[open]') || window.__popup) return;
  if (document.documentElement.classList.contains('motion-paused')) return;
  previewCards.forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;
    const rect = card.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight + 100 && rect.bottom > -100;
    if (isVisible) {
      playCardVideo(video);
    } else {
      video.pause();
    }
  });
}

function setupPreview(card, video) {
  video.dataset.preview = '';
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.preload = 'metadata';

  if (video.dataset.src && !video.getAttribute('src')) {
    video.src = video.dataset.src;
  }

  previewCards.add(card);
  previewObserver.observe(card);

  // Reproducir de inmediato
  playCardVideo(video);
}

function unobservePreview(card) {
  previewCards.delete(card);
  previewObserver.unobserve(card);
  const video = card.querySelector('video');
  if (video) video.pause();
}

function stopBackgroundMedia() {
  document.querySelectorAll('video').forEach(video => {
    if (!video.closest('dialog[open]')) video.pause();
  });
}

// Desbloqueo universal al primer gesto de interacción si el navegador retrasó el autoplay
const unlockAutoplay = () => {
  resumeVisiblePreviews();
  const hero = document.getElementById('hero-reel');
  if (hero && hero.paused && !document.documentElement.classList.contains('motion-paused')) {
    hero.play().catch(() => {});
  }
};
['scroll', 'touchstart', 'pointerdown', 'mousemove', 'keydown', 'click'].forEach(evt => {
  window.addEventListener(evt, unlockAutoplay, { once: true, passive: true });
});

window.resumeVisiblePreviews = resumeVisiblePreviews;
window.stopBackgroundMedia = stopBackgroundMedia;
window.unobservePreview = unobservePreview;

motionPreference.addEventListener('change', () => {
  if (document.documentElement.classList.contains('motion-paused')) stopBackgroundMedia();
  else resumeVisiblePreviews();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopBackgroundMedia();
  else resumeVisiblePreviews();
});
// Native controls remain usable if autoplay fails or a connection drops.
document.addEventListener('error', event => {
  const video = event.target;
  if (!(video instanceof HTMLVideoElement) || video.dataset.errorShown) return;
  video.dataset.errorShown = 'true';
  if (!video.controls) return;
  const notice = document.createElement('p'); notice.className = 'video-error'; notice.setAttribute('role', 'status');
  notice.textContent = 'No se pudo cargar el video. ';
  const link = document.createElement('a'); link.href = video.currentSrc || video.src; link.textContent = 'Abrir el archivo original ↗';
  notice.append(link); video.after(notice);
}, true);
// Keep a predictable Tab cycle, including browsers that move focus to their chrome.
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button,a[href],video[controls],input,select,textarea,[tabindex="0"]')]
      .filter(element => !element.disabled && element.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  });
});
