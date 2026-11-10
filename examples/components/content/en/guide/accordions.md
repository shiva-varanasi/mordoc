---
title: Accordions
---

An accordion hides content until a reader opens it. In a group, opening one closes the others.

## On its own

{% accordion title="What is Orbit?" %}
Orbit is a fictional app used to show Mordoc's components.
{% /accordion %}

{% accordion title="Open when the page loads" defaultOpen=true %}
This accordion starts open.

```bash
orbit status
```
{% /accordion %}

## In a group

{% accordions %}
{% accordion title="First planet" %}
Mercury is closest to the sun.
{% /accordion %}
{% accordion title="Second planet" %}
Venus is the hottest planet.
{% /accordion %}
{% accordion title="Third planet" %}
Earth is where Orbit's team lives.
{% /accordion %}
{% /accordions %}
