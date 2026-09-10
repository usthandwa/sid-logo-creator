import { describe, expect, it } from 'vitest';
import { requireLanguage, wordmarkLines } from '@/brand/languages';
import { buildLockup } from '@/core/buildLockup';
import { toSvgString } from '@/core/exportSvg';
import type { Lockup, LockupSpec } from '@/core/types';
import { testTypeface } from './fixtures';

const typeface = testTypeface();

const spec: LockupSpec = {
  layout: 'lateral',
  primaryLines: wordmarkLines(requireLanguage('en')),
  secondaryText: 'Rosettenville',
  descriptor: '',
  colour: '#255760',
  includeClearSpace: false,
  uppercaseSecondary: true,
  locale: 'en',
};

describe('SVG export', () => {
  const svg = toSvgString(buildLockup(spec, typeface), {
    colour: '#255760',
    title: 'Rosettenville — Seventh-day Adventist Church',
  });

  it('is well-formed XML that a browser will parse', () => {
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
    expect(document.querySelector('parsererror')).toBeNull();
    expect(document.documentElement.tagName).toBe('svg');
  });

  it('carries no font reference, so it opens without Advent Sans installed', () => {
    expect(svg).not.toContain('<text');
    expect(svg).not.toContain('font-family');
    expect(svg).not.toContain('@font-face');
  });

  it('references nothing outside the file', () => {
    expect(svg).not.toContain('<image');
    expect(svg).not.toMatch(/xlink:href|href="http/);
  });

  it('states the colour once, on the group', () => {
    expect(svg).toContain('fill="#255760"');
    expect(svg.match(/fill="#255760"/g)).toHaveLength(1);
  });

  it('is transparent unless a background is asked for', () => {
    expect(svg).not.toContain('<rect');
    const onWhite = toSvgString(buildLockup(spec, typeface), {
      colour: '#000000',
      title: 'x',
      background: '#ffffff',
    });
    expect(onWhite).toContain('<rect');
  });

  it('escapes a title that contains XML characters', () => {
    const risky = toSvgString(buildLockup(spec, typeface), {
      colour: '#000000',
      title: 'Ambrose & Sons <Church> "Main"',
    });
    const document = new DOMParser().parseFromString(risky, 'image/svg+xml');
    expect(document.querySelector('parsererror')).toBeNull();
    expect(document.querySelector('title')?.textContent).toBe('Ambrose & Sons <Church> "Main"');
  });

  it('keeps the aspect ratio of the geometry it was built from', () => {
    const lockup = buildLockup(spec, typeface);
    const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const viewBox = document.documentElement.getAttribute('viewBox')?.split(' ').map(Number) ?? [];
    expect(viewBox[2]).toBeCloseTo(lockup.viewBox.width, 2);
    expect(viewBox[3]).toBeCloseTo(lockup.viewBox.height, 2);
  });

  it('cannot leak construction guides into an exported file', () => {
    // Guides live in `lockup.guides` and in the preview component only. The
    // exporter serialises `paths`, so a lockup that carries guides must
    // produce byte-identical output to one that does not.
    const lockup = buildLockup(
      {
        layout: 'lateral',
        primaryLines: wordmarkLines(requireLanguage('en')),
        secondaryText: 'Rosettenville',
        descriptor: 'Communication',
        colour: '#000000',
        includeClearSpace: false,
        uppercaseSecondary: true,
        locale: 'en',
      },
      testTypeface(),
    );

    expect(lockup.guides).toBeDefined();

    const guideless: Lockup = {
      viewBox: lockup.viewBox,
      contentBox: lockup.contentBox,
      paths: lockup.paths,
      notes: lockup.notes,
    };
    const withGuides = toSvgString(lockup, { colour: '#000000', title: 'x' });
    const withoutGuides = toSvgString(guideless, { colour: '#000000', title: 'x' });

    expect(withGuides).toBe(withoutGuides);
    expect(withGuides).not.toContain('stroke');
  });
});
