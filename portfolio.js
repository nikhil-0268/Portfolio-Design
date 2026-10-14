(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  let source = window.PORTFOLIO_CONTENT || {};
  if (new URLSearchParams(location.search).get('preview') === '1') {
    try {
      source = JSON.parse(localStorage.getItem('nikhil-content-draft')) || source;
    } catch (_) {
      /* use saved content */
    }
    const notice = document.createElement('div');
    notice.className = 'draft-notice';
    notice.textContent =
      'DRAFT PREVIEW · Export content.js from the editor to save these changes to your site.';
    document.body.prepend(notice);
  }
  const data = (window.portfolioData = {
    ...source,
    name: source.name || 'Nikhil Sharma',
    projects: source.projects?.length ? source.projects : window.PORTFOLIO_PROJECTS || [],
    email: source.email || window.SITE?.email || '',
    links: source.links?.length ? source.links : window.SITE?.links || [],
  });
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  };
  const text = (selector, value) => {
    const node = $(selector);
    if (node) node.textContent = value || '';
  };
  const safeURL = (value, image = false) => {
    if (!value || typeof value !== 'string') return '';
    try {
      const url = new URL(value, document.baseURI);
      const relative = !/^[a-z][a-z\d+.-]*:/i.test(value) && !value.startsWith('//');
      if (
        ['https:', 'http:'].includes(url.protocol) ||
        (image && relative && url.protocol === 'file:')
      )
        return url.href;
    } catch (_) {
      /* invalid user-supplied link */
    }
    return '';
  };
  const photo = (path, className, alt, lazy = true) => {
    const src = safeURL(path, true);
    if (!src) return null;
    const img = el('img', className);
    img.src = src;
    img.alt = alt;
    img.decoding = 'async';
    if (lazy) img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.parentElement?.classList.remove('has-image');
      img.remove();
    });
    return img;
  };
  const projects = Array.isArray(data.projects) ? data.projects.filter((p) => p && p.title) : [];
  const samples = [
    {
      title: 'An idea taking shape.',
      category: 'Project preview',
      cover: 'WHAT\nIF?',
      sample: true,
    },
    {
      title: 'Something worth exploring.',
      category: 'Project preview',
      cover: 'WHY\nNOT?',
      sample: true,
    },
    {
      title: 'A little further each time.',
      category: 'Project preview',
      cover: 'KEEP\nGOING.',
      sample: true,
    },
  ];
  const collection = projects.length ? projects : samples;
  $$('[data-name]').forEach((node) => {
    node.textContent = data.name;
  });
  $$('.year').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
  if ($('#hero-title')) {
    const words = data.name.trim().split(/\s+/);
    const title = $('#hero-title');
    title.replaceChildren(
      document.createTextNode(words.shift()),
      el('br'),
      document.createTextNode(words.join(' ')),
      el('span', 'period', '.'),
    );
    document.title = data.name + ' — Portfolio';
  }
  text('#intro', data.intro);
  text('#about-title', data.aboutHeading);
  text('#about-copy', data.about);
  text('#orbit-title', data.orbitTitle);
  (data.tags || []).forEach((tag) => $('#tags')?.append(el('li', '', tag)));
  const portrait = $('.portrait');
  if (portrait) {
    const imageURL = safeURL(data.portrait, true);
    if (imageURL) portrait.src = imageURL;
    portrait.alt = data.name;
    const wrap = $('.portrait-wrap'),
      trigger = $('.portrait-trigger');
    trigger.setAttribute('aria-label', 'Show stickers around ' + data.name + '’s portrait');
    let pixels = null,
      canvas = null;
    const prepare = () => {
      try {
        canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = Math.round((200 * portrait.naturalHeight) / portrait.naturalWidth);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(portrait, 0, 0, canvas.width, canvas.height);
        pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      } catch (_) {
        pixels = null;
      }
    };
    if (portrait.complete && portrait.naturalWidth) prepare();
    else portrait.addEventListener('load', prepare);
    const set = (value) => {
      wrap.classList.toggle('is-open', value);
      trigger.setAttribute('aria-pressed', String(value));
    };
    trigger.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const b = portrait.getBoundingClientRect();
      const scale = Math.min(b.width / portrait.naturalWidth, b.height / portrait.naturalHeight);
      const w = portrait.naturalWidth * scale,
        h = portrait.naturalHeight * scale;
      const x = (event.clientX - b.left - (b.width - w) / 2) / w;
      const y = (event.clientY - b.top - (b.height - h)) / h;
      const inside = x >= 0 && x < 1 && y >= 0 && y < 1;
      set(
        inside &&
          (!pixels ||
            pixels[
              (Math.floor(y * canvas.height) * canvas.width + Math.floor(x * canvas.width)) * 4 + 3
            ] > 35),
      );
    });
    trigger.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') set(false);
    });
    trigger.addEventListener('click', (event) => {
      if (event.detail === 0 || !matchMedia('(hover:hover) and (pointer:fine)').matches)
        set(!wrap.classList.contains('is-open'));
    });
    trigger.addEventListener('blur', () => set(false));
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') set(false);
    });
  }

  const orbit = $('#orbit-ring');
  if (orbit) {
    const items = (data.orbitItems || []).filter((item) => item && item.title);
    if (!items.length) $('#play').hidden = true;
    else {
      let step = 0,
        angle = 0,
        dragging = null;
      const scene = $('.orbit-scene'),
        spacing = 360 / items.length;
      items.forEach((item, index) => {
        const tile = el('div', 'orbit-tile');
        tile.style.setProperty('--angle', `${index * spacing}deg`);
        tile.append(
          el('small', '', `${String(index + 1).padStart(2, '0')} / NOTES TO SELF`),
          el('span', 'orbit-symbol', ['↗', '</>', '↔', '…'][index % 4]),
          el('strong', '', item.title),
        );
        const img = photo(item.image, '', '');
        if (img) {
          tile.prepend(img);
          tile.classList.add('has-image');
        }
        orbit.append(tile);
      });
      const turn = () => {
        angle = -step * spacing;
        orbit.style.setProperty('--rotation', `${angle}deg`);
        const index = ((step % items.length) + items.length) % items.length;
        text('#orbit-caption', items[index].caption || items[index].title);
        [...orbit.children].forEach((tile, i) =>
          tile.setAttribute('aria-hidden', String(i !== index)),
        );
      };
      const size = () => {
        const base = mobile.matches ? 150 : 245;
        orbit.style.setProperty(
          '--radius',
          `${items.length === 1 ? 0 : Math.max(base, (mobile.matches ? 95 : 125) / Math.tan(Math.PI / Math.max(3, items.length)))}px`,
        );
      };
      const next = (delta) => {
        step += delta;
        turn();
      };
      $('#orbit-prev').addEventListener('click', () => next(-1));
      $('#orbit-next').addEventListener('click', () => next(1));
      scene.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          next(e.key === 'ArrowRight' ? 1 : -1);
        }
      });
      scene.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        dragging = { x: e.clientX, angle, id: e.pointerId };
        scene.setPointerCapture(e.pointerId);
        scene.classList.add('dragging');
      });
      scene.addEventListener('pointermove', (e) => {
        if (!dragging || e.pointerId !== dragging.id) return;
        angle = dragging.angle + (e.clientX - dragging.x) * 0.35;
        orbit.style.setProperty('--rotation', `${angle}deg`);
      });
      const release = () => {
        if (!dragging) return;
        dragging = null;
        scene.classList.remove('dragging');
        step = Math.round(-angle / spacing);
        turn();
      };
      scene.addEventListener('pointerup', release);
      scene.addEventListener('pointercancel', release);
      scene.addEventListener('lostpointercapture', release);
      window.addEventListener('resize', size);
      size();
      turn();
      if (items.length === 1) {
        $('#orbit-prev').disabled = true;
        $('#orbit-next').disabled = true;
      }
    }
  }
  const contact = $('#contact-links');
  if (contact) {
    const links = [...(data.links || [])];
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      links.unshift({ label: data.email, url: 'mailto:' + data.email });
    links.forEach((item) => {
      const url = item.url === 'mailto:' + data.email && data.email ? item.url : safeURL(item.url);
      if (!url) return;
      const anchor = el('a', '', (item.label || 'Visit') + ' ↗');
      anchor.href = url;
      if (!url.startsWith('mailto:')) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      }
      const li = el('li');
      li.append(anchor);
      contact.append(li);
    });
    if (contact.children.length) $('#contact-empty').hidden = true;
  }
  let pending = false;
  function draw() {
    pending = false;
    const echo = $('.echo');
    if (echo && !reduced.matches) {
      const progress = Math.max(
        0,
        Math.min(1, (innerHeight - echo.getBoundingClientRect().top) / innerHeight),
      );
      echo.style.setProperty('--echo-x', `${2 + progress * 10}px`);
      echo.style.setProperty('--echo-y', `${-4 - progress * 7}px`);
    }
    const sections = ['work', 'about', 'play', 'contact']
      .map((id) => $('#' + id))
      .filter((n) => n && !n.hidden);
    const current = sections
      .filter((section) => section.getBoundingClientRect().top <= innerHeight * 0.5)
      .pop();
    $$('.floating-nav a').forEach((a) => {
      if (current && a.hash === '#' + current.id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener(
    'scroll',
    () => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(draw);
      }
    },
    { passive: true },
  );
  draw();

  const detail = $('#project-detail');
  if (detail) {
    const raw = new URLSearchParams(location.search).get('project');
    const index = raw !== null && /^\d+$/.test(raw) ? Number(raw) : -1;
    const project = collection[index];
    if (!project) {
      detail.append(
        el('h1', '', 'Project not found.'),
        el(
          'p',
          'detail-lede',
          'This project may have moved. Explore the current collection below.',
        ),
      );
    } else {
      document.title = `${project.title} — ${data.name}`;
      detail.append(
        el(
          'p',
          'eyebrow',
          project.sample ? 'PROJECT PREVIEW / COMING SOON' : project.category || 'SELECTED PROJECT',
        ),
        el('h1', '', project.title),
        el(
          'p',
          'detail-lede',
          project.description ||
            'A space for future work. The finished project and its story will appear here.',
        ),
      );
      const cover = photo(project.image, 'detail-cover', project.title, false);
      detail.append(cover || el('div', 'detail-placeholder', project.cover || project.title));
      const meta = el('div', 'detail-meta');
      [
        ['Role', project.role],
        ['Year', project.year],
        ['Tools', (project.tools || []).join(' / ')],
      ].forEach(([label, value]) => {
        if (value) {
          const entry = el('span', '', value);
          entry.prepend(el('small', '', label.toUpperCase()));
          meta.append(entry);
        }
      });
      if (meta.children.length) detail.append(meta);
      if (project.story) detail.append(el('p', 'detail-story', project.story));
      const actions = el('div', 'detail-actions');
      [
        ['Visit live project ↗', project.demo],
        ['View source ↗', project.github],
      ].forEach(([label, url]) => {
        const safe = safeURL(url);
        if (safe) {
          const a = el('a', '', label);
          a.href = safe;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          actions.append(a);
        }
      });
      if (actions.children.length) detail.append(actions);
      const gallery = el('div', 'detail-gallery');
      (project.gallery || []).forEach((path, i) => {
        const img = photo(path, '', `${project.title}, detail ${i + 1}`);
        if (img) gallery.append(img);
      });
      detail.append(gallery);
    }
    const back = el('a', 'text-link', '← Back to selected work');
    back.href = 'page2.html#work';
    back.style.marginTop = '50px';
    detail.append(back);
  }
})();
