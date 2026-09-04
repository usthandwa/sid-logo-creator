# Contributing

Most changes to this tool are data, not code. This page covers the ones that come up.

---

## Activating a staged language

This is the change the tool was designed around. It touches one file.

### 1. Confirm the wording

A wordmark carries the name of the church in that language. Before anything is committed, the
wording has to be confirmed **in writing** by the communication director of the union whose
territory uses it. The Language Lab tells you which union that is for each language.

What to check:

- the exact spelling and diacritics, in the union's own published materials;
- where the line breaks — the wordmark sets on two lines, and the break should fall where the
  language wants it, not where English would put it;
- whether a registered-trademark mark is used in that language.

### 2. Preview it

Open the Language Lab, find the language, and look at the rendered lockup. Switch it on and try it
in the creator with a real church name from that territory. A trial activation lives in your
browser only.

### 3. Edit the registry

In `src/brand/languages.ts`, move the entry out of `STAGED` and into `ACTIVE`, and record the
approval:

```ts
{
  code: 'sn',
  endonym: 'chiShona',
  englishName: 'Shona',
  status: 'active',                       // was 'staged'
  direction: 'ltr',
  wordmark: ['Chechi yeVaAdventista', 'veZuva reChinomwe'],
  tierLabels: { church: 'Chechi' },
  territories: ['ZW'],
  approval: {
    verified: true,                       // was the shared DRAFT constant
    approvedBy: 'Name, Communication Director, Zimbabwe East Union Conference',
    approvedOn: '2026-09-04',
  },
},
```

### 4. Open a pull request

Put the written confirmation, or a reference to it, in the description. CI runs the type checker,
the linter, the tests and a production build. Two of the tests exist for exactly this change:

- every language in the registry renders without producing a malformed path;
- every active language is marked verified, and every staged one is not.

Once it merges, the language appears for every church in the division on the next deploy. No
artwork, no layout work, no build configuration.

---

## Adding a language that is not listed

Append an entry to `STAGED` in `src/brand/languages.ts` using the `staged()` helper:

```ts
staged(
  'lua',                                  // BCP-47 code
  'Tshiluba',                             // the name in the language itself
  'Luba-Kasai',                           // the name in English
  ['Tshitshi tsha BaAdventiste', 'tsha Dituku dia Muanda Mutekete'],  // wordmark lines
  ['CD'],                                 // ISO 3166-1 alpha-2 territories
  { church: 'Tshitshi' },                 // optional entity-type words
),
```

Keep the wordmark to two lines wherever the language allows: the construction ratios are built
around a two-line wordmark, and a third line changes the proportions of every lockup in that
language.

Then follow the activation steps above.

---

## Adding an entity type

`src/brand/tiers.ts`. A tier decides which fields the creator asks for and which layouts it
offers:

```ts
{
  id: 'school',
  label: 'School',
  help: 'A primary or secondary school operated by an entity.',
  namePlaceholder: 'e.g. Bethel College',
  layouts: ['lateral', 'stacked'],
  allowsDescriptor: true,
  descriptorPlaceholder: 'e.g. Primary Section',
  group: 'entities',
},
```

Add `school` to `TierId`, and add a label for it in each active language's `tierLabels`.

---

## Adding a layout

One file in `src/core/layouts/`, exporting a `LayoutFn`:

```ts
export const banner: LayoutFn = (spec, typeface) => {
  // compose symbolPaths(), the wordmark and buildIdentifierBlock()
  return { viewBox, contentBox, paths, notes };
};
```

Then add it to `LAYOUTS` in `src/core/layouts/index.ts` and list it on the tiers that should offer
it. The registry test will fail if a tier references a layout that does not exist, and the lockup
test renders every registered layout automatically.

Run `npm run samples` and look at the output. A construction ratio that is slightly wrong passes
every unit test and is obvious the moment you see it.

---

## Changing the colour palette

`src/brand/palette.ts` ships the ALPS palette, which is what adventist.design recommends when a
division has not published its own colour system. If SID publishes one, replace the entries in
`LOGO_COLOURS`. Nothing else needs to change.

---

## Changing the construction

`src/brand/constructionRules.ts` holds every ratio, expressed against the height of the symbol.
These were measured from official entity artwork and agree across both constructions; do not
change them to make a particular name fit. If something does not fit, that is a fitting problem
in `src/core/geometry.ts`.

`docs/BRAND.md` records the derivation and the source measurements.

---

## House rules

- TypeScript is strict, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- `src/core` stays free of React, of the DOM and of the brand registries. It takes a spec and
  returns geometry.
- Comments explain why, not what.
- UK English in the interface and in comments.
- `npm run verify` before opening a pull request.
