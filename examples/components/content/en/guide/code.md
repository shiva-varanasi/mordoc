---
title: Code
---

Code blocks show code with highlighting and a copy button. Variables from the site's settings are filled in, unless a code block is shown as written.

## JavaScript

```js
const stops = ['Stop A', 'Stop B', 'Stop C'];
console.log(stops.length);
```

## TypeScript

```ts
interface Stop {
  name: string;
  daysOnFoot: number;
}
```

## Shell

```bash
journey plan stop-a stop-d
cd my-journey
```

## JSON

```json
{ "name": "Stop B", "daysOnFoot": 40 }
```

## YAML

```yaml
stop: Stop C
daysOnFoot: 55
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
