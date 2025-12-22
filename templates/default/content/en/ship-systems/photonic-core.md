---
title: Photonic Core
description: A deeper look at Photoniuum’s core: channels, limiters, and the “choir” effect.
---

# Photonic Core

The core is a **light-mass engine** that can temporarily convince space to accept a different “here.”

## Components

- **Flux channels**: guide the spool
- **Limiters**: keep starwake below your legal obligations
- **Choir coils**: the part you *hear* (yes, really)

## Configuration example (JSON)

```json
{
  "limiters": {
    "starwake": 3,
    "shear": "conservative"
  },
  "choir": {
    "enabled": true,
    "mode": "soft"
  }
}
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Choir becomes a “scream” | Window instability | Reduce spool, re-acquire window |
| Starwake spikes | Limiter drift | Recalibrate; replace fuses (and ego) |
| Core goes silent | It’s thinking | Give it time. If it’s still silent, *run diagnostics from outside the ship* |


