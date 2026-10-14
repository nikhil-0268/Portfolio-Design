(() => {
  // EDIT CONFIG: all asset paths, odds, contact destination, and projects live here.
  const CONFIG = {
    WIN_CHANCE: 0.9,
    ASSETS: {
      machine: 'slot-assets/red-machine.jpg',
      dice: 'slot-assets/dice.png',
      badge: 'slot-assets/jackpot-badge.png',
      grain:
        'data:image/svg+xml,' +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" opacity=".4" filter="url(#n)"/></svg>',
        ),
    },
    IMAGE_RATIO: 720 / 900,
    // Percentage coordinates measured from the supplied 720 × 900 red-machine photo.
    REELS: [
      { x: 23.7, y: 27.1, w: 13.4, h: 24.5 },
      { x: 39.65, y: 27.1, w: 13.05, h: 24.5 },
      { x: 55.2, y: 27.1, w: 13.0, h: 24.5 },
    ],
    KNOB: { x: 69.2, y: 59.8, w: 12.2, h: 8 },
    LEVER: { x: 80.5, y: 18.7, w: 15.0, h: 43.0 },
    REEL_STOP_MS: [1500, 2000, 2500],
    // Put your LIVE DEMO URL in href. Logos can be local paths or HTTPS URLs.
    // In the portfolio, content.js projects override these standalone examples.
    projects: [
      {
        name: 'Project 01',
        logo: '',
        color: '#b13128',
        desc: 'A new project is on its way. Come back soon to explore the finished work.',
        href: '',
      },
      {
        name: 'Project 02',
        logo: '',
        color: '#2c6957',
        desc: 'A space for the next idea, experiment, or website worth sharing.',
        href: '',
      },
      {
        name: 'Project 03',
        logo: '',
        color: '#78552e',
        desc: 'More work is taking shape. The live demo will be available here soon.',
        href: '',
      },
    ],
  };
  const root = document.querySelector('.lucky-project-picker');
  const boot = () => {
    if (!root || root.dataset.ready) return;
    const content = window.portfolioData || window.PORTFOLIO_CONTENT;
    if (content?.projects?.length)
      CONFIG.projects = content.projects.map((p, i) => ({
        name: p.title || p.name || 'Project ' + (i + 1),
        logo: p.logo || '',
        color: p.color || ['#b13128', '#2c6957', '#78552e'][i % 3],
        desc: p.description || p.desc,
        href: p.demo || p.href || '',
      }));
    const count = document.getElementById('work-count');
    if (count) count.textContent = CONFIG.projects.length + ' PROJECTS / PICK SOMETHING GOOD';
    root.dataset.ready = 'true';
    const find = (selector) => root.querySelector(selector),
      findAll = (selector) => [...root.querySelectorAll(selector)];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const clamp = (n) => Math.max(0, Math.min(1, Number(n) || 0));
    const projects = (Array.isArray(CONFIG.projects) ? CONFIG.projects : [])
      .filter((p) => p && String(p.name || '').trim())
      .map((p, i) => ({ ...p, name: String(p.name), key: String(p.id || p.name), index: i }));
    const projectKeys = new Set();
    projects.forEach((project) => {
      if (projectKeys.has(project.key)) project.key += ':' + project.index;
      projectKeys.add(project.key);
    });
    let busy = false,
      lastMiss = false,
      seenProjects = new Set(),
      sound = false,
      audio = null;
    let reelPositions = [0, 0, 0],
      animations = [],
      cardAnimation = null;
    const preloadedImages = [];
    const safeURL = (value, asset = false) => {
      if (typeof value !== 'string' || !value.trim()) return '';
      try {
        const url = new URL(value, document.baseURI);
        if (['https:', 'http:'].includes(url.protocol)) return url.href;
        if (
          asset &&
          url.protocol === 'data:' &&
          /^data:image\/(png|jpeg|webp|svg\+xml|gif);/i.test(value)
        )
          return value;
        if (asset && url.protocol === 'data:' && value.startsWith('data:image/svg+xml,'))
          return value;
        if (asset && url.protocol === 'file:' && !/^[a-z][a-z\d+.-]*:/i.test(value))
          return url.href;
        if (!asset && value.startsWith('#') && !/[\s<>]/.test(value)) return value;
      } catch (_) {}
      return '';
    };
    const applyRect = (node, rect) => {
      Object.entries({ left: rect.x, top: rect.y, width: rect.w, height: rect.h }).forEach(
        ([key, value]) => {
          node.style[key] = value + '%';
        },
      );
    };
    root.style.setProperty('--lpp-ratio', CONFIG.IMAGE_RATIO);
    root.style.setProperty('--lpp-grain', `url("${CONFIG.ASSETS.grain}")`);
    Object.values(CONFIG.ASSETS)
      .concat(projects.map((p) => p.logo))
      .forEach((path) => {
        const src = safeURL(path, true);
        if (src) {
          const image = new Image();
          image.src = src;
          preloadedImages.push(image);
        }
      });
    const asset = (node, path) => {
      const src = safeURL(path, true);
      if (src) node.src = src;
      else node.hidden = true;
    };
    asset(find('.lpp-machine-photo'), CONFIG.ASSETS.machine);
    asset(find('.lpp-badge'), CONFIG.ASSETS.badge);
    findAll('.lpp-die img').forEach((img) => {
      asset(img, CONFIG.ASSETS.dice);
      img.addEventListener('error', () => {
        img.hidden = true;
      });
    });
    find('.lpp-badge').addEventListener('error', (e) => {
      e.currentTarget.hidden = true;
    });
    find('.lpp-machine-photo').addEventListener('error', () => {
      find('.lpp-status').textContent =
        'The machine image could not load. You can still use the spin button below.';
    });
    findAll('.lpp-reel').forEach((node, i) => applyRect(node, CONFIG.REELS[i]));
    applyRect(find('.lpp-knob'), CONFIG.KNOB);
    applyRect(find('.lpp-lever'), CONFIG.LEVER);
    function logo(project) {
      const badge = document.createElement('span');
      badge.className = 'lpp-logo';
      badge.style.setProperty(
        '--lpp-project-color',
        /^#[\da-f]{3,8}$/i.test(project.color || '') ? project.color : '#9f3129',
      );
      badge.textContent = Array.from(project.name.trim())[0]?.toUpperCase() || '?';
      const url = safeURL(project.logo, true);
      if (url) {
        const img = new Image();
        img.alt = '';
        img.src = url;
        img.decoding = 'async';
        img.addEventListener('error', () => img.remove(), { once: true });
        badge.append(img);
      }
      return badge;
    }
    function symbol(index) {
      const cell = document.createElement('div');
      cell.className = 'lpp-symbol';
      cell.append(logo(projects[index]));
      return cell;
    }
    const strips = findAll('.lpp-strip');
    function land(reel, index) {
      strips[reel].classList.remove('lpp-moving');
      strips[reel].replaceChildren(symbol(index));
      strips[reel].style.transform = 'translateY(0)';
      reelPositions[reel] = index;
    }
    function announce(message) {
      find('.lpp-status').textContent = message;
    }
    function tone(frequency, when, duration, volume = 0.045, type = 'sine') {
      if (!sound || !audio) return;
      try {
        const oscillator = audio.createOscillator(),
          gain = audio.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, when);
        gain.gain.setValueAtTime(0.0001, when);
        gain.gain.exponentialRampToValueAtTime(volume, when + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(when);
        oscillator.stop(when + duration + 0.01);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      } catch (_) {}
    }
    function chime() {
      if (sound && audio)
        [523.25, 659.25, 783.99].forEach((f, i) => tone(f, audio.currentTime + i * 0.09, 0.28));
    }
    const soundButton = find('.lpp-sound');
    soundButton.addEventListener('click', async () => {
      if (sound) {
        sound = false;
        soundButton.textContent = 'SOUND OFF';
        soundButton.setAttribute('aria-pressed', 'false');
        soundButton.setAttribute('aria-label', 'Turn sound on');
        return;
      }
      try {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) throw new Error();
        audio = audio || new Context();
        await audio.resume();
        sound = true;
        soundButton.textContent = 'SOUND ON';
        soundButton.setAttribute('aria-pressed', 'true');
        soundButton.setAttribute('aria-label', 'Turn sound off');
        tone(440, audio.currentTime, 0.05, 0.02);
      } catch (_) {
        sound = false;
        soundButton.textContent = 'SOUND UNAVAILABLE';
        soundButton.disabled = true;
      }
    });
    function showCard(project) {
      if (cardAnimation) cardAnimation.cancel();
      const result = find('.lpp-result');
      find('.lpp-idle').hidden = true;
      find('.lpp-card-logo').replaceChildren(logo(project));
      find('.lpp-card-name').textContent = project.name;
      find('.lpp-description').textContent = String(
        project.desc || 'Explore this project and see it in action.',
      );
      find('.lpp-card-number').textContent =
        'FIND ' +
        String(project.index + 1).padStart(2, '0') +
        ' / ' +
        String(projects.length).padStart(2, '0');
      const url = safeURL(project.href);
      const link = find('.lpp-demo');
      link.hidden = !url;
      find('.lpp-demo-empty').hidden = Boolean(url);
      if (url) {
        link.href = url;
        link.setAttribute(
          'aria-label',
          'View ' + project.name + ' demo website (opens in a new tab)',
        );
      } else link.removeAttribute('href');
      result.hidden = false;
      result.style.transform = 'none';
      if (!reducedMotion.matches && result.animate)
        cardAnimation = result.animate(
          [
            { opacity: 0, transform: 'translateX(-25px)' },
            { opacity: 1, transform: 'translateX(0)' },
          ],
          { duration: 550, easing: 'ease-out' },
        );
    }
    const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
    function outcome() {
      const win = projects.length === 1 || lastMiss || Math.random() < clamp(CONFIG.WIN_CHANCE);
      const unseen = projects.filter((p) => !seenProjects.has(p.key));
      const pool = unseen.length && Math.random() < 0.85 ? unseen : projects;
      const picked = randomItem(pool),
        values = [picked.index, picked.index, picked.index];
      if (!win) {
        const other = randomItem(projects.filter((p) => p.index !== picked.index));
        values[2] = other.index;
      }
      return { win, project: picked, values };
    }
    async function spinReel(reel, target) {
      const strip = strips[reel];
      if (reducedMotion.matches || !strip.animate) {
        land(reel, target);
        return;
      }
      const count = 15 + reel * 5,
        cells = [symbol(reelPositions[reel])];
      for (let i = 1; i < count; i++)
        cells.push(symbol(Math.floor(Math.random() * projects.length)));
      cells.push(symbol(target));
      strip.replaceChildren(...cells);
      strip.classList.add('lpp-moving');
      const animation = strip.animate(
        [
          { transform: 'translateY(0)', easing: 'cubic-bezier(.15,.5,.18,1)' },
          { transform: `translateY(-${count * 100 + 6}%)`, offset: 0.94, easing: 'ease-out' },
          { transform: `translateY(-${count * 100}%)` },
        ],
        { duration: CONFIG.REEL_STOP_MS[reel], fill: 'forwards' },
      );
      animations.push(animation);
      try {
        await animation.finished;
      } catch (_) {}
      animation.cancel();
      land(reel, target);
    }
    function setBusy(value) {
      busy = value;
      findAll('[data-spin]').forEach((button) => {
        button.disabled = value || !projects.length;
      });
      root.setAttribute('aria-busy', String(value));
    }
    async function spin() {
      if (busy || !projects.length) return;
      setBusy(true);
      const result = outcome();
      animations = [];
      if (cardAnimation) cardAnimation.cancel();
      find('.lpp-result').hidden = true;
      find('.lpp-idle').hidden = true;
      find('.lpp-machine').classList.remove('lpp-win');
      find('.lpp-lever').classList.add('lpp-pulling');
      if (sound && audio) {
        audio.resume().catch(() => {});
        tone(150, audio.currentTime, 0.065, 0.055, 'triangle');
      }
      announce('Spinning. A new discovery is on its way.');
      try {
        await Promise.all(result.values.map((target, reel) => spinReel(reel, target)));
        lastMiss = !result.win;
        if (result.win) {
          seenProjects.add(result.project.key);
          chime();
          find('.lpp-machine').classList.add('lpp-win');
          if (!reducedMotion.matches) await new Promise((resolve) => setTimeout(resolve, 180));
          showCard(result.project);
          announce(
            'You pulled ' +
              result.project.name +
              '. ' +
              (safeURL(result.project.href)
                ? 'Select View project to open the demo website.'
                : 'Demo link coming soon.'),
          );
        } else {
          find('.lpp-idle').hidden = false;
          find('.lpp-idle p').textContent = 'So close. Your next spin is a guaranteed find.';
          announce(
            'Near miss — two matching logos. Your next spin is guaranteed to pull a project.',
          );
        }
      } finally {
        find('.lpp-lever').classList.remove('lpp-pulling');
        animations = [];
        setBusy(false);
      }
    }
    findAll('[data-spin]').forEach((button) => button.addEventListener('click', spin));
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) {
        animations.forEach((a) => {
          try {
            a.finish();
          } catch (_) {}
        });
        cardAnimation?.finish();
      }
    });
    if (projects.length) {
      strips.forEach((_, i) => land(i, i % projects.length));
    } else {
      announce('New projects are on the way. Come back soon.');
      find('.lpp-idle p').textContent = 'Projects are coming soon.';
    }
    setBusy(false);
  };
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
