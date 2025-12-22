---
title: Engines — The Photoniuum Core
description: The heart of lightspeed travel: how it spools, what it wants, and what it refuses to forgive.
author: Photoniuum Engineering Guild
date: 2025-12-22
---

# Engines — The Photoniuum Core

The Photoniuum core is sometimes described as *“a lantern that remembers being a star.”*

Engineers prefer: **“Do not tap the casing.”**

![A simplified photonic core schematic](/images/photonic-core.svg "Photoniuum core (stylized)")

## Spooling sequence (conceptual)

```text
1) Verify window lock
2) Prime flux channels
3) Begin spool (listen for the choir)
4) Confirm starwake limiters
5) Commit the jump
```

## Markdown showcase: inline code + emphasis

If the status panel reads `CHOIR: DISPLEASED`, do **not** interpret it as “maybe.”

## A tiny pseudo-API (code fence)

```typescript
type WindowId = string;

interface JumpPlan {
  window: WindowId;
  maxStarwake: 1 | 2 | 3 | 4 | 5;
  apology: string;
}

export function commitJump(plan: JumpPlan) {
  if (!plan.apology || plan.apology.length < 12) {
    throw new Error("Apology too short. The universe has standards.");
  }
  return { ok: true, event: "jump_committed", window: plan.window };
}
```

## Custom components: cards

{% cardGrid cols="2" %}
{% card title="Safety — The Ten-Meter Rule" href="/field-manual/safety" icon="/icons/warning.svg" %}
How to keep your ship, crew, and narrative arc intact during spool.
{% /card %}

{% card title="Relativity — A Friendly Lie" href="/field-manual/relativity" icon="/icons/relativity.svg" %}
Why clocks argue, and why Photoniuum politely ignores them.
{% /card %}
{% /cardGrid %}


