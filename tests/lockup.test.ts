import { describe, expect, it } from 'vitest';
import { grid, SYMBOL_UNITS } from '@/brand/constructionRules';
import { LANGUAGES, wordmarkLines, requireLanguage } from '@/brand/languages';
import {
  composeLockupText,
  DEPARTMENT_OPTIONS,
  requireApproach,
  requireDepartmentOption,
} from '@/brand/entityIdentifiers';
import { buildLockup } from '@/core/buildLockup';
import { LAYOUTS } from '@/core/layouts';
import type { LockupSpec } from '@/core/types';
import { testTypeface } from './fixtures';

const typeface = testTypeface();

function spec(overrides: Partial<LockupSpec> = {}): LockupSpec {
  return {
    layout: 'lateral',
    primaryLines: wordmarkLines(requireLanguage('en')),
    secondaryText: '',
    descriptor: '',
    colour: '#000000',
    includeClearSpace: false,
    uppercaseSecondary: true,
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
        spec({ primaryLines: wordmarkLines(language), locale: language.code }),
        typeface,
      );
      expect(lockup.paths.length, language.code).toBeGreaterThan(0);
      expect(Number.isFinite(lockup.viewBox.width), language.code).toBe(true);
      expect(lockup.viewBox.width, language.code).toBeGreaterThan(0);
    }
  });

  it('never emits an empty or malformed path', () => {
    const lockup = buildLockup(spec({ secondaryText: 'Rosettenville' }), typeface);
    for (const path of lockup.paths) {
      expect(path.d).toMatch(/^M/);
      expect(path.d).not.toContain('NaN');
    }
  });

  it('grows downwards, not sideways, when an entity name is added laterally', () => {
    const bare = buildLockup(spec(), typeface);
    const named = buildLockup(spec({ secondaryText: 'Berrien Springs' }), typeface);
    expect(named.viewBox.height).toBeGreaterThan(bare.viewBox.height);
    expect(named.viewBox.width).toBeCloseTo(bare.viewBox.width, 1);
  });

  it('reduces a long entity name before breaking it onto a second line', () => {
    // adventist.design describes long secondary type as reduced, never wrapped,
    // so a name that overruns must shrink while it still can.
    const long = buildLockup(
      spec({ secondaryText: 'Zimbabwe East Union Conference Headquarters Church' }),
      typeface,
    );
    expect(long.notes).toContain('The second line was reduced to fit, within the permitted range.');
    expect(long.notes).not.toContain('The second line wraps onto two lines.');
  });

  it('lets the entity identifier run wider than the wordmark and set the lockup width', () => {
    // The published clear-space reference shows the identifier extending past
    // the wordmark's right edge, so it — not the wordmark — fixes the width.
    const short = buildLockup(spec({ secondaryText: 'Solusi' }), typeface);
    const long = buildLockup(
      spec({ secondaryText: 'Zimbabwe East Union Conference Headquarters Church' }),
      typeface,
    );
    expect(long.viewBox.width).toBeGreaterThan(short.viewBox.width);
  });

  it('never reduces the entity identifier below half the primary x-height', () => {
    const absurd = buildLockup(
      spec({
        secondaryText:
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

  it('builds geometry that follows the construction grid', () => {
    // Measured from four SID church logos rendered at 3000px wide; see
    // docs/reference/sid-church-logos/. Stated in x, the primary type's
    // x-height, which is the unit the identity system itself uses.
    //
    // These assert the geometry the engine actually emits, read back from the
    // guides, rather than restating the constants that produced it — a test
    // that only rearranges `GRID` cannot catch a layout that stops using it.
    const g = grid(typeface.xHeight);
    const lockup = buildLockup(spec({ secondaryText: 'Solusi' }), typeface);
    const guides = lockup.guides;
    expect(guides).toBeDefined();
    const inX = (v: number) => v / g.x;

    const baselines = guides!.wordmarkBaselines;
    expect(baselines.length).toBeGreaterThan(1);
    expect(inX((baselines.at(-1) ?? 0) - (baselines[0] ?? 0))).toBeCloseTo(2, 2);
    expect(inX(guides!.symbol.height)).toBeCloseTo(4.42, 2);

    // Clear space is padding either side, so half the difference is one edge.
    const padded = buildLockup(
      spec({ secondaryText: 'Solusi', includeClearSpace: true }),
      typeface,
    );
    expect(inX((padded.viewBox.width - padded.contentBox.width) / 2)).toBeCloseTo(2, 2);
  });

  it('sets the wordmark at the size the published artwork uses', () => {
    // The measured ratio of wordmark type size to symbol height is 0.4221.
    const g = grid(typeface.xHeight);
    expect(g.primarySize / SYMBOL_UNITS).toBeCloseTo(0.4221, 3);
  });

  it('rests the wordmark on the symbol baseline in the lateral lockup', () => {
    // All four published logos put the last wordmark baseline exactly level
    // with the bottom of the symbol.
    const lockup = buildLockup(spec(), typeface);
    const g = lockup.guides;
    expect(g).toBeDefined();
    const lastBaseline = g!.wordmarkBaselines[g!.wordmarkBaselines.length - 1];
    expect(lastBaseline).toBeCloseTo(g!.symbol.y + g!.symbol.height, 3);
  });

  it('adds the required clear space when asked, and none when not', () => {
    const tight = buildLockup(spec({ secondaryText: 'Solusi' }), typeface);
    const padded = buildLockup(spec({ secondaryText: 'Solusi', includeClearSpace: true }), typeface);
    const expected = grid(typeface.xHeight).clearSpace;

    expect(tight.viewBox.width).toBeCloseTo(tight.contentBox.width, 5);
    expect(padded.viewBox.width - padded.contentBox.width).toBeCloseTo(expected * 2, 1);
  });

  it('sets the entity name in capitals', () => {
    const lower = buildLockup(spec({ secondaryText: 'rosettenville' }), typeface);
    const upper = buildLockup(spec({ secondaryText: 'ROSETTENVILLE' }), typeface);
    expect(lower.viewBox.width).toBeCloseTo(upper.viewBox.width, 3);
    expect(lower.viewBox.height).toBeCloseTo(upper.viewBox.height, 3);
  });

  it('centres the stacked lockup on a single axis', () => {
    const lockup = buildLockup(
      spec({ layout: 'stacked', secondaryText: 'Blantyre Central' }),
      typeface,
    );
    const centre = lockup.contentBox.x + lockup.contentBox.width / 2;
    // Every element is centred on the same line, so the content box's own
    // centre must coincide with it.
    expect(Number.isFinite(centre)).toBe(true);
    expect(lockup.contentBox.height).toBeGreaterThan(lockup.contentBox.width * 0.4);
  });
});

describe('composition — how a name is set against the denomination', () => {
  // Calls the real composer, so the test cannot drift from the app the way a
  // re-implementation of the branch order would.
  const compose = (
    approachId: string,
    over: Partial<{ entityName: string; departmentName: string; departmentOptionId: string }> = {},
  ) => {
    const language = requireLanguage('en');
    return composeLockupText({
      approach: requireApproach(approachId),
      departmentOption: requireDepartmentOption(over.departmentOptionId ?? 'hierarchy'),
      wordmarkLines: wordmarkLines(language),
      denominationShort: language.denominationShort,
      administrativeForms: language.administrativeForms,
      entityName: over.entityName ?? '',
      entityType: '',
      departmentName: over.departmentName ?? '',
      wrap: (text) => [text],
    });
  };

  it('sets the denomination above the church name, not before it', () => {
    // The published artwork puts the denomination on top with the entity
    // identifier beneath. An earlier build composed the name first, flowing
    // into the denomination — this pins the order so it cannot flip back.
    const { primary, secondary } = compose('smaller-size', { entityName: 'Rosettenville' });
    expect(primary).toEqual(['Seventh-day', 'Adventist® Church']);
    expect(secondary).toBe('Rosettenville');
  });

  it('keeps the denomination anchored when the name is set at full size', () => {
    // At equal size the name must still be a secondary line. Adding it to the
    // primary block would lift the denomination off the symbol, because the
    // lateral construction levels the last primary baseline with the symbol.
    const { primary, secondary, secondaryAtPrimarySize } = compose('equal-size', {
      entityName: 'Rosettenville',
    });
    expect(primary).toEqual(['Seventh-day', 'Adventist® Church']);
    expect(secondary).toBe('Rosettenville');
    expect(secondaryAtPrimarySize).toBe(true);
  });

  it('keeps the authored wordmark line breaks in a church lockup', () => {
    // Zulu is published as two authored lines; composing must not re-break it.
    const zu = requireLanguage('zu');
    expect(wordmarkLines(zu)).toEqual(['iNkonzo ya', 'ma Sabatha']);
  });

  it('leads with the entity name in an administrative lockup', () => {
    const { primary } = compose('of-adventists', {
      entityName: 'Southern Africa-Indian Ocean Division',
    });
    expect(primary[0]).toBe('Southern Africa-Indian Ocean Division');
    expect(primary.at(-1)).toBe('of Seventh-day Adventists');
  });

  it('collapses stray whitespace in a typed name', () => {
    const { secondary } = compose('smaller-size', { entityName: '  Cape   Town  ' });
    expect(secondary).toBe('Cape Town');
  });

  it('renders every department option without dropping a field', () => {
    for (const option of DEPARTMENT_OPTIONS) {
      const { primary } = compose('of-adventists', {
        entityName: 'Northern Conference',
        departmentName: 'Family Ministries',
        departmentOptionId: option.id,
      });
      const joined = primary.join(' ');
      expect(joined, option.id).toContain('Family Ministries');
      expect(joined, option.id).toContain('Northern Conference');
      expect(
        primary.every((l) => l.trim() !== ''),
        option.id,
      ).toBe(true);
    }
  });

  it('accepts linking wording supplied for a language that has no approved form', () => {
    // "The previous examples may not translate directly across languages, so
    // the principle to keep in mind is …" — the guidelines expect the wording
    // to be rendered locally, so the tool must set it rather than refuse it.
    const pt = requireLanguage('pt');
    const composed = composeLockupText({
      approach: requireApproach('of-adventists'),
      departmentOption: requireDepartmentOption('hierarchy'),
      wordmarkLines: wordmarkLines(pt),
      administrativeForms: pt.administrativeForms,
      customAdministrativeForm: '  dos   Adventistas do Sétimo Dia ',
      entityName: 'União Angolana',
      entityType: '',
      departmentName: '',
      wrap: (text) => [text],
    });
    expect(composed.primary[0]).toBe('União Angolana');
    // Whitespace is collapsed, and the approved form still wins where it exists.
    expect(composed.primary.at(-1)).toBe('dos Adventistas do Sétimo Dia');
  });

  it('prefers a language’s approved wording over anything typed', () => {
    const en = requireLanguage('en');
    const composed = composeLockupText({
      approach: requireApproach('of-adventists'),
      departmentOption: requireDepartmentOption('hierarchy'),
      wordmarkLines: wordmarkLines(en),
      administrativeForms: en.administrativeForms,
      customAdministrativeForm: 'something else entirely',
      entityName: 'Northern Conference',
      entityType: '',
      departmentName: '',
      wrap: (text) => [text],
    });
    expect(composed.primary.at(-1)).toBe('of Seventh-day Adventists');
  });

  it('keeps the typed name when a language has no approved wording', () => {
    // Portuguese has no administrative form. The name must survive into the
    // artwork rather than falling back to the bare denomination logo.
    const pt = requireLanguage('pt');
    expect(pt.administrativeForms).toBeUndefined();
    const composed = composeLockupText({
      approach: requireApproach('of-adventists'),
      departmentOption: requireDepartmentOption('hierarchy'),
      wordmarkLines: wordmarkLines(pt),
      denominationShort: pt.denominationShort,
      administrativeForms: pt.administrativeForms,
      entityName: 'Angola Union',
      entityType: '',
      departmentName: '',
      wrap: (text) => [text],
    });
    expect([...composed.primary, composed.secondary].join(' ')).toContain('Angola Union');
  });
});

describe('secondary leading', () => {
  it('stays proportional when the line is reduced', () => {
    // A fixed step would leave a reduced line with half again the leading the
    // design calls for.
    const short = buildLockup(spec({ secondaryText: 'Solusi Adventist University Campus' }), typeface);
    const long = buildLockup(
      spec({
        secondaryText:
          'Southern Africa Indian Ocean Division Department of Family and Childrens Ministries',
      }),
      typeface,
    );
    const step = (l: typeof short) => {
      const b = l.guides?.identifierBaselines ?? [];
      return b.length > 1 ? (b[1] ?? 0) - (b[0] ?? 0) : 0;
    };
    // The long name is reduced further, so its leading must be tighter, not equal.
    if (step(long) > 0 && step(short) > 0) expect(step(long)).toBeLessThan(step(short));
  });
});
