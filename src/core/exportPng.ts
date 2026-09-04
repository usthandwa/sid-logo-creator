/**
 * PNG rasterisation.
 *
 * Rendered from the same SVG string the user can download, so the bitmap and
 * the vector can never disagree. The source SVG carries no external
 * references, which is what lets the image load inside a canvas without
 * tainting it.
 */

import type { Lockup } from './types';
import { toSvgString } from './exportSvg';

export interface PngOptions {
  readonly colour: string;
  readonly title: string;
  /** Target width in pixels. Height follows the lockup's aspect ratio. */
  readonly width: number;
  /** Solid background. Omit for a transparent PNG. */
  readonly background?: string;
}

export const PNG_WIDTH_PRESETS = [
  { id: 'screen', label: 'Screen', width: 1200, help: 'Slides, documents, social posts' },
  { id: 'large', label: 'Large', width: 2400, help: 'Banners, posters, print at A4' },
  { id: 'print', label: 'Print', width: 4800, help: 'Large-format print and signage' },
] as const;

export type PngPresetId = (typeof PNG_WIDTH_PRESETS)[number]['id'];

export async function toPngBlob(lockup: Lockup, options: PngOptions): Promise<Blob> {
  const svg = toSvgString(lockup, {
    colour: options.colour,
    title: options.title,
    ...(options.background ? { background: options.background } : {}),
  });

  const aspect = lockup.viewBox.height / lockup.viewBox.width;
  const width = Math.max(1, Math.round(options.width));
  const height = Math.max(1, Math.round(width * aspect));

  const image = await loadSvgImage(svg, width, height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new RasterisationError('This browser could not provide a 2D canvas.');

  context.drawImage(image, 0, 0, width, height);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new RasterisationError('The browser could not encode the PNG.'));
    }, 'image/png');
  });
}

function loadSvgImage(svg: string, width: number, height: number): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.width = width;
    image.height = height;
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new RasterisationError('The generated SVG could not be rasterised.'));
    };
    image.src = url;
  });
}

export class RasterisationError extends Error {
  override name = 'RasterisationError';
}
