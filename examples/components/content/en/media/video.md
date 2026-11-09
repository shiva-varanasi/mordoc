---
title: Video
---

A clip plays a video file from the site. A video embed shows a video from a hosting service.

## A clip with a thumbnail and title

{% clip src="/videos/orbit.mp4" thumbnail="/images/orbit-map.svg" title="Orbit in motion" alt="A planet circling a star" /%}

## A clip without a thumbnail

{% clip src="/videos/orbit.mp4" alt="A planet circling a star" /%}

## A video embed

{% videoEmbed src="https://www.youtube.com/watch?v=aqz-KE-bpKQ" title="Big Buck Bunny (Blender Foundation, CC BY 3.0)" /%}

## A video embed with another shape

{% videoEmbed src="https://www.youtube.com/watch?v=aqz-KE-bpKQ" title="The same video in 4:3" alt="Big Buck Bunny in a 4:3 frame" aspectRatio="4 / 3" /%}

## A video from an unknown service

{% videoEmbed src="https://video.example.com/watch/orbit" title="A video from an unknown service" thumbnail="/images/stars.svg" /%}
