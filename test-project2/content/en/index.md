---
title: Home
layout: landing
---

{% hero
  title="No decoration."
  titleAccent="Just structure."
  description="SLAB is a documentation tool built like brutalist architecture — raw materials, exposed structure, nothing hidden behind a coat of paint. Write the content, pour the structure, ship the building."
%}
{% button path="/introduction" %}Read docs{% /button %}
{% /hero %}

{% section title="Everything load-bearing, nothing decorative" %}
{% cardGrid cols="3" %}
{% card title="Break Ground" path="/introduction" icon="/icons/card-icons/break-ground.svg" %}
Set the foundation, run it locally, and see the structure before you add a single wall.
{% /card %}
{% card title="Pour the Structure" path="/writing-content/markdown-basics" icon="/icons/card-icons/pour-structure.svg" %}
Markdown in, a finished building out — warning signage, grid layouts, modular panels, all load-bearing.
{% /card %}
{% card title="Set the Building Codes" path="/configuration/site-configuration" icon="/icons/card-icons/building-codes.svg" %}
Zoning, corridors, finish schedule, materials palette — every code is yours to set.
{% /card %}
{% /cardGrid %}
{% /section %}

{% section title="When it's ready for occupancy" %}
{% cardGrid cols="2" %}
{% card title="Pour the Slab" path="/publishing/build-your-site" icon="/icons/card-icons/pour-slab.svg" %}
Generate a static structure and set it down on any lot you already own.
{% /card %}
{% card title="Final Walkthrough" path="/publishing/preview-before-publishing" icon="/icons/card-icons/final-walkthrough.svg" %}
Walk the whole building before anyone else steps inside. No surprise load-bearing walls.
{% /card %}
{% /cardGrid %}
{% /section %}
