# Mordoc

A modern static site generator for documentation with SSG + SPA capabilities. Build fast, SEO-friendly documentation sites with smooth client-side navigation.

## Overview

Mordoc combines the best of static site generation and single-page applications to deliver documentation sites that are:
- **SEO-friendly** with pre-rendered HTML for every page
- **Fast to navigate** with client-side routing after initial load
- **Easy to write** using Markdown and Markdoc
- **Customizable** with simple JSON configuration
- **Multi-language ready** with built-in internationalization support

## Key Features

- 📄 **Markdoc-powered** - Write content in Markdown with powerful custom components
- 🚀 **Static + SPA** - Pre-rendered HTML with smooth client-side navigation
- 🔍 **Built-in Search** - Instant full-text search powered by Pagefind
- 🌍 **Multi-language** - First-class support for internationalization
- 🎨 **Customizable Theming** - Configure colors and styles with simple JSON
- ⚡ **React-based** - Modern React 19 for component rendering
- 📱 **Responsive** - Mobile-friendly by default

## Installation

Create a new Mordoc documentation site using `create-mordoc-app`:

```bash
npm create mordoc-app my-docs
```

> **Note:** The `create-mordoc-app` package is not yet published. Coming soon!

Or with other package managers:

```bash
# Using yarn
yarn create mordoc-app my-docs

# Using pnpm
pnpm create mordoc-app my-docs
```

## Quick Start

1. **Create a new project:**

```bash
npm create mordoc-app my-docs
cd my-docs
```

2. **Build your documentation:**

```bash
npm run build
```

3. **Start the development server:**

```bash
npm run dev
```

Your documentation site will be available at `http://localhost:3000`

## CLI Commands

### `mordoc build`

Generate the static documentation site.

```bash
mordoc build [options]
```

**Options:**

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--output <dir>` | `-o` | Output directory | `dist` |
| `--verbose` | `-v` | Enable verbose logging | `false` |
| `--drafts` | `-d` | Include draft content in build | `false` |
| `--no-clean` | | Don't clean output directory before build | `false` |
| `--help` | `-h` | Show help message | |

**Examples:**

```bash
# Basic build
mordoc build

# Build to custom directory
mordoc build --output build

# Build with drafts and verbose output
mordoc build --verbose --drafts
```

### `mordoc dev`

Start the development server to preview your documentation.

```bash
mordoc dev [options]
```

**Options:**

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--port <number>` | `-p` | Port number | `3000` |
| `--host <host>` | `-h` | Host address | `localhost` |
| `--open` | `-o` | Open browser automatically | `false` |
| `--help` | | Show help message | |

**Examples:**

```bash
# Start dev server on default port
mordoc dev

# Use custom port
mordoc dev --port 8080

# Make accessible on network
mordoc dev --host 0.0.0.0
```

> **Note:** The dev server serves the pre-built `dist/` folder. Run `mordoc build` first and rebuild manually after making changes.

## Project Structure

After creating a new project, you'll have the following structure:

```
my-docs/
├── content/              # Your markdown content files
│   └── en/              # English content (default language)
│       ├── index.md     # Homepage
│       ├── getting-started.md
│       └── guides/
│           └── first-steps.md
├── config/              # Configuration files
│   ├── site.json       # Site metadata and settings
│   ├── sidenav.yaml    # Sidebar navigation structure
│   └── styles/         # Theme customization
├── public/              # Static assets (images, fonts, etc.)
├── dist/               # Generated site (after build)
├── package.json
└── node_modules/
```

## Configuration

Mordoc uses simple configuration files in the `config/` directory:

- **`site.json`** - Site metadata (title, description, base URL)
- **`sidenav.yaml`** - Sidebar navigation structure
- **`styles/`** - Theme colors and customization

For detailed configuration options and syntax, see the [Mordoc Documentation](#) *(coming soon)*.

## Content Writing

Write your documentation using Markdown with Markdoc enhancements:

```markdown
---
title: My Page Title
description: Page description for SEO
order: 1
---

# My Page Title

Your content here...
```

### Frontmatter

Each markdown file supports frontmatter for metadata:

- `title` - Page title
- `description` - Page description (for SEO)
- `order` - Sort order in navigation
- `draft` - Mark as draft (excluded unless `--drafts` flag used)

For complete documentation on content writing, Markdoc syntax, and custom components, visit the [Mordoc Documentation](#) *(coming soon)*.

## Development Workflow

1. **Write content** - Add or edit markdown files in `content/`
2. **Build** - Run `npm run build` to generate the static site
3. **Preview** - Run `npm run dev` to preview locally
4. **Iterate** - Make changes and rebuild

## Deployment

Mordoc generates a fully static site in the `dist/` directory. Deploy it to any static hosting service:

- **Netlify** - Drag and drop the `dist/` folder or connect your git repo
- **Vercel** - Import your project and set build command to `npm run build`
- **GitHub Pages** - Push the `dist/` folder to your gh-pages branch
- **AWS S3** - Upload the `dist/` folder to an S3 bucket
- **Any static host** - Upload the `dist/` folder contents

Build command: `npm run build`  
Output directory: `dist`

## Requirements

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn/pnpm equivalent)

## Technology Stack

Mordoc is built with modern web technologies:

- [Markdoc](https://markdoc.dev/) - Markdown authoring framework
- [React 19](https://react.dev/) - UI rendering
- [React Router](https://reactrouter.com/) - Client-side routing
- [Pagefind](https://pagefind.app/) - Static search
- [esbuild](https://esbuild.github.io/) - Fast bundling
- [Prism.js](https://prismjs.com/) - Syntax highlighting

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

---

**Documentation:** [https://mordoc.dev](#) *(coming soon)*  
**Issues:** [GitHub Issues](#)  
**NPM:** [mordoc](#) *(not yet published)*

