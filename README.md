# SID Adventist Logo Creator

A web app that produces official Seventh-day Adventist logo lockups for entities of the
**Southern Africa-Indian Ocean Division** — churches, companies, conferences, fields, missions,
unions, institutions, departments and media services.

It installs as an app, works offline, and every file it produces is built from the official
church symbol and the Advent Sans brand typeface, composed to the construction rules published at
[adventist.design](https://www.adventist.design).

> Modelled on the Lake Union Conference logo creator, rebuilt for SID with an extensible
> architecture and the whole division's language set already in place.

---

## What it does

|               |                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Entities**  | Churches and companies · conferences, fields, missions, unions and the division · institutions, departments, ministries and media |
| **Languages** | English, Português, Français, Español live · **39 more SID languages staged** behind the Language Lab                             |
| **Layouts**   | Horizontal (lateral) · Vertical (stacked) · Symbol only                                                                           |
| **Colours**   | The ALPS palette — core, muted and bright, with Pantone references                                                                |
| **Downloads** | SVG (type converted to outlines) · PNG at 1200 / 2400 / 4800 px, transparent                                                      |
| **Offline**   | Installable PWA. The symbol, the font and the whole app are precached                                                             |

Type is converted to vector outlines before export, so a downloaded SVG opens identically in
Illustrator, Affinity, Inkscape or Figma on a machine that has never had Advent Sans installed.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run verify       # typecheck, lint, tests, production build
npm run samples      # renders samples/ for visual review
```

Node 20.19 or newer.

### Deploying

The app is a static bundle — any static host will serve it.

```bash
npm run build                                # for a domain root, e.g. logo.sidadventist.org
VITE_BASE=/sid-logo-creator/ npm run build   # for a GitHub Pages project path
```

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to `main`. To move to a
custom domain, set the repository's Pages custom domain and drop `VITE_BASE` from the workflow.

| Build variable         | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `VITE_BASE`            | Path the app is served from. Defaults to `/`.              |
| `VITE_LAB_ACCESS_CODE` | Access code for the Language Lab. Defaults to `sid-comms`. |

---

## The Language Lab

Every language of the SID territory is already built and rendering. Four are approved and offered
to everyone; the rest are **staged** — held behind a screen until the union that will use them has
confirmed the wording.

The staged wordmarks are working drafts prepared from general usage. They are **not** approved
denominational renderings. A wordmark carries the name of the church, and a congregation should
not put a draft on a building.

The lab lets a communication director:

- see each staged language rendered as a finished lockup;
- filter by the union that has to approve it;
- switch one on **in their own browser** to take to a committee, without publishing it to anyone
  else;
- read the exact change needed to publish it for everyone.

Publishing a language to the whole division is a four-line edit to one file — see
[CONTRIBUTING.md](CONTRIBUTING.md).

---

## How it is built to grow

The whole app is registries plus a pure engine. Nothing about a language, a colour, an entity type
or a layout is hard-coded into the interface.

```
src/
├── brand/                    the registries — what this division uses
│   ├── symbol.ts             official church symbol artwork
│   ├── constructionRules.ts  the ratios every layout is built from
│   ├── languages.ts          43 languages, active and staged
│   ├── palette.ts            colour system
│   ├── tiers.ts              kinds of entity
│   └── territories.ts        unions and countries
│
├── core/                     the engine — no React, no DOM, no registries
│   ├── types.ts
│   ├── typeface.ts           Advent Sans, loaded and measured
│   ├── geometry.ts           symbol placement, line balancing, fitting
│   ├── layouts/              one file per layout
│   ├── buildLockup.ts        the single entry point
│   ├── exportSvg.ts
│   └── exportPng.ts
│
├── features/
│   ├── creator/              the main tool
│   └── languageLab/          the staged-language screen
│
└── components/, hooks/, styles/
```

The engine takes a spec and a typeface and returns geometry. It never touches the DOM, which is
why the same code renders the on-screen preview, the downloaded SVG and the rasterised PNG — they
cannot drift apart — and why it can be tested against the real font rather than a stub.

**Adding things:**

| To add           | Change                                                        |
| ---------------- | ------------------------------------------------------------- |
| A language       | One entry in `src/brand/languages.ts`                         |
| A colour         | One entry in `src/brand/palette.ts`                           |
| An entity type   | One entry in `src/brand/tiers.ts`                             |
| A layout         | One function in `src/core/layouts/`, one line in its registry |
| An export format | One module beside `exportSvg.ts`                              |

---

## Trademark and typeface

The Seventh-day Adventist name and the church symbol are trademarks of the General Conference of
Seventh-day Adventists. This tool exists to help denominational entities use them correctly; it
does not grant anyone the right to use them. Artwork it produces is for use by SID entities in
regular standing.

Advent Sans is the church's typeface, built on Noto Sans and published by the General Conference
under the [SIL Open Font License 1.1](https://openfontlicense.org/documents/OFL.txt). The font file in `public/fonts/` is
redistributed here under that licence.

The application code is MIT licensed — see [LICENSE](LICENSE). That licence covers the code only,
not the trademarks or the artwork.

---

## References

- [Adventist identity guidelines](https://www.adventist.design)
- [Entity identifiers](https://www.adventist.design/using-the-system/entity-identifiers/)
- [Advent Sans](https://www.adventist.design/global-elements/advent-sans/)
- [SID unions and fields](https://sidadventist.org/unions/)
- [ALPS colour palette](https://alps.adventist.io)

Built for SID Communication.
