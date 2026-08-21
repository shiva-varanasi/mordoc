# Mordoc LinkedIn video player

`mordoc-video.html` plays the full ~38s marketing sequence in your browser; you screen-record it. No tools to install.

## One-time setup

1. Start the three dev servers (order matters for ports):
   - `test-project`  → `npm run dev` → :5173
   - `test-project2` → `npm run dev` → :5174
   - `test-project4` → `npm run dev` → :5175
2. Slider themes are forced automatically — the player loads the light half as
   `localhost:5174/introduction?theme=light` and the dark half as
   `127.0.0.1:5174/introduction?theme=dark` (a helper script in
   `test-project2/config/custom-head.html` applies the `?theme=` parameter).
   No manual toggling needed.
3. Drop your logo at `marketing-video/assets/logo.svg` (`logo.png` also works as a
   fallback; a dashed placeholder shows until one exists). The end card flies
   toward it "planet approach"-style — tune `logoApproach` in the player's `CFG`.

## Recording

1. Open `mordoc-video.html` in Chrome/Edge. The pre-flight panel checks servers + assets.
2. Press **F11** for fullscreen (or leave "Enter fullscreen on Play" checked).
3. Start recording — **Win+G** Game Bar (set 60 fps under Settings → Captures) or OBS.
4. Click **Play**. It starts with 0.5s black, ends holding on the logo frame — stop recording there.
5. Trim the first/last second in any editor (Photos app "Trim" works). Post as MP4 1080p to LinkedIn.

Keys during playback: **Space** pause/resume, **Esc** back to pre-flight. The cursor auto-hides over the video.

## Previewing / tuning

- `mordoc-video.html?scrub` — a scrubber to inspect any moment without recording.
- `mordoc-video.html?t=12.5` — render frozen at a given second.
- All timings, pan distances, and server URLs are in the `CFG` object at the top of the file's `<script>`. If a content-page pan runs past the page bottom, lower `pans.b2/b6.pan`.

## Sequence

ROOT landing (code-rain hero) → cursor clicks the "Plug in" CTA → ROOT content → code-rain dissolve → SLAB landing (light) → crossfade → SLAB content light↔dark slider → yellow slab wipe (SLAB's brutalist aesthetic) → APOGEE landing (starfield hero) → crossfade → APOGEE content → warp-streak dissolve → logo end card. The wipes/jumps use the projects' actual hero SVG animations, loaded live from the dev servers.
