# Add your actual projects

The “Small steps. Good ideas.” cards read from `projects-data.js`. While its array is empty, the page shows three clearly labelled example cards. As soon as you add a project, the examples are replaced by your work.

1. Put each project screenshot into the `project-images` folder. Use simple filenames such as `weather-app.png`.
2. Open `projects-data.js` in VS Code.
3. Replace the empty `[]` with your project objects, using the example below. Put a comma between objects.
4. Save and refresh the preview. Your entries replace the examples automatically, in the order listed.

```js
window.PORTFOLIO_PROJECTS = [
  {
    title: 'Your project name',
    category: 'Web application',
    description: 'Explain what it does and what you personally built.',
    tools: ['HTML', 'CSS', 'JavaScript'],
    image: 'project-images/your-project.png',
    demo: '',
    github: ''
  }
];
```

## What each field does

| Field | Required | Notes |
| --- | --- | --- |
| `title` | Yes | Cards without a title are skipped. |
| `category` | No | Shown top-right on the card, e.g. `Web application`. |
| `description` | No | One or two honest sentences is plenty. |
| `tools` | No | An array, shown joined with slashes: `HTML / CSS / JavaScript`. |
| `image` | No | A screenshot in `project-images/`. If it is missing or fails to load, the card shows a large project number instead. |
| `demo` | No | Live HTTPS link. The button only appears when the link is valid. |
| `github` | No | Repository link. Same rule. |

Use a live HTTPS link for `demo` and a repository link for `github`. Leave either empty if it is unavailable; the corresponding button will not appear. Screenshots are optional. Do not include passwords, API keys, or private credentials.

## Filling in the rest of the page

- Contact links live in `site-config.js`, not in the HTML. Add your email and any profile links there.
- The intro, tags, and about text are plain HTML in `page2.html`. Keep the wrapper elements and classes so the layout keeps working.

If you want me to fill this in, send each project's name, a screenshot, one or two sentences about it, the tools used, and its GitHub/live links (if available). You can also share the project folder or ZIP.
