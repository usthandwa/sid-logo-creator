/**
 * Generates the PWA icons and the favicon from the church symbol, so the
 * installed app carries the same artwork as everything it produces.
 *
 *   node scripts/generate-icons.mjs
 *
 * Run it again after any change to src/brand/symbol.ts. The output is checked
 * in so a clone builds without a rendering toolchain.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, '../public');
const require = createRequire(import.meta.url);

// Read the artwork straight out of the registry rather than duplicating it.
const source = await import(resolve(here, '../src/brand/symbol.ts')).catch(() => null);

const SYMBOL = source?.CHURCH_SYMBOL ?? readSymbolFromSource();

function readSymbolFromSource() {
  const { readFileSync } = require('node:fs');
  const text = readFileSync(resolve(here, '../src/brand/symbol.ts'), 'utf8');
  const paths = [...text.matchAll(/'(M[^']+)'/g)].map((m) => m[1]);
  const box = /width:\s*([\d.]+),\s*height:\s*([\d.]+)/.exec(text);
  if (paths.length === 0 || !box) throw new Error('Could not read the symbol artwork.');
  return {
    viewBox: { x: 0, y: 0, width: Number(box[1]), height: Number(box[2]) },
    paths,
  };
}

function symbolSvg({ size, padding, background, colour }) {
  const { width, height } = SYMBOL.viewBox;
  const available = size - padding * 2;
  const scale = Math.min(available / width, available / height);
  const x = (size - width * scale) / 2;
  const y = (size - height * scale) / 2;
  const rect = background
    ? `<rect width="${size}" height="${size}" fill="${background}"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${rect}
  <g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(5)})" fill="${colour}" fill-rule="nonzero">
${SYMBOL.paths.map((d) => `    <path d="${d}"/>`).join('\n')}
  </g>
</svg>
`;
}

mkdirSync(resolve(publicDir, 'icons'), { recursive: true });

writeFileSync(
  resolve(publicDir, 'favicon.svg'),
  symbolSvg({ size: 64, padding: 4, background: null, colour: '#255760' }),
);

const targets = [
  { name: 'icon-192', size: 192, padding: 24, maskable: false },
  { name: 'icon-512', size: 512, padding: 64, maskable: false },
  // Maskable icons are cropped to a circle on Android, so the artwork sits
  // inside the 80% safe area.
  { name: 'icon-maskable-512', size: 512, padding: 112, maskable: true },
];

let sharp = null;
try {
  sharp = require('sharp');
} catch {
  console.warn(
    'sharp is not installed, so only SVG icons were written.\n' +
      'Run `npm i -D sharp` and re-run this script to produce the PNGs.',
  );
}

for (const target of targets) {
  const svg = symbolSvg({
    size: target.size,
    padding: target.padding,
    background: '#ffffff',
    colour: '#255760',
  });
  writeFileSync(resolve(publicDir, 'icons', `${target.name}.svg`), svg);
  if (sharp) {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(resolve(publicDir, 'icons', `${target.name}.png`));
  }
}

console.log(`Wrote favicon.svg and ${String(targets.length)} icons to public/.`);
