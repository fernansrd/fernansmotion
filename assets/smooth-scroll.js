/**
 * fernansmotion — Smooth Scroll & Scroll Interactions Engine
 * 
 * Inercia cinemática fluida (Lenis-style physics) + micro-interacciones:
 * - Interpolación exponencial suave en rueda de ratón (mouse wheel) y trackpad.
 * - Desplazamiento por anclas (smooth anchor gliding) con curva ease-in-out.
 * - Micro-inclinación cinética (velocity skew/tilt) en tarjetas según la velocidad del scroll.
 * - Widget flotante interactivo (HUD) con anillo circular SVG de progreso y botón de retorno al inicio.
 * - Navegación por teclado suave (Espacio, Flechas, RePág, AvPág, Inicio, Fin).
 * - Sincronización continua con scrollbar nativo y gestos táctiles en móvil.
 * - Detección automática y respeto de prefers-reduced-motion y modo pausado.
 * - Pausa automática al abrir diálogos/modales nativos (<dialog open>).
 * - Scrollspy interactivo en la barra de navegación (.nav-pill).
 */

(() => {
  'use strict';

  const CONFIG = {
    damping: 84, // Amortiguamiento en ms (~84ms ofrece una inercia sedosa y ágil)
    wheelMultiplier: 1.0,
    maxTiltDeg: 1.35, // Grados máximos de micro-inclinación
    tiltFactor: -0.024,
    hudThreshold: 220, // Píxeles de scroll para mostrar el botón flotante
    navOffset: 95 // Compensación de altura para la barra de navegación flotante
  };

  const isCoarse = matchMedia('(pointer: coarse)').matches;
  const reduceMotionMedia = matchMedia('(prefers-reduced-motion: reduce)');

  let currentY = window.scrollY || window.pageYOffset || 0;
  let targetY = currentY;
  let velocity = 0;
  let lastTime = 0;
  let rafId = null;
  let isPaused = false;
  let isNavigating = false;
  let navStartTime = 0;
  let navDuration = 900;
  let navStartY = 0;
  let navTargetY = 0;

  const subscribers = new Set();

  function isMotionAllowed() {
    return !reduceMotionMedia.matches &&
           !document.documentElement.classList.contains('motion-paused');
  }

  function isDialogActive() {
    return !!document.querySelector('dialog[open]') ||
           document.body.style.overflow === 'hidden';
  }

  function getMaxScroll() {
    return Math.max(
      0,
      (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight
    );
  }

  // Curva easeInOutCubic para anclas
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Normalización de rueda de ratón (cross-browser / OS)
  function normalizeWheel(e) {
    let dx = e.deltaX || 0;
    let dy = e.deltaY || 0;

    if (e.deltaMode === 1) { // LÍNEAS
      dx *= 38;
      dy *= 38;
    } else if (e.deltaMode === 2) { // PÁGINAS
      dx *= window.innerHeight;
      dy *= window.innerHeight;
    }

    return { x: dx, y: dy };
  }

  // Verifica si el objetivo del evento está dentro de un contenedor con scroll propio
  function isInsideScrollable(target, deltaY) {
    let el = target;
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.tagName === 'DIALOG' || el.classList?.contains('lb-box') || el.classList?.contains('featured-dialog') || el.classList?.contains('featured-info')) {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          const atTop = el.scrollTop <= 0 && deltaY < 0;
          const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight && deltaY > 0;
          if (!atTop && !atBottom) return true;
        }
      }
      el = el.parentElement;
    }
    return false;
  }

  // Actualiza variables CSS y elementos interactivos
  function updateMetrics(y, vel, prog, dir) {
    const root = document.documentElement;
    const clampedTilt = (Math.max(-CONFIG.maxTiltDeg, Math.min(CONFIG.maxTiltDeg, vel * CONFIG.tiltFactor))).toFixed(3);

    root.style.setProperty('--scroll-y', `${y.toFixed(1)}px`);
    root.style.setProperty('--scroll-velocity', vel.toFixed(2));
    root.style.setProperty('--scroll-tilt', `${clampedTilt}deg`);
    root.style.setProperty('--scroll-progress', prog.toFixed(4));
    root.style.setProperty('--scroll-dir', String(dir));

    if (Math.abs(vel) > 0.35) {
      root.setAttribute('data-scrolling', 'true');
    } else {
      root.removeAttribute('data-scrolling');
    }

    // Actualiza barra de lectura superior
    const barra = document.getElementById('progreso');
    if (barra) {
      barra.style.transform = `scaleX(${prog})`;
    }

    // Actualiza widget HUD flotante
    updateHud(y, prog);

    // Actualiza botón flotante Glass WhatsApp para sección Proyectos
    updateWhatsAppGlass(y);

    // Actualiza scrollspy del nav
    updateNavSpy(y);
  }

  // Bucle de animación (RAF)
  function loop(time) {
    if (isPaused || isDialogActive() || !isMotionAllowed()) {
      rafId = null;
      return;
    }

    const dt = lastTime ? Math.min(48, time - lastTime) : 16.7;
    lastTime = time;

    const max = getMaxScroll();
    let prevY = currentY;

    if (isNavigating) {
      const elapsed = time - navStartTime;
      const progress = Math.min(1, elapsed / navDuration);
      const eased = easeInOutCubic(progress);
      currentY = navStartY + (navTargetY - navStartY) * eased;
      velocity = (currentY - prevY) / (dt / 16.7);

      if (progress >= 1) {
        currentY = navTargetY;
        targetY = navTargetY;
        velocity = 0;
        isNavigating = false;
      }
    } else {
      const factor = 1 - Math.exp(-dt / CONFIG.damping);
      currentY += (targetY - currentY) * factor;
      const diff = targetY - currentY;
      velocity = (currentY - prevY) / (dt / 16.7);

      if (Math.abs(diff) < 0.25 && Math.abs(velocity) < 0.15) {
        currentY = targetY;
        velocity = 0;
      }
    }

    currentY = Math.max(0, Math.min(max, currentY));
    window.scrollTo(0, currentY);

    const prog = max > 0 ? Math.max(0, Math.min(1, currentY / max)) : 0;
    const dir = velocity > 0.08 ? 1 : velocity < -0.08 ? -1 : 0;

    updateMetrics(currentY, velocity, prog, dir);

    // Notificar suscriptores (ej. home.js FX.pintar)
    subscribers.forEach(fn => {
      try { fn({ y: currentY, targetY, velocity, progress: prog, direction: dir }); } catch (_) {}
    });

    if (currentY !== targetY || isNavigating || Math.abs(velocity) > 0.1) {
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = null;
      updateMetrics(currentY, 0, prog, 0);
    }
  }

  function startLoop() {
    if (!rafId && !isPaused && !isDialogActive() && isMotionAllowed()) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  }

  // Intercepción de rueda de ratón en escritorio
  function onWheel(e) {
    if (e.ctrlKey) return; // Zoom del navegador o trackpad pinch
    if (isDialogActive() || !isMotionAllowed()) return;

    const norm = normalizeWheel(e);

    // Si el gesto es predominantemente horizontal, permitir navegación nativa
    if (Math.abs(norm.x) > Math.abs(norm.y) && Math.abs(norm.y) < 15) return;

    // Si el cursor está en un elemento interno scrolleable (ej. ficha de video abierta)
    if (isInsideScrollable(e.target, norm.y)) return;

    e.preventDefault();

    isNavigating = false;
    const max = getMaxScroll();
    targetY = Math.max(0, Math.min(max, targetY + norm.y * CONFIG.wheelMultiplier));

    startLoop();
  }

  // Navegación fluida con teclas de dirección, espacio, repág/avpág
  function onKeyDown(e) {
    if (isDialogActive() || !isMotionAllowed()) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;

    const max = getMaxScroll();
    let delta = 0;

    switch (e.key) {
      case 'ArrowDown':
        delta = 100;
        break;
      case 'ArrowUp':
        delta = -100;
        break;
      case 'PageDown':
      case ' ':
        if (e.shiftKey) delta = -window.innerHeight * 0.85;
        else delta = window.innerHeight * 0.85;
        break;
      case 'PageUp':
        delta = -window.innerHeight * 0.85;
        break;
      case 'Home':
        e.preventDefault();
        scrollToPosition(0, 850);
        return;
      case 'End':
        e.preventDefault();
        scrollToPosition(max, 850);
        return;
      default:
        return;
    }

    if (delta !== 0) {
      e.preventDefault();
      isNavigating = false;
      targetY = Math.max(0, Math.min(max, targetY + delta));
      startLoop();
    }
  }

  // Sincronización con el scroll del navegador cuando cambia por scrollbar o gestos
  function onNativeScroll() {
    const winY = window.scrollY || window.pageYOffset || 0;
    if (!rafId && !isNavigating) {
      currentY = winY;
      targetY = winY;
      const max = getMaxScroll();
      const prog = max > 0 ? Math.max(0, Math.min(1, currentY / max)) : 0;
      updateMetrics(currentY, 0, prog, 0);
    }
  }

  // Manejo de clicks en anclas locales (ej. #trabajo, #servicios, #inicio)
  function onAnchorClick(e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!hash || hash === '#' || hash === '#!') return;

    const targetEl = document.querySelector(hash);
    if (!targetEl) return;

    e.preventDefault();

    const rect = targetEl.getBoundingClientRect();
    const dest = Math.max(0, Math.min(getMaxScroll(), window.scrollY + rect.top - CONFIG.navOffset));

    scrollToPosition(dest, 900);

    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', hash);
    }
  }

  function scrollToPosition(destY, duration = 850) {
    const max = getMaxScroll();
    destY = Math.max(0, Math.min(max, destY));

    if (!isMotionAllowed()) {
      window.scrollTo({ top: destY, behavior: 'smooth' });
      currentY = destY;
      targetY = destY;
      return;
    }

    navStartY = currentY;
    navTargetY = destY;
    navDuration = duration;
    navStartTime = performance.now();
    isNavigating = true;

    startLoop();
  }

  // Widget flotante interactivo (HUD)
  let hudBtn = null;
  let hudBar = null;

  function initHud() {
    if (document.getElementById('fm-scroll-hud')) {
      hudBtn = document.getElementById('fm-scroll-hud');
      hudBar = hudBtn.querySelector('.fm-hud-bar');
      return;
    }

    const hud = document.createElement('button');
    hud.type = 'button';
    hud.className = 'fm-scroll-hud';
    hud.id = 'fm-scroll-hud';
    hud.setAttribute('aria-label', 'Volver al inicio');
    hud.setAttribute('title', 'Volver al inicio');

    hud.innerHTML = `
      <svg class="fm-hud-ring" viewBox="0 0 44 44" aria-hidden="true">
        <defs>
          <linearGradient id="fm-hud-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4c1d95" />
            <stop offset="50%" stop-color="#7c4dff" />
            <stop offset="100%" stop-color="#c084fc" />
          </linearGradient>
        </defs>
        <circle class="fm-hud-track" cx="22" cy="22" r="18" />
        <circle class="fm-hud-bar" cx="22" cy="22" r="18" stroke="url(#fm-hud-gradient)" />
      </svg>
      <span class="fm-hud-arrow" aria-hidden="true">↑</span>
    `;

    document.body.appendChild(hud);
    hudBtn = hud;
    hudBar = hud.querySelector('.fm-hud-bar');

    hud.addEventListener('click', () => {
      scrollToPosition(0, 950);
      hud.blur();
    });
  }

  function updateHud(y, prog) {
    if (!hudBtn || !hudBar) return;

    if (y > CONFIG.hudThreshold) {
      hudBtn.classList.add('is-visible');
    } else {
      hudBtn.classList.remove('is-visible');
    }

    const circumference = 113.097; // 2 * PI * 18
    const offset = circumference * (1 - prog);
    hudBar.style.strokeDashoffset = offset.toFixed(2);
  }

  // Botón flotante Apple Glass para WhatsApp al llegar a la sección de Proyectos
  let waGlassBtn = null;

  function initWhatsAppGlass() {
    if (document.getElementById('fm-whatsapp-glass')) {
      waGlassBtn = document.getElementById('fm-whatsapp-glass');
      return;
    }

    const btn = document.createElement('a');
    btn.className = 'fm-whatsapp-glass';
    btn.id = 'fm-whatsapp-glass';
    btn.href = 'https://wa.me/18098047825?text=' + encodeURIComponent('Hola Fernan, vi tu portafolio y me gustaría conversar sobre un proyecto de motion design.');
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('aria-label', 'Envíame un mensaje por WhatsApp al 18098047825');

    btn.innerHTML = `
      <span class="fm-glass-icon-wrap" aria-hidden="true">
        <svg class="fm-glass-wa-svg" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.71 4.29 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.59.21-1.09.15-1.18-.07-.1-.23-.17-.48-.29z"/>
        </svg>
        <span class="fm-glass-pulse" aria-hidden="true"></span>
      </span>
      <span class="fm-glass-text">Envíame un mensaje</span>
      <span class="fm-glass-arrow" aria-hidden="true">↗</span>
    `;

    document.body.appendChild(btn);
    waGlassBtn = btn;
  }

  function updateWhatsAppGlass(y) {
    if (!waGlassBtn) return;

    // Detectar sección de proyectos:
    // En index.html: #trabajo, .work
    // En proyectos.html: #lista, .pg-head
    const target = document.getElementById('trabajo') || document.querySelector('.work') || document.getElementById('lista') || document.querySelector('.pg-head');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    // Aparece cuando el usuario llega a la sección de proyectos (75% del viewport)
    const isPastProjects = rect.top <= window.innerHeight * 0.75;

    // Si llegó al footer (cuando el footer sube hacia el centro vertical), ocultar suavemente
    const footer = document.querySelector('.fm-footer');
    let isTouchingFooter = false;
    if (footer) {
      const fRect = footer.getBoundingClientRect();
      if (fRect.top < window.innerHeight * 0.52) {
        isTouchingFooter = true;
      }
    }

    if (isPastProjects && !isTouchingFooter) {
      waGlassBtn.classList.add('is-visible');
    } else {
      waGlassBtn.classList.remove('is-visible');
    }
  }

  // Scrollspy: resalta automáticamente el enlace activo en .nav-pill
  const sections = [];
  function initNavSpy() {
    sections.length = 0;
    const links = document.querySelectorAll('.nav-pill a[href^="#"]');
    links.forEach(link => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        sections.push({ id, link, target });
      }
    });
  }

  function updateNavSpy(y) {
    if (!sections.length) return;

    const vh = window.innerHeight;
    const scrollCenter = y + vh * 0.38;

    let activeItem = null;
    for (let i = sections.length - 1; i >= 0; i--) {
      const { target } = sections[i];
      const top = target.offsetTop;
      if (scrollCenter >= top) {
        activeItem = sections[i];
        break;
      }
    }

    sections.forEach(({ link }) => {
      link.classList.toggle('is-active', activeItem && link === activeItem.link);
    });
  }

  // API pública
  window.SmoothScroll = {
    init() {
      // Para evitar conflictos con el suavizado nativo del navegador durante el control por RAF
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';

      currentY = window.scrollY || window.pageYOffset || 0;
      targetY = currentY;

      initHud();
      initWhatsAppGlass();
      initNavSpy();

      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      document.addEventListener('click', onAnchorClick);

      window.addEventListener('resize', () => {
        targetY = Math.min(getMaxScroll(), targetY);
      }, { passive: true });

      reduceMotionMedia.addEventListener('change', () => {
        if (!isMotionAllowed()) {
          isPaused = true;
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          document.documentElement.removeAttribute('data-scrolling');
          document.documentElement.style.setProperty('--scroll-tilt', '0deg');
        } else {
          isPaused = false;
        }
      });

      document.addEventListener('portfolio:motionchange', () => {
        if (!isMotionAllowed()) {
          isPaused = true;
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          document.documentElement.removeAttribute('data-scrolling');
          document.documentElement.style.setProperty('--scroll-tilt', '0deg');
        } else {
          isPaused = false;
        }
      });

      const max = getMaxScroll();
      const prog = max > 0 ? Math.max(0, Math.min(1, currentY / max)) : 0;
      updateMetrics(currentY, 0, prog, 0);
    },

    scrollTo(target, options = {}) {
      const duration = options.duration || 850;
      if (typeof target === 'number') {
        scrollToPosition(target, duration);
      } else if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) {
          const rect = el.getBoundingClientRect();
          const dest = window.scrollY + rect.top - (options.offset || CONFIG.navOffset);
          scrollToPosition(dest, duration);
        }
      } else if (target instanceof Element) {
        const rect = target.getBoundingClientRect();
        const dest = window.scrollY + rect.top - (options.offset || CONFIG.navOffset);
        scrollToPosition(dest, duration);
      }
    },

    pause() {
      isPaused = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    },

    resume() {
      isPaused = false;
      currentY = window.scrollY || window.pageYOffset || 0;
      targetY = currentY;
      velocity = 0;
    },

    onScroll(fn) {
      if (typeof fn === 'function') {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
      }
    },

    getState() {
      const max = getMaxScroll();
      return {
        y: currentY,
        targetY,
        velocity,
        progress: max > 0 ? currentY / max : 0,
        isPaused
      };
    }
  };

  // Inicialización automática cuando el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.SmoothScroll.init());
  } else {
    window.SmoothScroll.init();
  }
})();
