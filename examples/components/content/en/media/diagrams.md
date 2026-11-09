---
title: Diagrams
---

A sequence diagram shows messages between people and systems, written as plain text.

```sequence-diagram
# Comments start with a hash and are not shown.
actor User as "Orbit user" icon=/icons/user.svg
actor App as "Orbit app" icon=/icons/app.svg
actor Server as "Orbit server"

User -> App: Open a universe
App -> Server: Load planets\nand moons
Server --> App: 8 planets
App --> User: Show the system
App -> Cache: Save for later
```
