(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches) return;
  const selector = '.btn-dark,.btn-line,.btn-ghost,.fmt,.reel-mute,.featured-close,.lb-x,.lb-cta,.volver,.nav-pill a,.fm-orbit,.svc,.featured-card,.pieza,.pricing-card';
  let frame = 0, target, x, y;
  document.addEventListener('pointermove', event => {
    if (document.documentElement.classList.contains('motion-paused') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    target = event.target.closest(selector);
    if (!target) return;
    x = event.clientX; y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!target?.isConnected) return;
      const box = target.getBoundingClientRect();
      target.style.setProperty('--lens-x', `${x - box.left}px`);
      target.style.setProperty('--lens-y', `${y - box.top}px`);
    });
  }, {passive: true});
})();
