# Project picker

The main portfolio uses `slot-picker.css` and `slot-picker.js` in `page2.html`. The machine is alongside the result on desktop and stacked on mobile. There is no collection shelf or saved collection.

Edit projects in `content.js`, or use `edit-content.html`. Set `title`, `description` and `demo` (your live website URL). Optional `logo` and `color` fields customize the reels. Empty demo URLs show Coming soon.

Standalone examples, asset paths and win odds are in CONFIG in `slot-picker.js`. A miss is always followed by a win.

After changing the picker, run `node scripts/export-picker.cjs` to refresh both standalone HTML exports. The main website needs no build step. Open `index.html` for the complete experience.
