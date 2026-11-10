---
title: Code
---

Code blocks show code with highlighting and a copy button. Variables from the site's settings are filled in, unless a code block is shown as written.

## JavaScript

```js
const planets = ['Mercury', 'Venus', 'Earth'];
console.log(planets.length);
```

## TypeScript

```ts
interface Planet {
  name: string;
  moons: number;
}
```

## Shell

```bash
orbit new my-universe
cd my-universe
```

## JSON

```json
{ "name": "Earth", "moons": 1 }
```

## YAML

```yaml
planet: Mars
moons: 2
```

## Without a language

```
Plain text, with no highlighting.
```

## With variables

The address and the version come from the site's settings.

```js
import { Orbit } from '@orbit/sdk';

const orbit = new Orbit({ baseUrl: '{% $apiBaseUrl %}' });
```

```bash
npm install @orbit/sdk@{% $sdkVersion %}
```

## Shown as written

A code block marked `{% process=false %}` shows Markdoc syntax exactly as written.

```markdown {% process=false %}
{% callout type="tip" %}
Orbit version {% $sdkVersion %} is out.
{% /callout %}
```
