// Custom cursor for desktop pointers, with a saved user preference.
(() => {
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
  const root = document.documentElement;

  const supportsWebp = (() => {
    try {
      return document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp');
    } catch (_) {
      return false;
    }
  })();

  const cursor = document.createElement('div');
  cursor.className = 'guitar-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const art = new Image();
  art.alt = '';
  art.draggable = false;
  cursor.append(art);

  const cursorToggle = document.createElement('button');
  cursorToggle.type = 'button';
  cursorToggle.className = 'cursor-choice';

  let enabled = true;
  let loaded = false;
  let frame = 0;
  let x = 0;
  let y = 0;
  let scale = 1;

  try {
    enabled = localStorage.getItem('nikhil-custom-cursor') !== 'off';
  } catch (_) {
    /* storage blocked */
  }

  const hide = () => root.classList.remove('guitar-cursor-active');
  const label = () => {
    cursorToggle.textContent = enabled ? 'Use standard cursor' : 'Use guitar cursor';
    cursorToggle.setAttribute('aria-pressed', String(enabled));
  };

  // The switch only exists where a custom pointer makes sense.
  function syncChoice() {
    if (finePointer.matches && loaded && !cursorToggle.isConnected)
      document.body.append(cursorToggle);
    else if (!finePointer.matches && cursorToggle.isConnected) cursorToggle.remove();
  }

  cursorToggle.addEventListener('click', () => {
    enabled = !enabled;
    hide();
    label();
    try {
      localStorage.setItem('nikhil-custom-cursor', enabled ? 'on' : 'off');
    } catch (_) {
      /* storage blocked */
    }
  });

  label();
  if (finePointer.matches) {
    document.body.append(cursor);
    art.addEventListener(
      'load',
      () => {
        loaded = true;
        syncChoice();
      },
      { once: true },
    );
    art.addEventListener(
      'error',
      () => {
        hide();
        cursor.remove();
        cursorToggle.remove();
      },
      { once: true },
    );
    // Prefer the smaller WebP, fall back to the original PNG.
    art.src = supportsWebp ? 'assets/cursor-guitar.webp' : 'cursor-guitar.png';
  }

  document.addEventListener(
    'pointermove',
    (event) => {
      const typing =
        event.target instanceof Element &&
        event.target.closest('input,textarea,select,[contenteditable="true"]');
      if (!enabled || !loaded || !finePointer.matches || event.pointerType !== 'mouse' || typing) {
        hide();
        return;
      }
      x = event.clientX;
      y = event.clientY;
      scale = event.target.closest('a,button,[role="button"]') ? 1.12 : 1;
      root.classList.add('guitar-cursor-active');
      if (frame) return;
      frame = requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        cursor.style.transformOrigin = '0 0';
        frame = 0;
      });
    },
    { passive: true },
  );

  // Do not leave the artwork parked at a stale position while the page moves.
  document.addEventListener('scroll', hide, { passive: true });
  document.addEventListener('pointerout', (event) => {
    if (!event.relatedTarget) hide();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') hide();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hide();
  });
  window.addEventListener('blur', hide);
  finePointer.addEventListener('change', () => {
    hide();
    syncChoice();
  });
})();
