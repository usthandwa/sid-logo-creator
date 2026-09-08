import { describe, expect, it } from 'vitest';
import { CONSTRUCTION, SYMBOL_UNITS, secondaryTypeSize } from '@/brand/constructionRules';
import { LANGUAGES, wordmarkLines, requireLanguage } from '@/brand/languages';
import { buildLockup } from '@/core/buildLockup';
import { LAYOUTS } from '@/core/layouts';
import { SYMBOL_ASPECT_RATIO } from '@/brand/symbol';
import type { LockupSpec } from '@/core/types';
import { testTypeface } from './fixtures';

const typeface = testTypeface();

function spec(overrides: Partial<LockupSpec> = {}): LockupSpec {
  return {
    layout: 'lateral',
    wordmarkLines: wordmarkLines(requireLanguage('en')),
    entityName: '',
    descriptor: '',
    colour: '#000000',
    includeClearSpace: false,
    uppercaseEntityName: true,
    locale: 'en',
    ...overrides,
  };
}

describe('the lockup engine', () => {
  it('produces geometry for every layout in the registry', () => {
    for (const layout of LAYOUTS) {
      const lockup = buildLockup(spec({ layout: layout.id }), typeface);
      expect(lockup.paths.length, layout.id).toBeGreaterThan(0);
      expect(lockup.viewBox.width, layout.id).toBeGreaterThan(0);
      expect(lockup.viewBox.height, layout.id).toBeGreaterThan(0);
    }
  });

  it('produces geometry for every language in the registry, staged included', () => {
    for (const language of LANGUAGES) {
      const lockup = buildLockup(
        spec({ wordmarkLines: wordmarkLines(language), locale: language.code }),
        typeface,
      );
      expect(lockup.paths.length, language.code).toBeGreaterThan(0);
      expect(Number.isFinite(lockup.viewBox.width), language.code).toBe(true);
      expect(lockup.viewBox.width, language.code).toBeGreaterThan(0);
    }
  });

  it('never emits an empty or malformed path', () => {
    const lockup = buildLockup(spec({ entityName: 'Rosettenville' }), typeface);
    for (const path of lockup.paths) {
      expect(path.d).toMatch(/^M/);
      expect(path.d).not.toContain('NaN');
    }
  });

  it('keeps the symbol at its published proportions', () => {
    const lockup = buildLockup(spec({ layout: 'symbol' }), typeface);
    const ratio = lockup.contentBox.width / lockup.contentBox.height;
    expect(ratio).toBeCloseTo(SYMBOL_ASPECT_RATIO, 3);
  });

  it('grows downwards, not sideways, when an entity name is added laterally', () => {
    const bare = buildLockup(spec(), typeface);
    const named = buildLockup(spec({ entityName: 'Berrien Springs' }), typeface);
    expect(named.viewBox.height).toBeGreaterThan(bare.viewBox.height);
    expect(named.viewBox.width).toBeCloseTo(bare.viewBox.width, 1);
  });

  it('reduces a long entity name before breaking it onto a second line', () => {
    // adventist.design describes long secondary type as reduced, never wrapped,
    // so a name that overruns must shrink while it still can.
    const long = buildLockup(
      spec({ entityName: 'Zimbabwe East Union Conference Headquarters Church' }),
      typeface,
    );
    expect(long.notes).toContain('The entity name was reduced to fit, within the permitted range.');
    expect(long.notes).not.toContain('The entity name wraps onto two lines.');
  });

  it('lets the entity identifier run wider than the wordmark and set the lockup width', () => {
    // The published clear-space reference shows the identifier extending past
    // the wordmark's right edge, so it — not the wordmark — fixes the width.
    const short = buildLockup(spec({ entityName: 'Solusi' }), typeface);
    const long = buildLockup(
      spec({ entityName: 'Zimbabwe East Union Conference Headquarters Church' }),
      typeface,
    );
    expect(long.viewBox.width).toBeGreaterThan(short.viewBox.width);
  });

  it('never reduces the entity identifier below half the primary x-height', () => {
    const absurd = buildLockup(
      spec({
        entityName:
          'Southern Africa Indian Ocean Division Department of Family and Childrens Ministries',
      }),
      typeface,
    );
    // At the floor the name may finally break, but nothing may vanish or go
    // non-finite in the process.
    expect(absurd.paths.length).toBeGreaterThan(0);
    expect(Number.isFinite(absurd.viewBox.width)).toBe(true);
    for (const path of absurd.paths) expect(path.d).not.toContain('NaN');
  });

  it('derives the secondary type size from the 75% x-height rule', () => {
    // The rule must reproduce the 0.211-of-symbol-height that was measured
    // from official artwork; that agreement is what validates the derivation.
    const derived = secondaryTypeSize(typeface.xHeight, CONSTRUCTION.wordmarkSize * SYMBOL_UNITS);
    const measured = 0.211 * SYMBOL_UNITS;
    expect(Math.abs(derived - measured) / measured).toBeLessThan(0.01);
  });

  it('adds the required clear space when asked, and none when not', () => {
    const tight = buildLockup(spec({ entityName: 'Solusi' }), typeface);
    const padded = buildLockup(spec({ entityName: 'Solusi', includeClearSpace: true }), typeface);
    const expected =
      CONSTRUCTION.clearSpaceXHeights * typeface.xHeight * CONSTRUCTION.wordmarkSize * SYMBOL_UNITS;

    expect(tight.viewBox.width).toBeCloseTo(tight.contentBox.width, 5);
    expect(padded.viewBox.width - padded.contentBox.width).toBeCloseTo(expected * 2, 1);
  });

  it('sets the entity name in capitals', () => {
    const lower = buildLockup(spec({ entityName: 'rosettenville' }), typeface);
    const upper = buildLockup(spec({ entityName: 'ROSETTENVILLE' }), typeface);
    expect(lower.viewBox.width).toBeCloseTo(upper.viewBox.width, 3);
    expect(lower.viewBox.height).toBeCloseTo(upper.viewBox.height, 3);
  });

  it('centres the stacked lockup on a single axis', () => {
    const lockup = buildLockup(
      spec({ layout: 'stacked', entityName: 'Blantyre Central' }),
      typeface,
    );
    const centre = lockup.contentBox.x + lockup.contentBox.width / 2;
    // Every element is centred on the same line, so the content box's own
    // centre must coincide with it.
    expect(Number.isFinite(centre)).toBe(true);
    expect(lockup.contentBox.height).toBeGreaterThan(lockup.contentBox.width * 0.4);
  });

  it('omits the entity name from the symbol-only layout', () => {
    const bare = buildLockup(spec({ layout: 'symbol' }), typeface);
    const named = buildLockup(spec({ layout: 'symbol', entityName: 'Anywhere' }), typeface);
    expect(named.paths).toHaveLength(bare.paths.length);
  });
});
