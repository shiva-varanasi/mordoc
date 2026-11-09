---
title: Home
layout: landing
---

{% hero
  title="Every component,"
  titleAccent="one site."
  description="Orbit is a fictional app. Its docs show every Mordoc component in the default look."
  background="/images/dots.svg"
%}
{% button path="/guide" %}Read the guide{% /button %}
{% button path="/media" variant="secondary" %}See the media{% /button %}
{% /hero %}

{% section title="What is on this site" %}
Each page shows one feature, with a sentence or two about what it is.

{% cardGrid %}
{% card title="Callouts" icon="/icons/bell.svg" path="/guide/callouts" %}
Notes, tips, warnings and dangers.
{% /card %}
{% card title="Cards" icon="/icons/grid.svg" path="/guide/cards" tag="New" %}
Plain, icon, image and linked cards.
{% /card %}
{% card title="Media" image="/images/orbit-map.svg" path="/media" %}
Images, video and diagrams.
{% /card %}
{% /cardGrid %}
{% /section %}

{% section title="A section with a background image" background="/images/dots.svg" %}
Sections group content on landing pages. This one has a background image.
{% /section %}

{% section %}
A section can also have no title.
{% /section %}

{% hero
  title="A hero with an image"
  description="A hero can also show an image with its text."
  image="/images/orbit-map.svg"
%}
{% button path="/guide/cards" %}See cards{% /button %}
{% /hero %}
