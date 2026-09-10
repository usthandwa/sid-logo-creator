/**
 * Lockup construction rules.
 *
 * Everything is expressed in **x** — the x-height of the primary type — because
 * that is the unit the identity system itself uses. adventist.design states the
 * secondary type rule that way ("75% the x-height of the primary type"), states
 * clear space that way ("two times the height of the lowercase letters"), and
 * its construction diagrams band the whole lockup in 1x, .75x and .5x steps.
 *
 * Working in x rather than in symbol heights matters: x depends on the loaded
 * font's own metrics, so the lockup follows the typeface instead of assuming
 * one. `grid()` converts the ratios below into drawing units.
 *
 * See docs/BRAND.md for how these were measured, and
 * docs/reference/sid-church-logos/ for the artwork they were measured from.
 * Reference: https://www.adventist.design/using-the-system/entity-identifiers/
 */

/** Height of the church symbol in the internal coordinate system. */
export const SYMBOL_UNITS = 1000;

export const GRID = {
  /**
   * Symbol height, in x. Measured from four SID church logos, which agree at
   * 4.42x (4.376–4.465). This is what fixes the type size against the symbol:
   * a larger figure sets the wordmark smaller.
   */
  symbolHeight: 4.42,

  /**
   * Primary wordmark baseline-to-baseline. The construction diagrams give two
   * 1x bands per line, and all four church logos measure 2.000x.
   */
  primaryLineStep: 2,

  /**
   * Secondary type — the entity identifier — as a fraction of the primary's
   * x-height. "The maximum size for secondary type is 75% the x-height of the
   * primary type."
   */
  secondarySize: 0.75,

  /**
   * Floor for secondary type once the line is long. "If the secondary type is
   * very long, it can be reduced to a minimum of 50% of the x-height."
   */
  secondaryMinSize: 0.5,

  /**
   * Baseline-to-baseline within the secondary block.
   *
   * UNVERIFIED. The published church logos carry no secondary line, so this
   * could not be measured from artwork; it preserves the proportion the tool
   * has always used. The construction diagram suggests 1.25x (a .75x band, a
   * .5x gap), which would be materially looser. Confirm before relying on it.
   */
  secondaryLineStep: 0.9,

  /**
   * Drop from the primary's last baseline to the secondary's first.
   *
   * UNVERIFIED, for the same reason as `secondaryLineStep`.
   */
  secondaryDrop: 1.778,

  /**
   * Horizontal gap between the symbol and the wordmark's origin, lateral
   * construction. Solved from the four church logos by subtracting each first
   * glyph's left side bearing from the measured ink gap: 1.043, 0.935, 1.031
   * and 1.045, mean 1.013 — one band of the grid.
   */
  lateralGap: 1,

  /**
   * Vertical gap between symbol bottom and wordmark cap height, stacked.
   *
   * UNVERIFIED: SID publishes no stacked artwork here, so this preserves the
   * proportion the tool has always used rather than a measured value.
   */
  stackedGap: 1.282,

  /**
   * Minimum clear space around the finished lockup. adventist.design specifies
   * two times the height of the lowercase letters, which is 2x by definition.
   */
  clearSpace: 2,

  /**
   * Descriptor size, as a fraction of the *entity name's* size — an em ratio,
   * not an x measure, which is why it is separate from `secondarySize` despite
   * sharing its value.
   *
   * UNSOURCED. The guidelines describe two levels of type, primary and
   * secondary; a third line is this tool's own extrapolation.
   */
  descriptorSize: 0.75,

  /**
   * How wide a composed primary line may run before it breaks onto a second
   * line, as a multiple of the language's own widest authored wordmark line.
   *
   * The primary is never reduced — its size is fixed by the grid — so this is
   * the only lever: it wraps or it runs on. Self-calibrating per language, so a
   * long-worded denomination gets a proportionally longer measure. A tuning
   * value, not a measured one: check by eye that "Lincoln Adventist Academy"
   * stays on one line while a name plus the full denomination breaks to two.
   */
  primaryRunOn: 1.5,

  /**
   * How far the secondary line may run past the wordmark before it is reduced,
   * as a multiple of the wordmark's width — not an x measure.
   *
   * The secondary line is not confined to the wordmark: in the published
   * clear-space reference the entity identifier runs to about 1.47x the
   * wordmark width, and it, not the wordmark, sets the lockup's width and its
   * clear-space boundary.
   */
  secondaryRunOn: 1.5,
} as const;

export type ConstructionGrid = typeof GRID;

/** Every construction measurement, in drawing units, for a given typeface. */
export interface Grid {
  /** The unit itself: the primary type's x-height, in drawing units. */
  readonly x: number;
  /** Type size of the denomination wordmark. */
  readonly primarySize: number;
  readonly primaryLineStep: number;
  /** Nominal type size of the entity identifier. */
  readonly secondarySize: number;
  /** Smallest permitted secondary size, as a fraction of its nominal size. */
  readonly secondaryMinScale: number;
  readonly secondaryLineStep: number;
  readonly secondaryDrop: number;
  readonly lateralGap: number;
  readonly stackedGap: number;
  readonly clearSpace: number;
}

/**
 * Resolves the grid for a typeface.
 *
 * `xHeight` is the face's own x-height as a fraction of the em, read from its
 * OS/2 table. The symbol is `SYMBOL_UNITS` tall by definition, so fixing the
 * symbol at `GRID.symbolHeight` x-heights determines everything else.
 */
export function grid(xHeight: number): Grid {
  const x = SYMBOL_UNITS / GRID.symbolHeight;
  const primarySize = x / xHeight;
  return {
    x,
    primarySize,
    primaryLineStep: GRID.primaryLineStep * x,
    secondarySize: GRID.secondarySize * x,
    secondaryMinScale: GRID.secondaryMinSize / GRID.secondarySize,
    secondaryLineStep: GRID.secondaryLineStep * x,
    secondaryDrop: GRID.secondaryDrop * x,
    lateralGap: GRID.lateralGap * x,
    stackedGap: GRID.stackedGap * x,
    clearSpace: GRID.clearSpace * x,
  };
}

/**
 * Minimum reproduction width, in millimetres, for print. Below this the
 * symbol's interior counters close up.
 */
export const MINIMUM_PRINT_WIDTH_MM = 25;

/** Minimum reproduction width, in CSS pixels, for screen. */
export const MINIMUM_SCREEN_WIDTH_PX = 96;
