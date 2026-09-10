import { describe, expect, it } from 'vitest';
import {
  ACTIVE_LANGUAGES,
  wordmarkTextWithMark,
  LANGUAGES,
  STAGED_LANGUAGES,
  requireLanguage,
  wordmarkLines,
} from '@/brand/languages';
import { LOGO_COLOURS, getColour, DEFAULT_COLOUR_ID } from '@/brand/palette';
import {
  APPROACHES,
  CATEGORIES,
  requireApproach,
  requireCategory,
} from '@/brand/entityIdentifiers';
import { UNIONS, territoryName } from '@/brand/territories';
import { requireLayout } from '@/core/layouts';
import { buildFilename, slug } from '@/core/filename';

describe('the language registry', () => {
  it('has no duplicate codes', () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('splits every wordmark into one or two lines', () => {
    for (const language of LANGUAGES) {
      expect(language.wordmark.length, language.code).toBeGreaterThan(0);
      expect(language.wordmark.length, language.code).toBeLessThanOrEqual(2);
      for (const line of language.wordmark) expect(line.trim(), language.code).not.toBe('');
    }
  });

  it('marks every staged language as unverified, so a draft cannot ship by accident', () => {
    for (const language of STAGED_LANGUAGES) {
      expect(language.approval.verified, language.code).toBe(false);
    }
  });

  it('marks every active language as verified', () => {
    for (const language of ACTIVE_LANGUAGES) {
      expect(language.approval.verified, language.code).toBe(true);
    }
  });

  it('carries the whole SID territory across its staged languages', () => {
    const covered = new Set(LANGUAGES.flatMap((l) => l.territories));
    const sidTerritories = new Set(UNIONS.flatMap((u) => u.territories));
    for (const code of sidTerritories) {
      expect(covered.has(code), `${territoryName(code)} has no language`).toBe(true);
    }
  });

  it('adds the registered mark after Adventist in English only', () => {
    expect(wordmarkLines(requireLanguage('en')).join(' ')).toContain('Adventist®');
    expect(wordmarkLines(requireLanguage('pt')).join(' ')).not.toContain('®');
  });

  it('falls back to English for an unknown code rather than throwing', () => {
    expect(requireLanguage('zz-XX').code).toBe('en');
  });
});

describe('the entity identifier registry', () => {
  it('places every approach in a category that exists', () => {
    const categories = new Set(CATEGORIES.map((c) => c.id));
    for (const a of APPROACHES) expect(categories.has(a.category), a.id).toBe(true);
  });

  it('offers at least one approach in every category', () => {
    for (const c of CATEGORIES) {
      expect(APPROACHES.some((a) => a.category === c.id), c.id).toBe(true);
    }
  });

  it('marks exactly one approach per category as preferred', () => {
    // The guidelines rank the options; a category with two preferred options,
    // or none, would leave the user without a default to reach for.
    for (const c of CATEGORIES) {
      const preferred = APPROACHES.filter(
        (a) => a.category === c.id && a.acceptability === 'preferred',
      );
      expect(preferred.length, c.id).toBe(1);
    }
  });

  it('lists the preferred approach first in its category', () => {
    for (const c of CATEGORIES) {
      const inCategory = APPROACHES.filter((a) => a.category === c.id);
      expect(inCategory[0]?.acceptability, c.id).toBe('preferred');
    }
  });

  it('gives every approach a rationale and an example shape', () => {
    for (const a of APPROACHES) {
      expect(a.help.length, a.id).toBeGreaterThan(20);
      expect(a.shape.length, a.id).toBeGreaterThan(0);
    }
  });

  it('falls back to the preferred approach for an unknown id', () => {
    expect(requireApproach('nonsense').id).toBe('equal-size');
  });

  it('falls back to the default category for a retired id', () => {
    // Category ids are persisted in the browser. "public" was renamed to
    // "church"; anyone carrying the old value must still get a usable picker
    // rather than a category with no approaches in it.
    expect(requireCategory('public').id).toBe('church');
    expect(requireCategory('nonsense').id).toBe('church');
  });
});

describe('the palette', () => {
  it('has no duplicate ids and only valid hex values', () => {
    const ids = LOGO_COLOURS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const colour of LOGO_COLOURS) {
      expect(colour.hex, colour.id).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('falls back to the default colour for an unknown id', () => {
    expect(getColour('nonsense').id).toBe(DEFAULT_COLOUR_ID);
  });
});

describe('the layout registry', () => {
  it('falls back to the lateral layout for an unknown id', () => {
    expect(requireLayout('nonsense').id).toBe('lateral');
  });
});

describe('download filenames', () => {
  it('describes every choice that distinguishes a file', () => {
    expect(
      buildFilename({
        entityName: 'Rosettenville',
        languageCode: 'en',
        layoutId: 'lateral',
        colourId: 'cave',
        extension: 'png',
        widthPx: 2400,
      }),
    ).toBe('rosettenville_en_lateral_cave_2400px.png');
  });

  it('names the base logo when there is no entity name', () => {
    expect(
      buildFilename({
        entityName: '',
        languageCode: 'pt',
        layoutId: 'stacked',
        colourId: 'black',
        extension: 'svg',
      }),
    ).toBe('seventh-day-adventist-church_pt_stacked_black.svg');
  });

  it('strips accents so the name survives email and Windows', () => {
    expect(slug('São Tomé e Príncipe')).toBe('sao-tome-e-principe');
    expect(slug('Tshivenḓa Ḽa')).not.toContain(' ');
  });
});

describe('the registered mark', () => {
  it('survives composition into a longer line', () => {
    // The mark is required after "Adventist" in English. Composing the entity
    // name with the denomination must not drop it.
    const en = requireLanguage('en');
    expect(wordmarkTextWithMark(en)).toContain('Adventist®');
  });

  it('is absent where the language does not declare one', () => {
    const pt = requireLanguage('pt');
    expect(wordmarkTextWithMark(pt)).not.toContain('®');
  });
});
