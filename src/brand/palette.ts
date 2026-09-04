/**
 * Colour registry.
 *
 * adventist.design states there is no single global Adventist colour system:
 * each division publishes its own, and where one has not yet been published
 * the recommended base is the ALPS palette. SID has not published a division
 * colour system, so the ALPS palette ships as the default here.
 *
 * ─── To adopt an official SID palette ───────────────────────────────────────
 * Replace the entries in `LOGO_COLOURS` with the division's colours. Nothing
 * else in the codebase needs to change: the UI, the exporters and the tests
 * all read this registry.
 *
 * Source of the default values: Adventist Living Pattern System (ALPS),
 * https://alps.adventist.io — name, hex and Pantone as published.
 */

export interface LogoColour {
  /** Stable identifier used in URLs, filenames and saved presets. */
  readonly id: string;
  /** Display name, as published in the palette it comes from. */
  readonly name: string;
  readonly hex: string;
  /** Pantone reference where the source palette gives one. */
  readonly pantone?: string;
  /** Grouping used to lay the swatches out. */
  readonly group: 'core' | 'muted' | 'bright';
  /**
   * True when the colour is light enough that it needs a dark preview
   * surface to be legible.
   */
  readonly requiresDarkSurface?: boolean;
}

export const LOGO_COLOURS: readonly LogoColour[] = [
  // ── Core ─────────────────────────────────────────────────────────────────
  { id: 'black', name: 'Black', hex: '#000000', group: 'core' },
  { id: 'white', name: 'White', hex: '#ffffff', group: 'core', requiresDarkSurface: true },
  { id: 'gray-darker', name: 'Gray — Darker', hex: '#222222', group: 'core' },

  // ── Muted (recommended for entity identifiers) ───────────────────────────
  { id: 'cave', name: 'Cave', hex: '#255760', pantone: '7476 C', group: 'muted' },
  { id: 'denim', name: 'Denim', hex: '#2f557f', pantone: '647 C', group: 'muted' },
  { id: 'forest', name: 'Forest', hex: '#355724', pantone: '357 C', group: 'muted' },
  { id: 'emperor', name: 'Emperor', hex: '#4b207f', pantone: '268 C', group: 'muted' },
  { id: 'grapevine', name: 'Grapevine', hex: '#712551', pantone: '216 C', group: 'muted' },
  { id: 'velvet', name: 'Velvet', hex: '#782832', pantone: '209 C', group: 'muted' },
  { id: 'earth', name: 'Earth', hex: '#5e3929', pantone: '476 C', group: 'muted' },
  { id: 'night', name: 'Night', hex: '#4a4a4a', pantone: 'Cool Gray 10 C', group: 'muted' },

  // ── Bright ───────────────────────────────────────────────────────────────
  { id: 'ming', name: 'Ming', hex: '#007f98', pantone: '7474 C', group: 'bright' },
  { id: 'bluejay', name: 'Bluejay', hex: '#2e6de7', pantone: '285 C', group: 'bright' },
  { id: 'tree-frog', name: 'Tree Frog', hex: '#2b8500', pantone: '362 C', group: 'bright' },
  { id: 'iris', name: 'Iris', hex: '#9013fe', pantone: '2665 C', group: 'bright' },
  { id: 'lily', name: 'Lily', hex: '#d41583', pantone: '219 C', group: 'bright' },
  { id: 'scarlett', name: 'Scarlett', hex: '#d0021b', pantone: '199 C', group: 'bright' },
  { id: 'campfire', name: 'Campfire', hex: '#cd4900', pantone: '1595 C', group: 'bright' },
];

export const DEFAULT_COLOUR_ID = 'black';

const colourIndex = new Map(LOGO_COLOURS.map((c) => [c.id, c]));

export function getColour(id: string): LogoColour {
  const found = colourIndex.get(id);
  if (found) return found;
  const fallback = colourIndex.get(DEFAULT_COLOUR_ID);
  /* c8 ignore next */
  if (!fallback) throw new Error('Palette is missing its default colour.');
  return fallback;
}

export const COLOUR_GROUPS = [
  { id: 'core', label: 'Core' },
  { id: 'muted', label: 'Muted' },
  { id: 'bright', label: 'Bright' },
] as const;

/** Preview surfaces. These never affect the exported artwork. */
export interface PreviewSurface {
  readonly id: string;
  readonly name: string;
  /** `null` renders the transparency chequerboard. */
  readonly hex: string | null;
}

export const PREVIEW_SURFACES: readonly PreviewSurface[] = [
  { id: 'transparent', name: 'Transparent', hex: null },
  { id: 'white', name: 'White', hex: '#ffffff' },
  { id: 'cave', name: 'Cave', hex: '#255760' },
  { id: 'ink', name: 'Ink', hex: '#141414' },
];

export const DEFAULT_SURFACE_ID = 'transparent';
