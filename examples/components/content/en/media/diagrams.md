---
title: Diagrams
---

A sequence diagram shows messages between people and systems, written as plain text.

```sequence-diagram
# Comments start with a hash and are not shown.
actor Traveller as "Traveller" icon=/icons/user.svg
actor Guide as "Travel guide" icon=/icons/app.svg
actor Tower as "Watchtower"

Traveller -> Guide: Plan a journey
Guide -> Tower: Check the road\nto Mordor
Tower --> Guide: The pass is open
Guide --> Traveller: Show the route
Guide -> Map: Save for later
```
