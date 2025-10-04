---
title: Getting Started
description: Learn how to create and customize your documentation site
order: 2
tags: [tutorial, basics]
---

# Getting Started

This guide will help you understand how to work with your new documentation site.

## Creating Content

All your documentation lives in the `content/` directory. Each markdown file becomes a page on your site.

### File Structure

Content is organized by language:

```
content/
└── en/                    # English content
    ├── index.md           # Home page (/)
    ├── getting-started.md # This page (/getting-started)
    └── guides/            # Nested pages
        └── first-steps.md # (/guides/first-steps)
```

### Frontmatter

Every markdown file starts with frontmatter - metadata about the page:

```yaml
---
title: Page Title
description: A brief description for SEO
order: 1
tags: [tutorial, basics]
draft: false
---
```

**Available fields:**

- `title` (required): Page title
- `description`: SEO description
- `order`: Sort order in navigation
- `tags`: Array of tags for categorization
- `draft`: Hide from production builds
- `author`: Content author
- `date`: Publication date

## Markdown Syntax

Mordoc supports standard Markdown plus some enhancements.

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Text Formatting

**Bold text** with `**bold**`
*Italic text* with `*italic*`
`Inline code` with backticks

### Lists

Unordered list:
- Item one
- Item two
  - Nested item
  - Another nested item

Ordered list:
1. First item
2. Second item
3. Third item

### Links

[Internal link](getting-started)
[External link](https://example.com)

### Code Blocks

```javascript
function hello() {
  console.log('Hello, world!');
}
```

### Tables

| Feature | Status |
|---------|--------|
| SSG | ✓ |
| SPA | ✓ |
| Search | ✓ |

### Blockquotes

> This is a blockquote
> It can span multiple lines

## Configuration

### Navigation

Edit `config/sidenav.yaml` to customize your sidebar navigation:

```yaml
- label: Home
  path: /
- label: Getting Started
  path: /getting-started
- label: Guides
  children:
    - label: First Steps
      path: /guides/first-steps
```

### Styling

Edit `config/style.json` to customize colors, fonts, and layout:

```json
{
  "colors": {
    "primary": {
      "light": "#000000",
      "dark": "#ffffff"
    }
  }
}
```

Only include the properties you want to override - everything else uses sensible defaults.

## Building and Deploying

### Development

Run the dev server to preview your site:

```bash
npm run dev
```

The server will start at `http://localhost:3000`. Make changes to your content and run `npm run build` to see updates.

### Production Build

Build your site for production:

```bash
npm run build
```

This generates a fully static site in the `dist/` directory that you can deploy anywhere.

### Deployment

The `dist/` folder can be deployed to any static hosting service:

- **Netlify**: Drag and drop the dist folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Push dist folder to gh-pages branch
- **Any CDN**: Upload the dist folder

## Multi-Language Support

To add another language (e.g., Spanish):

1. Create `content/es/` directory
2. Add translated content files
3. URLs will automatically use `/es/` prefix

Example:
- English: `/getting-started`
- Spanish: `/es/comenzar`

## What's Next?

- Learn about [advanced features](guides/first-steps)
- Customize your theme
- Add custom components
- Enable search functionality

Need help? Check the documentation or open an issue on GitHub.

