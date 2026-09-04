# Advent Sans (Logo)

`AdventSans-Logo.otf` is the Seventh-day Adventist Church's typeface — a custom face built on
Google's Noto Sans, published by the General Conference for setting entity names and denomination
wordmarks.

It is published under the **SIL Open Font License, Version 1.1**, and is redistributed here under
that licence so the app works offline and produces correct artwork on any machine.

- Source: <https://www.adventist.design/global-elements/advent-sans/>
- Licence: <https://scripts.sil.org/OFL>

## Replacing it

Drop a newer release in at the same path. Nothing else needs to change — the layout engine reads
cap height, x-height and descender from the font's own tables at runtime rather than assuming
them.

If you replace it with a face that has different metrics, run `npm run samples` and check the
output: the construction ratios in `src/brand/constructionRules.ts` are stated against the symbol,
but the type sits on the font's own baselines.
