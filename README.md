# Wild Camel — Activations (web catalogue)

The compact Activations deck as a web app: 191 ideas across Physical, Hybrid and Digital, with filters (family, category, scale, lead time, status), search, a detail view per idea, and a shortlist that can be emailed to Wild Camel or shared as a link.

Static site, no build step, no server: `index.html`, `style.css`, `app.js`, the data in `data/catalogue.js`, pictures in `img/`. It runs on GitHub Pages as is, and also opens straight from this folder.

## Publish on GitHub Pages

1. Put these files at the root of a **public** repository (free GitHub Pages only serves public repos).
2. Repository → Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. The site appears at `https://<account>.github.io/<repository>/` within a minute or two.

## Links

- Filtered views keep their state in the address bar: `?f=H&s=STAND&l=6` (family, scale, lead-time bucket), `?c=ROBOTICS`, `?q=horse`.
- One idea: `#P-46`. A shared shortlist: `?list=P-46,H-85,D-01`.

## Updating

The content and pictures are generated from the deck sources (build kit → `web/build_data.js` writes `data/catalogue.js`, `web/make_images.py` cuts `img/cards` and `img/big`). Edit the deck's `content.js`, re-run both, and replace the `data/` and `img/` folders here.

`<meta name="robots" content="noindex">` in `index.html` keeps the page out of search engines while it lives on a github.io address; remove that line to let it be indexed.
