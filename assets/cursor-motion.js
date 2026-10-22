(() => {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || reduce.matches) return;
  const cursor = document.createElement('div');
  cursor.className = 'fm-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const image = document.createElement('img');
  image.src = new URL('cursor-arrow.svg', document.currentScript.src).href;
  image.alt = '';
  const hand = document.createElement('img');
  hand.src = new URL('cursor-hand.svg', document.currentScript.src).href;
  hand.alt = '';
  hand.className = 'fm-cursor-hand';
  image.className = 'fm-cursor-arrow';
  cursor.append(image, hand);
  const interactive = 'a[href],button,[role="button"],[role="tab"],summary,input[type="submit"],input[type="button"]';
  function updateShape(target) {
    const control = target?.closest?.(interactive);
    cursor.classList.toggle('is-hand', !!control && !control.matches(':disabled,[aria-disabled="true"]'));
  }
  document.addEventListener('pointerover', e => updateShape(e.target), {passive: true});
  document.addEventListener('scroll', () => updateShape(document.elementFromPoint(tx, ty)), {passive: true, capture: true});
  document.body.append(cursor);
  let x = 0, y = 0, tx = 0, ty = 0, angle = 0, scale = 1;
  let visible = false, down = false, frame = 0, last = 0;
  let targetAngle = 0, directionX = 0, directionY = 0;
  function hide() {
    visible = false;
    cursor.style.opacity = '0';
    document.documentElement.classList.remove('fm-cursor-active');
    cancelAnimationFrame(frame); frame = 0; last = 0;
  }
  function draw(time) {
    frame = 0;
    if (!visible) return;
    const dt = last ? Math.min(40, time - last) : 16.7;
    last = time;
    const ease = 1 - Math.exp(-dt / 42);
    const dx = tx - x, dy = ty - y;
    x += dx * ease; y += dy * ease;
    // El dedo apunta en la dirección del movimiento, por el giro más corto.
    const angleDelta = ((targetAngle - angle + 540) % 360) - 180;
    angle = (angle + angleDelta * (1 - Math.exp(-dt / 85)) + 360) % 360;
    scale += ((down ? .87 : 1) - scale) * ease;
    const dialog = document.querySelector('dialog[open]');
    const parent = dialog || document.body;
    if (cursor.parentNode !== parent) parent.append(cursor);
    cursor.style.transform = `translate3d(${x - 13}px,${y - 3}px,0) rotate(${angle}deg) scale(${scale})`;
    cursor.style.transformOrigin = '13px 3px';
    if (Math.abs(dx) + Math.abs(dy) > .05 || Math.abs(angleDelta) > .05 || Math.abs(scale - (down ? .87 : 1)) > .001) frame = requestAnimationFrame(draw);
  }
  function run() { if (!frame) frame = requestAnimationFrame(draw); }
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !fine.matches || reduce.matches || document.documentElement.classList.contains('motion-paused') || !image.complete || !image.naturalWidth) { hide(); return; }
    tx = e.clientX; ty = e.clientY;
    updateShape(e.target);
    if (!visible) {
      x = tx; y = ty;
      directionX = tx; directionY = ty;
    } else {
      const moveX = tx - directionX, moveY = ty - directionY;
      if (Math.hypot(moveX, moveY) >= 3) {
        targetAngle = (Math.atan2(moveY, moveX) * 180 / Math.PI + 450) % 360;
        directionX = tx; directionY = ty;
      }
    }
    visible = true;
    cursor.style.opacity = '1';
    document.documentElement.classList.add('fm-cursor-active');
    run();
  }, {passive: true});
  document.addEventListener('pointerdown', () => { down = true; run(); }, {passive: true});
  document.addEventListener('pointerup', () => { down = false; run(); }, {passive: true});
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('portfolio:motionchange', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  fine.addEventListener('change', hide);
  reduce.addEventListener('change', hide);
})();
