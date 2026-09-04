# Construction notes

Where the numbers in `src/brand/constructionRules.ts` come from, and why the tool behaves the way
it does.

---

## The unit

Everything is expressed against the height of the church symbol. In the code the symbol is
`SYMBOL_UNITS` (1000) tall, and every other dimension is a fraction of that. Scaling a lockup is
therefore one multiplication, and the ratios can be checked against printed artwork with a ruler.

## The measurements

Official Seventh-day Adventist entity artwork, produced with the General Conference identity
templates, was measured in both constructions. Expressed against symbol height:

|                           | Lateral            | Stacked          | Used       |
| ------------------------- | ------------------ | ---------------- | ---------- |
| Wordmark type size        | 0.5288             | 0.5291           | **0.529**  |
| Wordmark line height (em) | 1.0045             | 1.0045           | **1.0045** |
| Entity type size          | 0.2102             | 0.2115           | **0.211**  |
| Entity baseline drop      | 0.5032             | 0.5085           | **0.504**  |
| Symbol-to-wordmark gap    | 0.264 (horizontal) | 0.290 (vertical) | both       |

The two constructions agree to within half a percent on every shared ratio. That agreement is what
establishes these as the system rather than as one artboard's arrangement.

Derived, not measured:

- **Descriptor size** — 75% of the entity name, which is the maximum adventist.design allows for
  secondary type.
- **Clear space** — twice the height of the lowercase letters, as specified for entity
  identifiers. Computed from the wordmark's x-height as reported by the font, not hard-coded.

## Alignment

**Lateral.** The wordmark's last baseline sits level with the bottom of the symbol. The entity
name is left-aligned to the wordmark, not to the symbol — reading-aligned, which adventist.design
gives as the preferred arrangement.

**Stacked.** Symbol, wordmark and entity name share one centre line, set by whichever of the
symbol or the wordmark is wider.

## Typography

Advent Sans (Logo cut) — the church's typeface, built on Noto Sans, published by the General
Conference under the SIL Open Font License 1.1.

The wordmark and the entity name are both **set live from the font**, then converted to outlines.
That is the decision that lets a language be added as four lines of data: there is no per-language
vector artwork to draw. It also means the export carries no font dependency.

Metrics come from the font's own tables — cap height and x-height from OS/2, descender from the
head table — with published Noto Sans values as a fallback where a table is silent. Nothing about
the layout assumes a metric it has not read.

There is deliberately no system-font fallback. If Advent Sans cannot be loaded the tool refuses to
render, because a lockup set in Helvetica is not official artwork and shipping one quietly would be
worse than stopping.

## Fitting long names

Wrap first, shrink second. A long entity name breaks onto a second line at full size before it is
allowed to get smaller; only if two full-size lines still overflow does the type reduce, and then
no further than 62% of nominal. Small type on a lockup is harder to read than two lines of it.

The break point is chosen to make the two lines as even as possible, rather than greedily filling
the first — a long first line over a two-word stub reads badly under a symbol.

## The registered-trademark mark

Two marks appear in an English lockup, and both are correct:

- the ® on the symbol, which is part of the symbol artwork as published;
- the ® after "Adventist" in the wordmark, which adventist.design requires in English.

Which languages carry the wordmark mark is per-language data
(`registeredMarkAfter` in the language registry), not a global rule.

## Minimum sizes

25 mm wide in print, 96 px on screen. Below that the interior counters of the symbol close up and
the flame reads as a solid mass. The creator states these next to the preview.

---

## Sources

- [Adventist identity guidelines](https://www.adventist.design)
- [Entity identifiers](https://www.adventist.design/using-the-system/entity-identifiers/)
- [Advent Sans](https://www.adventist.design/global-elements/advent-sans/)
- [ALPS colour palette](https://alps.adventist.io)
