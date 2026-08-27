# BestLife4Pets companion app, sales demo

**Live: https://aresseveri.github.io/bl4p-companion-demo/**


A clickable demo of a branded companion app, built to show the BestLife4Pets
founder on a sales call. **Not the production app.** No auth, no backend, no
push scheduling, no email export. All state is local.

---

## Before the call: swap in the founder's pet

One file: [`src/constants/demo.ts`](src/constants/demo.ts). Three things are
marked `<-- SWAP`:

1. `DEMO_PET` — name, species, breed, weight, birth year, photo, which SKU.
2. `DEMO_OWNER_FIRST_NAME` — used in the Home greeting.
3. `DEMO_PROGRESS` — the progress photos, plus `DEMO_PET.photo`. **Still the
   highest-value edit.** These are four AI-generated photos of one invented
   dog, bundled in `assets/progress/`. Drop in four real photos of the
   founder's own pet taken weeks apart.

Nothing else needs touching. Every screen reads from this file.

## Run it

```bash
npm run web
```

## Build the thing she opens

```bash
npx expo export -p web
```

Output lands in `dist/` (about 2.7 MB). It is a single-page app, so **it must be
served from a domain root, not a subpath** — the asset paths are absolute.
Rewrites for the two most likely hosts are already committed:

- Netlify: `public/_redirects`
- Vercel: `vercel.json`

Currently deployed to GitHub Pages from the `gh-pages` branch. To redeploy
after a change:

```bash
npm run deploy
``` On her phone she
opens it in Safari and taps Share → Add to Home Screen; the HTML shell in
[`src/app/+html.tsx`](src/app/+html.tsx) sets the iOS meta so it opens without
browser chrome.

---

## Where the content came from

Everything was pulled from her live site on 2026-08-27. Nothing is invented.

- **[`src/constants/theme.ts`](src/constants/theme.ts)** — colors from the CSS
  custom properties on her Shopify theme, type and button styling from
  computed styles on the rendered homepage, radii from her `--rounded-*`
  scale.
- **[`src/constants/products.ts`](src/constants/products.ts)** — five real
  SKUs. Name, price and images from her `products.json` and CDN. **Dosing is
  transcribed from the Dosage block on each product page.** Concern chips are
  the ones on her own product cards. Every FAQ is a question *she* asks on the
  page, with her answer.
- **`assets/fonts/`** — her own self-hosted `.woff2` files. Futura is the
  brand face; Helvetica Neue carries labels and meta. Jost is the leftover
  Shopify theme default and is effectively unused, same as on her site.

### Rules the code follows

- No dose is invented. [`src/lib/dosing.ts`](src/lib/dosing.ts) contains **no
  numbers** — it only resolves the bands transcribed from her labels. If a pet
  falls outside every printed band, the UI says so and points at the bottle
  rather than extrapolating.
- No health claim appears that is not already on her own listing.
- No grey placeholder boxes. Every product image is her real CDN URL.
- The three administration methods are rendered as **alternatives separated by
  "or"**, never as numbered steps. Her page presents them as three parallel
  tiles under "Three easy ways to give it" — a pet parent picks one.
- Bottle pill counts are **not** hardcoded. Her counts differ per SKU and her
  site states them inconsistently (WALK-EASY photo: 180 tablets; Peaceful
  Paws: 400; the dental page says 450 pills in the copy while its own image is
  named `400_TABLETS`). `DEMO_BOTTLE_PILLS` in `demo.ts` carries the number
  you read off the actual bottle; set it to `null` and the reorder nudge drops
  the day count rather than showing a figure nobody can source.

---

## Two things she needs to decide

1. **"Pet Relax Dog Calming Anxiety Relief" is not a live SKU.**
   `/products/pet-relax` redirects to a collection and the handle is absent
   from her 57-product catalog. The live dog calming product is **Peaceful
   Paws Dog Behavior Support** ($24.99), which is what the demo uses. Her own
   asset `BEFORE_AFTER_2000_X_2000_1-25_1.jpg` shows the rename: "Peaceful
   Paws Dog Aggression & Noise Phobia Relief" became "Peaceful Paws Dog
   Behavior Support". Worth telling her the old URL still dangles.

2. **There are no Amazon links anywhere on bestlife4pets.com.** Checked the
   homepage and all five product pages. Every SKU has an `amazonUrl` field in
   `products.ts` set to `null`; the Reorder screen falls back to her own
   product page, which works today. Paste real listing URLs in and the CTA
   switches to "Buy on Amazon" automatically.

### About the fonts

Futura and Helvetica Neue are commercial faces she licenses and self-hosts.
They are **not** bundled in this repo. `public/index.html` declares them as
`@font-face` against her own CDN, which returns
`access-control-allow-origin: *`, so the demo renders in her real type without
this repo ever redistributing the font binaries. The demo does depend on
bestlife4pets.com being reachable for type and product images.

Note: the HTML shell lives in `public/index.html`, **not** `src/app/+html.tsx`.
`+html.tsx` is only honoured by static rendering; under `web.output: "single"`
Expo silently falls back to its default template and drops the font faces and
the iOS meta.

### About the pet photos

The four photos in `assets/progress/` are **AI-generated** (Higgsfield,
`nano_banana_2`) images of a dog that does not exist. They are placeholders so
the timeline and the before/after view read like a real log instead of the
same photo four times.

They deliberately show the **same healthy dog on four different days** in four
settings. They do not depict a sick pet becoming a well one: a fabricated
health transformation for a supplement could be mistaken for a real
testimonial if it ever left this demo. If you regenerate them, keep that
constraint. Do not present them as customers.

### Also worth flagging

Futura and Helvetica Neue are commercial fonts she self-hosts for the web. A
shipped app is a different license grant than a website. Fine for a demo, but
she should check before the real build.

---

## Not verified

Rendering was checked in Chromium at a 375×812 mobile viewport, and the
WebKit-specific meta and safe-area handling are in place, but **the demo has
not been opened in real mobile Safari.** The iOS Simulator on this machine
needs an Xcode fix first:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

Worth doing one pass on a real iPhone before the call.
