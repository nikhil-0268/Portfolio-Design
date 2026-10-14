// Scroll progress drives the camera; still images provide the WebGL fallback.
(() => {
  const root = document.documentElement;
  const journey = document.querySelector('.journey');
  const scene = document.querySelector('.scene-window');
  const canvas = document.querySelector('.camera-canvas');
  const screen = document.querySelector('.screen-stage');
  const entrance = document.querySelector('.portfolio-door');
  const cue = document.querySelector('.scroll-cue');
  const skip = document.querySelector('.skip-view');
  const bar = document.querySelector('.scroll-progress span');
  const frames = [...document.querySelectorAll('.view')];

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');

  const clamp = (value) => Math.min(1, Math.max(0, value));
  const ease = (value) => {
    const x = clamp(value);
    return x * x * (3 - 2 * x);
  };

  const READY_AT = 0.915; // where the display has finished arriving
  const reduced = () => motion.matches;

  let renderer = null;
  let frame = 0;
  let glowFrame = 0;
  let start = 0;
  let travel = 1;
  let current = 0;
  let target = 0;
  let previous = 0;
  let ready = false;
  let initialised = false;

  root.classList.add('enhanced');

  function measure() {
    start = journey.getBoundingClientRect().top + scrollY;
    travel = Math.max(1, journey.offsetHeight - scene.offsetHeight);
    target = clamp((scrollY - start) / travel);
    if (renderer && renderer.resize) renderer.resize();
    schedule();
  }

  function cameraFor(value) {
    // reduced motion: no interpolated movement, just the two end states
    return reduced() ? (value >= 0.5 ? 1 : 0) : ease((value - 0.055) / 0.85);
  }

  function paintCamera(camera) {
    // The stage is already sized to show the whole 16:9 frame. It sits slightly
    // small at the start of the journey and settles at full size on arrival.
    scene.style.setProperty('--camera-scale', String(reduced() ? 1 : 0.94 + 0.085 * camera));
    if (renderer) renderer.render(camera);
    else
      frames.forEach((img, i) => {
        img.style.visibility = i === Math.round(camera * 2) ? 'visible' : 'hidden';
      });
  }

  function render(time) {
    frame = 0;
    const elapsed = Math.min(50, time - previous || 16);
    previous = time;

    current = reduced() ? target : current + (target - current) * (1 - Math.exp(-elapsed / 75));
    if (Math.abs(current - target) < 0.0001) current = target;

    paintCamera(cameraFor(current));

    const nextReady = reduced() ? current >= 0.5 : current >= READY_AT;
    screen.style.opacity = String(reduced() ? Number(nextReady) : ease((current - 0.88) / 0.045));

    const cueFade = 1 - ease(current / 0.13);
    cue.style.opacity = String(cueFade);
    cue.setAttribute('aria-hidden', String(cueFade < 0.5));
    cue.style.pointerEvents = cueFade < 0.5 ? 'none' : '';

    bar.style.transform = `scaleX(${current})`;

    if (!initialised || ready !== nextReady) {
      const wasEntrance = document.activeElement === entrance;
      const wasCueActive = document.activeElement === cue || cue.contains(document.activeElement);
      ready = nextReady;
      initialised = true;
      screen.inert = !ready;
      screen.setAttribute('aria-hidden', String(!ready));
      screen.classList.toggle('is-ready', ready);
      entrance.tabIndex = ready ? 0 : -1;
      skip.innerHTML = ready
        ? 'Back to overhead <span aria-hidden="true">↑</span>'
        : 'Go to laptop <span aria-hidden="true">↓</span>';
      skip.setAttribute('aria-label', ready ? 'Back to overhead' : 'Go to laptop');
      // Hand focus to whatever just became reachable, and never leave it on a hidden control.
      if (ready && wasCueActive) entrance.focus({ preventScroll: true });
      else if (!ready && wasEntrance) skip.focus({ preventScroll: true });
    }

    if (current !== target) frame = requestAnimationFrame(render);
    else previous = 0;
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function go(event) {
    event.preventDefault();
    const back = ready && event.currentTarget !== cue;
    window.scrollTo({
      top: back ? start : start + travel,
      behavior: reduced() ? 'instant' : 'smooth',
    });
  }
  skip.addEventListener('click', go);
  cue.addEventListener('click', go);

  window.addEventListener(
    'scroll',
    () => {
      target = clamp((scrollY - start) / travel);
      schedule();
    },
    { passive: true },
  );

  window.addEventListener('resize', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(scene);

  window.addEventListener('pageshow', () => {
    measure();
    current = target;
    schedule();
  });

  function hash() {
    // #laptop lands on the display; ?camera=0.5 deep-links any point of the descent.
    const at = new URLSearchParams(location.search).get('camera');
    const progress =
      at !== null && at !== '' && Number.isFinite(Number(at)) ? clamp(Number(at)) : null;
    if (progress === null && location.hash !== '#laptop') return;
    measure();
    const ratio = progress === null ? 1 : progress;
    window.scrollTo({ top: start + travel * ratio, behavior: 'instant' });
    target = current = ratio;
    schedule();
  }
  window.addEventListener('hashchange', hash);
  motion.addEventListener('change', () => {
    previous = 0;
    current = target;
    schedule();
    glowReset();
  });

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    renderer = null;
    root.classList.remove('gpu-ready');
    schedule();
  });

  let setupInFlight = false;
  async function setup() {
    // webglcontextrestored can fire while the first attempt is still awaiting
    // its textures; two renderers on one canvas would fight over GL state.
    if (setupInFlight) return;
    setupInFlight = true;
    try {
      renderer = await createDeskCamera(canvas);
      renderer.render(current);
      root.classList.add('gpu-ready');
    } catch {
      renderer = null;
      root.classList.remove('gpu-ready');
    } finally {
      setupInFlight = false;
    }
    schedule();
  }
  // The door fades with opacity; once it is fully transparent, retire it from the
  // accessibility tree so assistive tech cannot reach a control nobody can see.
  screen.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'opacity' || screen.style.opacity === '1') return;
    screen.setAttribute('aria-hidden', 'true');
  });

  canvas.addEventListener('webglcontextrestored', setup);

  // Keep reloads feeling intentional: the browser should not restore a half-scrolled position.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  measure();
  current = target;
  hash();
  setup();

  /* ---------- light follows the pointer across the laptop display ---------- */
  function glowReset() {
    cancelAnimationFrame(glowFrame);
    glowFrame = 0;
    entrance.style.removeProperty('--light-x');
    entrance.style.removeProperty('--light-y');
  }
  let lightX = 50;
  let lightY = 50;
  entrance.addEventListener('pointermove', (event) => {
    if (!ready || reduced() || !pointer.matches || event.pointerType === 'touch') return;
    const rect = entrance.getBoundingClientRect();
    lightX = ((event.clientX - rect.left) / rect.width) * 100;
    lightY = ((event.clientY - rect.top) / rect.height) * 100;
    if (glowFrame) return;
    glowFrame = requestAnimationFrame(() => {
      entrance.style.setProperty('--light-x', `${lightX}%`);
      entrance.style.setProperty('--light-y', `${lightY}%`);
      glowFrame = 0;
    });
  });
  entrance.addEventListener('pointerleave', glowReset);
  window.addEventListener('blur', glowReset);
})();
