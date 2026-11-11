---
title: Images
---

Images can be added with Markdown or with the image tag, on their own line, inside a sentence or inside a link. An image shows its title when you hover over it. For a caption and zoom, use an [advanced image](/media/advanced-images).

## A Markdown image

![A route with four stops, from A to D](/images/route-map.jpg "The journey in four stops")

## The image tag

{% image src="/images/volcano.jpg" alt="A volcano at the end of the route" title="The volcano at the end of the road" /%}

## An image from a variable

{% image src=$mapImage alt="A route with four stops, from a variable" /%}

## An image in a sentence

Click the ![eye icon](/icons/preview.svg "Preview") icon to preview your route.

## An image in a link

[{% image src="/icons/getting-started.svg" alt="Guide" /%}](/guide) opens the guide.
