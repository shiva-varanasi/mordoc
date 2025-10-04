---
title: First Steps
description: Your first steps with Mordoc documentation
order: 3
tags: [guide, tutorial]
---

# First Steps

Now that you understand the basics, let's dive deeper into building great documentation.

## Organizing Your Content

Good documentation structure is key to helping users find information quickly.

### Best Practices

1. **Start with a clear hierarchy**: Group related topics together
2. **Use descriptive file names**: `authentication.md` is better than `auth.md`
3. **Keep pages focused**: One topic per page
4. **Use consistent naming**: Stick to lowercase with hyphens

### Example Structure

```
content/en/
├── index.md                    # Overview
├── getting-started.md          # Quick start
├── guides/
│   ├── installation.md
│   ├── configuration.md
│   └── deployment.md
├── reference/
│   ├── api.md
│   └── cli.md
└── examples/
    ├── basic-setup.md
    └── advanced-usage.md
```

## Writing Great Documentation

### Clear Headings

Use headings to create a clear outline. Headings automatically generate the table of contents.

```markdown
# Main Topic (H1 - page title)
## Major Section (H2)
### Subsection (H3)
#### Minor Point (H4)
```

### Code Examples

Show, don't just tell. Include working code examples:

```typescript
import { Builder } from 'mordoc';

const builder = new Builder({
  projectRoot: './my-docs',
  outputDir: './dist'
});

await builder.build();
```

### Callouts and Alerts

Use blockquotes for important information:

> **Note:** This is an important note that users should pay attention to.

> **Warning:** Be careful with this operation - it cannot be undone.

> **Tip:** Here's a helpful tip to save time.

## Navigation Tips

### Internal Links

Link to other pages using relative paths:

```markdown
See the [Getting Started](../getting-started) guide.
Check out [Installation](installation) for details.
```

### Anchor Links

Link to headings within a page:

```markdown
Jump to [Code Examples](#code-examples)
```

## Search Optimization

Make your content discoverable:

1. **Use descriptive titles**: Clear, specific titles improve search
2. **Add descriptions**: The frontmatter description appears in search results
3. **Use tags**: Tags help categorize and filter content
4. **Include keywords**: Use terms your users will search for

Example frontmatter:

```yaml
---
title: Authentication Guide
description: Learn how to implement user authentication in your application
tags: [authentication, security, users, login]
---
```

## Advanced Features

### Custom Components

Mordoc supports custom Markdoc components for rich, interactive content:

- Callout boxes
- Tabbed interfaces
- Code block enhancements
- Interactive examples

(Component support coming soon!)

### Variables

Use variables in your content that can be configured globally:

```markdown
Install version {% $version %} of the package.
```

### Conditional Content

Show different content based on conditions:

```markdown
{% if $platform === "mac" %}
Use the macOS installer
{% else %}
Use the Windows installer
{% /if %}
```

## Testing Your Documentation

Before publishing:

1. ✓ Check all links work
2. ✓ Test code examples
3. ✓ Review on mobile devices
4. ✓ Run through the user journey
5. ✓ Get feedback from others

## Performance Tips

Mordoc sites are fast by default, but you can optimize further:

- **Optimize images**: Use web-optimized formats (WebP, optimized PNG/JPG)
- **Keep pages focused**: Split very long pages
- **Use lazy loading**: For heavy content below the fold
- **Minimize custom CSS**: Use the built-in theme system

## Maintenance

Keep your documentation up to date:

- **Set review dates**: Add `date` to frontmatter
- **Mark outdated content**: Use `draft: true` temporarily
- **Version your docs**: Create version-specific directories if needed
- **Track changes**: Use Git to manage updates

## Getting Help

Stuck? Here are some resources:

- Documentation homepage
- Community forum
- GitHub issues
- Example projects

## What's Next?

You now have the foundation to build excellent documentation. Some ideas:

- Add API reference pages
- Create tutorial series
- Include video content
- Build interactive examples
- Set up automated deployment

Happy documenting! 🚀

