# Make this portfolio yours

## Easiest way: the content editor

1. Run START-PREVIEW.cmd. Keep its window open.
2. Open edit-content.html at the same preview address (or open this file directly from your folder).
3. Fill in your introduction, About, contact links, and projects. Use **Add a project** for each completed project. Use the up/down arrows to reorder them.
4. Copy your screenshots into project-images/ and enter each filename as project-images/my-project.png. The editor does not copy image files for you.
5. **Preview draft** saves a browser-local draft and opens it. This does not change the public site.
6. **Export content.js** downloads your finished content. Move that file into this portfolio folder, replacing content.js. Keep the filename exactly content.js (not content (1).js).
7. Refresh the portfolio. For a hosted site, upload/publish the updated content.js and your new images too.

You can restore a local draft or import a previously exported content.js. Drafts are tied to this browser and address, so export before changing preview addresses. No account or backend is required. The editor is not linked in the public navigation.

## Edit in VS Code instead

Open portfolio.code-workspace, then content.js. All the introduction, About, circular gallery tiles, contact details, and projects are here. Save and refresh.

Add a project to the projects array like this (replace the example values):

```js
{
  title: 'My project',
  category: 'Web application',
  description: 'What it does and who it helps.',
  image: 'project-images/my-project.png',
  role: 'Design and development',
  year: '2026',
  tools: ['HTML', 'CSS', 'JavaScript'],
  story: 'The problem I wanted to solve.\n\nHow I built it.\n\nWhat I learned.',
  demo: '',
  github: '',
  gallery: ['project-images/my-project-detail.png']
}
```

Separate project objects with commas. Leave optional links or images empty. Each project automatically gets a cover in the horizontal gallery and a detail page. No need to edit HTML for each new project.

With no projects, the site displays three explicitly labelled preview slots. Your real projects replace these as soon as you add them. The long desktop scroll adjusts to your project count; phones use a swipeable gallery. The circular gallery uses your orbitItems, with no snowflake or flower.

## Existing content

Older projects-data.js and site-config.js are preserved as fallbacks when the corresponding content.js sections are empty. If you previously filled them and now want to clear them, clear those legacy arrays/email too.

## Files

- index.html: existing scrolling desk entrance; laptop links to page2.html.
- page2.html + portfolio.css + portfolio.js: main portfolio and interactions.
- project.html: automatic project detail pages.
- content.js: your content.
- edit-content.html + editor.js + editor.css: local content editor.
- cursor.js + cursor.css: existing guitar cursor, with standard cursor switch.

The pre-redesign code backup is in the original task's outputs/before-reference-redesign folder. Your photos and desk artwork were not replaced.
