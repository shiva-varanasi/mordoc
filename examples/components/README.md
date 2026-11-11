# Components example site

An example website with every Mordoc component and page type, used to see them working and to test them. Its content follows a journey in four stops. The site runs on the Mordoc code in this repository.

## Run it

You need Node.js 24.18.1 or later. In the repository root:

```bash
npm install
npm run build
```

Then in this folder:

```bash
npm run build   # static site in dist/
npm run dev     # development server
```

## Open the built site

Build the site, then serve `dist/` with any static file server, for example:

```bash
npm run build
python3 -m http.server 4173 -d dist
```

Open http://localhost:4173. This is the site as it is published. Stop the server with Ctrl+C.
