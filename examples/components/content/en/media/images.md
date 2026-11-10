---
title: Images
---

Images can be added with Markdown or with the image tag, on their own line, inside a sentence or inside a link. An image shows its title when you hover over it. For a caption and zoom, use an [advanced image](/media/advanced-images).

## A Markdown image

![A map of the road to Mordor](/images/mordor-map.jpg "The road to Mordor")

## The image tag

{% image src="/images/volcano.jpg" alt="A volcano in Mordor" title="The volcano at the end of the road" /%}

## An image from a variable

{% image src=$diagramImage alt="The road to Mordor, from a variable" /%}

## An image in a sentence

Click the ![bell icon](/icons/bell.svg "Notifications") icon to see your notifications.

## An image in a link

[![Components](/icons/app.svg)](/guide) opens the guide.
