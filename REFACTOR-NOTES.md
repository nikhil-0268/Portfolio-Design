# Editing the refactored website

The site remains plain HTML, CSS and JavaScript. No installation or build is needed to open it.

- `index.html`, `style.css`, `script.js`: desk entrance and scrolling camera.
- `page2.html`, `portfolio.css`, `portfolio.js`: portfolio layout and interactions.
- `slot-picker.css`, `slot-picker.js`: shared project-picker styling and behavior. Change image paths and odds in `CONFIG` in `slot-picker.js`.
- `content.js`: your name, about text and project data. You can still use `edit-content.html` to export this file. Set each project's `demo` to its live website URL.
- `cursor.css`, `cursor.js`: optional guitar cursor and its saved preference.

The two `lucky-slot-projects*.html` files are generated exports. To refresh them after changing the picker, run `node scripts/export-picker.cjs` from this folder. This command is only for exports; the main website runs directly from its source files.

## Cleanup

Removed the replaced scrolling project gallery and its styles, unused legacy renderer, old backup page, unused picker parameter and camera console warning. Extracted duplicated picker styles and behavior into shared files. Consolidated redundant picker CSS, reused the editor field list, and formatted the source consistently with two-space indentation.

The camera geometry, animation timings, layout wrappers, focus rules and reduced-motion overrides were preserved because changing them could affect appearance or behavior. The pre-refactor backup is outside the website in the task's `work/refactor-before` folder.
