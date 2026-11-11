---
title: Links
---

Links lead to other pages of the site, to other sites, or to a heading on the same page.

## Markdown links

- To another page: [Callouts](/guide/callouts)
- With a title, shown when hovering: [Cards](/guide/cards "Go to the cards page")
- To another site: [Mordoc on GitHub](https://github.com/getmordoc/mordoc)
- To a heading on this page: [Variables](#variables)
- To a page that does not exist: [Missing page](/guide/does-not-exist)

## The link tag

- {% link path="/guide/cards" %}Cards{% /link %}
- {% link path="/guide/buttons" title="Go to the buttons page" %}Buttons, with a title{% /link %}

## Variables

Variables come from the site's settings. This product is called {% $productName %}, and its support address is {% $supportEmail %}.
