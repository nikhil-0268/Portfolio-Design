# Nikhil Sharma — Portfolio

A two-page portfolio. Page one (`index.html`) is a seated descent into a desk: as you scroll, three camera views of the same room morph into each other until the laptop screen becomes the doorway. Page two (`page2.html`) is the portfolio itself.

## Running it

Use `npm run dev` (needs Node.js) or double-click `START-PREVIEW.cmd`. Keep the terminal window open while previewing. Opening `index.html` directly from the folder also works.

You can deep-link straight into the descent for screenshots or sharing:

- `index.html#laptop` — lands on the laptop, portfolio door ready.
- `index.html?camera=0.5` — lands halfway down the journey (`0` to `1`).

## How the entrance works

- `index.html` holds the three desk views and the laptop screen overlay.
- `camera-mesh.js` stores matched landmarks for the three views (the numbered points are the laptop display, keyboard, and chassis corners).
- `camera-renderer.js` builds the WebGL morph and picks the WebP frames when the browser supports them.
- `script.js` maps scroll position to camera progress, reveals the laptop door near the end, and handles `#laptop` and `?camera=`.
- Without WebGL the three stills cross-fade instead. Without JavaScript a `noscript` fallback shows the full desk view.

All the images are 16:9 and framed so the whole composition stays visible, so the entrance does not crop the room on tall screens.

## Adding your work

Read `ADD-YOUR-PROJECTS.md` and edit `projects-data.js`. Put screenshots in `project-images/`. While that array is empty the page shows three clearly labelled layout examples instead.

## Adding contact links

Open `site-config.js` and fill in `email` and the `links` array. The "Say hello" section builds itself from those values; until then it explains that the links are not set up. Never put passwords, API keys, or private details in that file.

## The portrait

The stickers stay hidden until you hover the portrait (or tap it, or focus it with the keyboard). `nikhil-portrait.png` is the original transparent export; the page uses `nikhil-portrait-tight.png`, a head-and-shoulders crop of the same photo, so the face reads at full size. There are no flower or Just Chill stickers.

## The guitar cursor

`cursor-guitar.png` is the original artwork. On desktop pointer devices it replaces the normal cursor; the switch sits in the bottom-left corner and the choice is remembered. It is never shown on touch devices or narrow windows. Touch devices keep their usual behaviour.

## Accessibility notes

- Every text/background pair meets WCAG AA contrast (the muted greys and the accent dot were darkened for this; nothing else moved).
- The entrance has three ways to reach the portfolio: scroll to the laptop and press the button, use "Skip the scroll" / "Go to laptop", or follow the plain link in the `<noscript>` block. With JavaScript off you still get the full desk and a way forward.
- Scroll reveals on page two are gated behind a `.js` class, so content is never left hidden if the script does not run.
- The portrait switches with hover, with a click or tap, and with the keyboard; `aria-pressed` reports its state.
- Focus is never left on a control that has scrolled out of reach: the laptop door becomes `inert` and `aria-hidden` again once it fades.

## Performance notes

`assets/` holds WebP versions of every large image plus favicons. The three desk frames went from about 1.9 MB each to about 110 KB (with 2x variants for large screens), and `cursor-guitar.png` has a WebP twin. The PNG originals are kept because the `<picture>` elements fall back to them.

## File map

| File | Purpose |
| --- | --- |
| `index.html`, `style.css`, `script.js` | The desk entrance |
| `camera-mesh.js`, `camera-renderer.js` | WebGL landmark morph |
| `page2.html`, `portfolio.css`, `portfolio.js` | The portfolio page |
| `projects-data.js`, `projects-renderer.js` | Project cards |
| `site-config.js` | Contact links |
| `cursor.css`, `cursor.js`, `cursor-guitar.png` | Optional guitar cursor |
| `assets/` | Optimised images and favicons |
| `preview-server.cjs` | Local preview server |
| `second-page-demo/` | Earlier standalone prototype, kept for reference |
| `image-prompts-v3/v4/v5.txt` | Prompts used to generate the desk views and cursor |
