# PH Law Atlas

Ontario public health cases and legal authorities. This static React application reads the repository's Markdown case cards at build time; those source files remain authoritative and are never modified by the app.

## Local development

```sh
npm install
npm run dev
```

Useful commands:

- `npm run content:validate` checks front matter, dates, IDs, relationships, and legislation references.
- `npm run build` generates the content index, type-checks the app, and creates a production build in `dist/`.
- `SHOW_DRAFTS=false npm run build` excludes cases whose editorial status is `draft` or `stub`.

Drafts and stubs are visible by default so the current development corpus can be reviewed. Generated files in `generated/` and `dist/` are build artifacts and should not be edited.
