---
title: Images
---

Images can be added with Markdown or with the image tag. A reader can click an image to see it larger.

## A Markdown image

![A map of the Orbit system](/images/orbit-map.svg "The Orbit system")

## The image tag

{% image src="/images/stars.svg" alt="A field of stars" title="Stars around Orbit" /%}

## An image from a variable

{% image src=$diagramImage alt="The Orbit system, from a variable" /%}
