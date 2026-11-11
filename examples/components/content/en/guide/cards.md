---
title: Cards
---

A card shows a short piece of content. Its look depends on the options it has.

## Plain, icon and image cards

{% cardGrid %}
{% card title="Plain card" %}
A card with only a title and text.
{% /card %}
{% card title="Icon card" icon="/icons/writing.svg" %}
A card with an icon.
{% /card %}
{% card title="Image card" image="/images/route-map.jpg" %}
A card with an image.
{% /card %}
{% /cardGrid %}

## Linked cards and tags

{% cardGrid cols="2" %}
{% card title="Linked card" path="/guide/buttons" %}
The whole card links to the buttons page.
{% /card %}
{% card title="Card with a tag" tag="Beta" path="/guide/columns" %}
A tag shows a short label on the card.
{% /card %}
{% /cardGrid %}

## A card with only a title

{% cardGrid cols="4" %}
{% card title="Stop A" /%}
{% card title="Stop B" /%}
{% card title="Stop C" /%}
{% card title="Stop D" /%}
{% /cardGrid %}
