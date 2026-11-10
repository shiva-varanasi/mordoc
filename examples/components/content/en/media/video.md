---
title: Video
---

A clip plays a video file from the site. A video embed shows a video from a hosting service.

## A clip with a thumbnail and title

{% clip src="/videos/volcano.mp4" thumbnail="/images/volcano-thumbnail.jpg" title="The volcano at night" alt="Smoke rising from a glowing volcano" /%}

## A clip without a thumbnail

{% clip src="/videos/volcano.mp4" alt="Smoke rising from a glowing volcano" /%}

## A video embed

{% videoEmbed src="https://www.youtube.com/watch?v=aqz-KE-bpKQ" title="Big Buck Bunny (Blender Foundation, CC BY 3.0)" /%}

## A video embed with another shape

{% videoEmbed src="https://www.youtube.com/watch?v=aqz-KE-bpKQ" title="The same video in 4:3" alt="Big Buck Bunny in a 4:3 frame" aspectRatio="4 / 3" /%}

## A video from an unknown service

{% videoEmbed src="https://video.example.com/watch/mordor" title="A video from an unknown service" thumbnail="/images/volcano.jpg" /%}
