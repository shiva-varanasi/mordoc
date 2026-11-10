---
title: Callouts
---

A callout highlights a short message. There are four types, each with or without a title.

## With a title

{% callout type="note" title="Note" %}
Orbit saves your work every minute.
{% /callout %}

{% callout type="tip" title="Tip" %}
Press the space bar to pause the orbit view.
{% /callout %}

{% callout type="warning" title="Warning" %}
Deleting a planet also deletes its moons.
{% /callout %}

{% callout type="danger" title="Danger" %}
Resetting the universe cannot be undone.
{% /callout %}

## Without a title

{% callout %}
A callout without a type is a note.
{% /callout %}

{% callout type="tip" %}
A tip without a title.
{% /callout %}

{% callout type="warning" %}
A warning without a title.
{% /callout %}

{% callout type="danger" %}
A danger without a title.
{% /callout %}

## With other content

{% callout type="note" title="Before you start" %}
- Install Orbit.
- Open a new universe.

```bash
orbit new my-universe
```

> Every universe starts with one star.
{% /callout %}
