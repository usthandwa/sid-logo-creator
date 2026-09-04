import { describe, expect, it } from 'vitest';
import {
  ACTIVE_LANGUAGES,
  LANGUAGES,
  STAGED_LANGUAGES,
  requireLanguage,
  wordmarkLines,
} from '@/brand/languages';
import { LOGO_COLOURS, getColour, DEFAULT_COLOUR_ID } from '@/brand/palette';
import { TIERS, TIER_GROUPS, requireTier } from '@/brand/tiers';
import { UNIONS, territoryName } from '@/brand/territories';
import { LAYOUTS, requireLayout } from '@/core/layouts';
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

describe('the tier registry', () => {
  it('places every tier in a group that exists', () => {
    const groups = new Set(TIER_GROUPS.map((g) => g.id));
    for (const tier of TIERS) expect(groups.has(tier.group), tier.id).toBe(true);
  });

  it('gives every tier at least one layout that exists', () => {
    const layouts = new Set(LAYOUTS.map((l) => l.id));
    for (const tier of TIERS) {
      expect(tier.layouts.length, tier.id).toBeGreaterThan(0);
      for (const id of tier.layouts) expect(layouts.has(id), `${tier.id}/${id}`).toBe(true);
    }
  });

  it('gives every tier that allows a descriptor a placeholder for it', () => {
    for (const tier of TIERS) {
      if (tier.allowsDescriptor) expect(tier.descriptorPlaceholder, tier.id).toBeTruthy();
    }
  });

  it('falls back to a church for an unknown tier', () => {
    expect(requireTier('nonsense').id).toBe('church');
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
