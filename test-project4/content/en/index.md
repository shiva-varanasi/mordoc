---
title: Home
layout: landing
---

{% hero
  title="Full telemetry."
  titleAccent="Zero blind spots."
  description="APOGEE is the flight operations manual for your documentation — readable telemetry, reconfigurable systems, and a launch sequence that never skips a check."
  background="/images/hero-images/warp-streaks.svg"
%}
{% button path="/introduction" %}Begin countdown{% /button %}
{% /hero %}

{% section title="Every system, fully instrumented" %}
{% cardGrid cols="3" %}
{% card title="Ignition" path="/introduction" icon="/icons/card-icons/ignition.svg" %}
Power up a new project, run your first systems check, and watch the console come online.
{% /card %}
{% card title="Log Telemetry" path="/writing-content/markdown-basics" icon="/icons/card-icons/log-telemetry.svg" %}
Markdown in, a full instrument panel out — status lights, console modules, mission displays, all live.
{% /card %}
{% card title="Calibrate Everything" path="/configuration/site-configuration" icon="/icons/card-icons/calibrate.svg" %}
Livery, cockpit display, comm channels, calibration settings — every dial is yours to set.
{% /card %}
{% /cardGrid %}
{% /section %}

{% section title="Cleared for launch" %}
{% cardGrid cols="2" %}
{% card title="Fuel the Rocket" path="/publishing/build-your-site" icon="/icons/card-icons/fuel-rocket.svg" %}
Generate a static build and stage it on any launchpad you already have clearance for.
{% /card %}
{% card title="Final Countdown Check" path="/publishing/preview-before-publishing" icon="/icons/card-icons/final-check.svg" %}
Walk every system one more time before liftoff. No holds, no surprises on the pad.
{% /card %}
{% /cardGrid %}
{% /section %}
