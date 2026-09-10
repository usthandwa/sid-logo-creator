# Construction notes

Where the numbers in `src/brand/constructionRules.ts` come from, and why the tool behaves the way
it does.

---

## The unit

Everything is expressed in **x** — the x-height of the primary type — because that is the unit the
identity system itself uses. adventist.design states the secondary-type rule that way ("75% the
x-height of the primary type"), states clear space that way ("two times the height of the lowercase
letters"), and its construction diagrams band the whole lockup in 1x, .75x and .5x steps.

x depends on the loaded font's own metrics, so the lockup follows the typeface rather than assuming
one. `grid(xHeight)` in `src/brand/constructionRules.ts` converts the ratios into drawing units. The
symbol is `SYMBOL_UNITS` (1000) tall by definition, so fixing the symbol's height in x determines
every other measurement, type size included.

## The measurements

Taken from SID's own published church logos — `docs/reference/sid-church-logos/` — rendered at
3000px wide and measured programmatically: x-height from the modal glyph top of each line, baselines
from the modal glyph bottom, symbol from its ink bounds.

|                        | Zulu  | Afrikaans | Xhosa | Shona | Used      |
| ---------------------- | ----- | --------- | ----- | ----- | --------- |
| Symbol height          | 4.420 | 4.465     | 4.376 | 4.420 | **4.42x** |
| Primary line step      | 2.000 | 2.020     | 1.980 | 2.000 | **2x**    |
| Symbol-to-wordmark gap | 1.043 | 0.935     | 1.031 | 1.045 | **1x**    |

Four independent logos agreeing is what establishes these as the system rather than one artboard's
arrangement. The gap figures are the measured ink gap less each first glyph's left side bearing, so
they describe the wordmark's origin rather than its first mark; they average 1.013x.

The symbol's bottom sits exactly on the wordmark's last baseline in all four.

### What this corrected

An earlier version of this file recorded a wordmark type size of 0.529 of symbol height and a line
height of 1.0045em, said to be measured from General Conference artwork. Both were wrong. Against the
published logos the wordmark was **26% oversized** (0.529 where the artwork uses 0.4221) and the line
step was 6% tight (1.874x where the artwork uses 2.000x). The error was invisible in symbol-height
units and obvious the moment the same logo was rendered at the same symbol height and laid alongside
the original.

### Secondary type is a rule, not a measurement

adventist.design states it directly: "The maximum size for secondary type is 75% the x-height of the
primary type. If the secondary type is very long, it can be reduced to a minimum of 50% of the
x-height." Both are used as stated, so the floor is two-thirds of nominal.

### Still unverified

SID's published church logos carry no secondary line and no stacked construction, so three ratios
could not be measured and keep the proportion the tool has always used. They are marked `UNVERIFIED`
in the code:

- **`secondaryDrop`** — primary's last baseline to the secondary's first.
- **`secondaryLineStep`** — baseline-to-baseline within the secondary block. The construction diagram
  suggests 1.25x (a .75x band plus a .5x gap), which is materially looser than the 0.9x in use.
- **`stackedGap`** — symbol bottom to wordmark cap height in the stacked construction.

**Descriptor size** — 75% of the entity name — is also unsourced. It is *not* the 75% rule above,
which governs secondary against primary. The guidelines describe only two levels of type; a third
line is an extrapolation this tool makes.

**Clear space** is 2x by definition, computed from the font's x-height rather than hard-coded.

## Entity identifiers

The creator once offered an "entity type" — nine of them, in three tabs: church, conference, field,
mission, union, division, institution, ministry, media. All nine drew identically. The only functional
difference in the whole registry was that `church` disallowed a descriptor, so the picker asked the
user a question that could not change the artwork.

What does change the artwork is **how the name is composed against the denomination**, which is what
adventist.design specifies. `src/brand/entityIdentifiers.ts` holds that instead:

**Church** — public-facing entities: churches, schools, hospitals, ministries. Recommendations,
aimed at public recognition.

| | Approach | Result |
| --- | --- | --- |
| ✓ | Full denomination name, equal size | `Rosettenville Seventh-day Adventist® Church`, one block |
| ! | Full denomination name, smaller | `Rosettenville` over a smaller `Seventh-day Adventist® Church` |
| ! | Only "Adventist" in the name | `Lincoln Adventist Academy` |
| ! | No part of the denomination name | `Cedar Lake Academy` |

**Administrative** — requirements, not recommendations.

| | Approach | Result |
| --- | --- | --- |
| ✓ | "of Seventh-day Adventists" | `Southern Africa-Indian Ocean Division` over `of Seventh-day Adventists` |
| ! | "of the Seventh-day Adventist Church" | the same, less preferred wording |

The ✓ / ! / ✕ marks are the guidelines' own acceptability key, and are shown on each choice. They are
not style preferences — an unacceptable application breaks the system.

Composing a name with the denomination means the primary block no longer has authored line breaks, so
it finds its own with `balanceLines`. The plain denomination logo — no entity name — keeps the breaks
authored per language, because those are published artwork.

With no entity name typed, every approach produces the same denomination logo — there is nothing to
compose against it. That is correct, but it reads as a dead control, so the picker says so instead of
leaving the user to guess.

**Administrative naming carries a principle, not a phrase.** The guidelines are explicit that "the
previous examples may not translate directly across languages", and ask instead that the entity be
named first and its place in the church second — so that the church reads as supported by its
entities rather than composed of them, and as belonging to the people rather than the organisation.
A language with no approved form is therefore prompted for its own linking line rather than refused;
where an approved form exists it always wins over anything typed.

One approach needs wording that must be approved per language: the shortened "Adventist" form and
the administrative "of …" forms. Only English carries them so far. Where a language has not got the
wording, the approach is offered but disabled with a note, rather than silently inventing a
translation.

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

**The identifier is not confined to the wordmark.** In the published clear-space reference the entity
identifier runs well past the wordmark's right edge on a single line, and it — not the wordmark —
sets the lockup's width and therefore its clear-space boundary. It may run to 1.5x the wordmark
width, which is where the reference sits (about 1.47x) with a little room above it.

**Shrink first, break second.** The guidelines describe long secondary type as being *reduced*, and
never as wrapping, so a name that overruns the run-on allowance shrinks toward the 50% floor while it
still can. Only a name too long to fit even at the floor breaks onto a second line.

This is the opposite of the wordmark's own behaviour, whose line breaks are authored per language and
never recomputed. The two orders live behind `preferSingleLine` in `fitText`.

Where a break is unavoidable, the point is chosen to make the two lines as even as possible, rather
than greedily filling the first — a long first line over a two-word stub reads badly under a symbol.

## The registered-trademark mark

Two marks appear in an English lockup, and both are correct:

- the ® on the symbol, which is part of the symbol artwork as published;
- the ® after "Adventist" in the wordmark, which adventist.design requires in English.

Which languages carry the wordmark mark is per-language data
(`registeredMarkAfter` in the language registry), not a global rule.

**The symbol's mark is not yet per-language, and should be.** SID's published vernacular logos mark
the symbol ™ where this tool draws ®, and Afrikaans takes ™ after "Adventiste" where
`wordmarkLines()` inserts ®. English artwork does use ®, so the mark varies by language rather than
being the constant it is modelled as. The seven SID vernaculars are held staged for this reason
alone — their wording is confirmed. See `docs/reference/sid-church-logos/`.

## Minimum sizes

25 mm wide in print, 96 px on screen. Below that the interior counters of the symbol close up and
the flame reads as a solid mass. The creator states these next to the preview.

---

## Sources

- [SID church logos](reference/sid-church-logos/) — the published artwork this tool is checked against
- [Adventist identity guidelines](https://www.adventist.design)
- [Entity identifiers](https://www.adventist.design/using-the-system/entity-identifiers/)
- [Advent Sans](https://www.adventist.design/global-elements/advent-sans/)
- [ALPS colour palette](https://alps.adventist.io)
