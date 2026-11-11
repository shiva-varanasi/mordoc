---
title: Columns
---

Columns place content side by side, with or without a line between them.

## Without a divider

{% columns %}
{% column %}
### Before
The guide showed one stop at a time.
{% /column %}
{% column %}
### After
The guide shows the whole route.
{% /column %}
{% /columns %}

## With a divider

{% columns divider=true %}
{% column %}
### Left
- Hills
- Rivers
{% /column %}
{% column %}
### Middle
- Forests
- Mountains
{% /column %}
{% column %}
### Right
- Deserts
- Volcanoes
{% /column %}
{% /columns %}
