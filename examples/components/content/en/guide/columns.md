---
title: Columns
---

Columns place content side by side, with or without a line between them.

## Without a divider

{% columns %}
{% column %}
### Before
Orbit showed one planet at a time.
{% /column %}
{% column %}
### After
Orbit shows the whole system.
{% /column %}
{% /columns %}

## With a divider

{% columns divider=true %}
{% column %}
### Left
- Planets
- Moons
{% /column %}
{% column %}
### Middle
- Stars
- Comets
{% /column %}
{% column %}
### Right
- Galaxies
- Nebulae
{% /column %}
{% /columns %}
