(() => {
  const form = document.querySelector('#editor-form');
  const initial = structuredClone(window.PORTFOLIO_CONTENT || {});
  if (!initial.projects?.length && window.PORTFOLIO_PROJECTS?.length)
    initial.projects = structuredClone(window.PORTFOLIO_PROJECTS);
  if (!initial.email) initial.email = window.SITE?.email || '';
  if (!initial.links?.length) initial.links = structuredClone(window.SITE?.links || []);
  const textFields = ['name', 'intro', 'aboutHeading', 'about', 'portrait', 'orbitTitle', 'email'];
  const status = (message) => {
    document.querySelector('#editor-status').textContent = message;
  };
  const field = (key, label, value, area = false) => {
    const wrap = document.createElement('label');
    wrap.textContent = label;
    const input = document.createElement(area ? 'textarea' : 'input');
    input.dataset.key = key;
    input.value = value || '';
    if (area) input.rows = 3;
    wrap.append(input);
    return wrap;
  };
  const entries = {
    project: {
      holder: '#project-fields',
      title: 'Project',
      fields: [
        ['title', 'Project title'],
        ['category', 'Category (e.g. Website, App, Design)'],
        ['description', 'Short description', true],
        ['image', 'Cover image path'],
        ['role', 'Your role'],
        ['year', 'Year'],
        ['tools', 'Tools, separated by commas'],
        ['story', 'Project story: the problem, your process, and what you learned', true],
        ['demo', 'Live project URL (optional)'],
        ['github', 'GitHub URL (optional)'],
        ['gallery', 'More image paths, one per line', true],
      ],
    },
    orbit: {
      holder: '#orbit-fields',
      title: 'Tile',
      fields: [
        ['title', 'Title'],
        ['caption', 'Short caption'],
        ['image', 'Image path (optional)'],
      ],
    },
    link: {
      holder: '#link-fields',
      title: 'Link',
      fields: [
        ['label', 'Label (e.g. GitHub)'],
        ['url', 'Full URL'],
      ],
    },
  };
  function add(type, values = {}) {
    const def = entries[type],
      entry = document.createElement('div');
    entry.className = 'entry';
    entry.dataset.type = type;
    const head = document.createElement('div');
    head.className = 'entry-head';
    const h = document.createElement('h3');
    h.textContent = def.title;
    head.append(h);
    const controls = document.createElement('div');
    [
      [
        '↑',
        'Move up',
        () => {
          if (entry.previousElementSibling)
            entry.parentElement.insertBefore(entry, entry.previousElementSibling);
        },
      ],
      [
        '↓',
        'Move down',
        () => {
          if (entry.nextElementSibling)
            entry.parentElement.insertBefore(entry.nextElementSibling, entry);
        },
      ],
      [
        'Remove',
        'Remove ' + def.title,
        () => {
          entry.remove();
          status(def.title + ' removed from this draft.');
        },
      ],
    ].forEach(([label, aria, action]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.setAttribute('aria-label', aria);
      b.addEventListener('click', action);
      controls.append(b);
    });
    head.append(controls);
    entry.append(head);
    def.fields.forEach(([key, label, area]) => {
      let value = values[key];
      if (Array.isArray(value)) value = value.join(key === 'gallery' ? '\n' : ', ');
      const row = field(key, label, value, area);
      if (key === 'title' || key === 'label' || key === 'url')
        row.querySelector('input').required = true;
      if (['demo', 'github', 'url'].includes(key)) row.querySelector('input').type = 'url';
      entry.append(row);
    });
    document.querySelector(def.holder).append(entry);
  }
  function load(content) {
    for (const key of textFields) form.elements.namedItem(key).value = content[key] || '';
    form.elements.namedItem('tags').value = (content.tags || []).join(', ');
    Object.values(entries).forEach((def) => document.querySelector(def.holder).replaceChildren());
    (content.projects || []).forEach((item) => add('project', item));
    (content.orbitItems || []).forEach((item) => add('orbit', item));
    (content.links || []).forEach((item) => add('link', item));
  }
  const split = (value, delimiter) =>
    value
      .split(delimiter)
      .map((s) => s.trim())
      .filter(Boolean);
  function collect() {
    const output = {};
    for (const key of textFields) output[key] = form.elements.namedItem(key).value.trim();
    output.tags = split(form.elements.namedItem('tags').value, ',');
    for (const [type, key] of [
      ['project', 'projects'],
      ['orbit', 'orbitItems'],
      ['link', 'links'],
    ]) {
      output[key] = [...document.querySelectorAll(`.entry[data-type="${type}"]`)].map((entry) => {
        const object = {};
        entry.querySelectorAll('[data-key]').forEach((input) => {
          object[input.dataset.key] = input.value.trim();
        });
        if (type === 'project') {
          object.tools = split(object.tools, ',');
          object.gallery = split(object.gallery, '\n');
        }
        return object;
      });
    }
    return output;
  }
  const draft = (content) => {
    try {
      localStorage.setItem('nikhil-content-draft', JSON.stringify(content));
      return true;
    } catch (_) {
      status('Browser storage is unavailable. Export the file instead.');
      return false;
    }
  };
  for (const type of Object.keys(entries))
    document.querySelector('#add-' + type).addEventListener('click', () => add(type));
  document.querySelector('#preview').addEventListener('click', () => {
    if (form.reportValidity() && draft(collect())) {
      window.open('page2.html?preview=1', '_blank', 'noopener');
      status('Draft saved locally. Preview opened in a new tab.');
    }
  });
  document.querySelector('#restore').addEventListener('click', () => {
    try {
      const saved = JSON.parse(localStorage.getItem('nikhil-content-draft'));
      if (saved) {
        load(saved);
        status('Local draft restored.');
      } else status('There is no local draft yet.');
    } catch (_) {
      status('Could not read a local draft.');
    }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const content = collect();
    draft(content);
    const blob = new Blob(
      [
        '// Your portfolio content. Generated by edit-content.html.\nwindow.PORTFOLIO_CONTENT = ' +
          JSON.stringify(content, null, 2) +
          ';\n',
      ],
      { type: 'text/javascript;charset=utf-8' },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = 'content.js';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    status(
      'Downloaded content.js. Replace the existing content.js in your portfolio folder, then refresh your site.',
    );
  });
  document.querySelector('#import-content').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const source = await file.text();
      const match = source.match(/window\.PORTFOLIO_CONTENT\s*=\s*([\s\S]*);\s*$/);
      const imported = JSON.parse(match ? match[1] : source);
      if (!imported || typeof imported.name !== 'string' || !Array.isArray(imported.projects))
        throw new Error();
      load(imported);
      status('Imported content. Preview or export when ready.');
    } catch (_) {
      status('Import an exported content.js from this editor. The file was not executed.');
    }
    event.target.value = '';
  });
  load(initial);
})();
