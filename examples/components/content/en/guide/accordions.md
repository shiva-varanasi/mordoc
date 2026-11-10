---
title: Accordions
---

An accordion hides content until a reader opens it. In a group, opening one closes the others.

## On its own

{% accordion title="What is this site?" %}
Components is an example website used to show Mordoc's components.
{% /accordion %}

{% accordion title="Open when the page loads" defaultOpen=true %}
This accordion starts open.

```bash
journey status
```
{% /accordion %}

## In a group

{% accordions %}
{% accordion title="First stop" %}
The Shire is where the journey begins.
{% /accordion %}
{% accordion title="Second stop" %}
Rivendell is the best place to rest on the way.
{% /accordion %}
{% accordion title="Third stop" %}
Moria is the long road under the mountains.
{% /accordion %}
{% /accordions %}
