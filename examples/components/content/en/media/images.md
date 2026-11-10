---
title: Images
---

Images can be added with Markdown or with the image tag, on their own line, inside a sentence or inside a link. An image shows its title when you hover over it. For a caption and zoom, use an [advanced image](/media/advanced-images).

## A Markdown image

![A map of the Orbit system](/images/orbit-map.svg "The Orbit system")

## The image tag

{% image src="/images/stars.svg" alt="A field of stars" title="Stars around Orbit" /%}

## An image from a variable

{% image src=$diagramImage alt="The Orbit system, from a variable" /%}

## An image in a sentence

Click the ![bell icon](/icons/bell.svg "Notifications") icon to see your notifications.

## An image in a link

[{% image src="/icons/app.svg" alt="Orbit app" /%}](/guide) opens the guide.
