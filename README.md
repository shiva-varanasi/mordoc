# Mordoc

A documentation framework that turns Markdoc content into fast, static documentation websites.

You write your pages in Markdown, with [Markdoc](https://markdoc.dev) tags for richer content. Mordoc builds every page as static HTML, so it loads fast and is SEO-friendly, and then switches pages in the browser without a full reload.

## What you get

- **Components:** callouts, cards, accordions, columns, buttons, images, video and code blocks with a copy button.
- **Sequence diagrams,** written as plain text.
- **API reference** pages generated from an OpenAPI description.
- **Search** across your whole site, built in.
- **Light and dark mode,** and documentation in more than one language.
- **One config folder** for navigation, variables and your own styling.

## Documentation

Read the full documentation at [mordoc.dev](https://mordoc.dev).

## Get started

```bash
npx create-mordoc-app my-docs
cd my-docs
npm run dev
```

This creates a new documentation site in `my-docs` and starts a development server. Edit the pages in `content/` and the settings in `config/`. When you are ready to publish, run `npm run build` and deploy the static site it creates.

## Working on Mordoc

```bash
npm install
npm run build
```

The example site in [`examples/components`](examples/components) shows every component and runs on the code in this repository.

## License

Mordoc is released under the [MIT License](LICENSE). The authors are listed in [AUTHORS](AUTHORS).
