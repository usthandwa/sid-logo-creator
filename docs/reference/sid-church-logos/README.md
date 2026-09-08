# SID church logos — source artwork

Official Seventh-day Adventist church logos published by the Southern Africa-Indian Ocean Division,
kept here as the reference the language registry is checked against.

**Source:** <https://www.adventist.design/regional-extensions/southern-africa-indian-ocean-division>
(files at `https://www.adventist.design/wp-content/uploads/2017/04/170529-<Language>.pdf`).
Artwork dated 2017-04-29; guidelines version 2.1.0. Retrieved 2026-09-08.

SID publishes nine languages. French and Portuguese are already active in the registry from the
General Conference guidelines, so only the seven vernaculars are held here. Each is also published in
a "centered" variant, and Portuguese additionally in ™ variants; those are not mirrored here.

## What these files establish

**The wordmark is not a translation of the denomination's name.** Every one of these logos names the
Sabbath instead. Before this artwork was read, all seven entries in `src/brand/languages.ts` had been
written by translating "Seventh-day Adventist Church", and all seven were wrong.

| Language | Code | Official wordmark | File |
| --- | --- | --- | --- |
| Afrikaans | `af` | Sewende-dag / Adventiste™ Kerk | `170529-Afrikaans.pdf` |
| Zulu | `zu` | iNkonzo ya / ma Sabatha | `170529-Zulu.pdf` |
| Xhosa | `xh` | iBandla la / Ma-Sabatha | `170529-Xhosa.pdf` |
| Southern Sotho | `st` | Kereke / ea Sabata | `170529-South-Sotho.pdf` |
| Tswana | `tn` | Kereke / ya Sabata | `170529-Tswana.pdf` |
| Siswati | `ss` | Libandla / lemaSabatha | `170529-Siswati.pdf` |
| Shona | `sn` | Sangano / remaSabata | `170529-Shona.pdf` |

Afrikaans is the only one of the seven that names "Adventiste", and the only one carrying a mark
inside the wordmark.

**The symbol is marked ™, not ®.** All seven place a ™ at the lower right of the symbol, where
`src/brand/symbol.ts` bakes a ® into `CHURCH_SYMBOL.paths`. English artwork does use ®, so the mark
varies by language rather than being a constant. This is unresolved, and is the only reason these
seven are still staged rather than active.

## Reading them

The type is converted to outlines — there are no font objects and no text operators, so `pdftotext`
and `strings` yield nothing. Render them instead:

```sh
qlmanage -t -s 1600 -o /tmp/out docs/reference/sid-church-logos/170529-Zulu.pdf
```

Each page is 900×180pt, single page.

## Licence

Trademarked artwork of the General Conference of Seventh-day Adventists, reproduced here for
verification of this tool's output. Not covered by this repository's MIT licence, and not to be
redistributed or altered. See <https://www.adventist.design/legal/>.
