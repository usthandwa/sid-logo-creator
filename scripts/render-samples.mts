/**
 * Renders a sheet of sample lockups for visual review.
 *
 *   npm run samples
 *
 * Writes SVG and PNG files to `samples/`. Useful when changing the
 * construction constants: a ratio that is slightly wrong passes every unit
 * test and is obvious the moment you look at it.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as opentype from 'opentype.js';
import sharp from 'sharp';
import { requireLanguage, wordmarkLines } from '../src/brand/languages';
import { buildLockup } from '../src/core/buildLockup';
import { toSvgString } from '../src/core/exportSvg';
import { createTypeface } from '../src/core/typeface';
import type { LayoutId } from '../src/core/layouts';

const root = process.cwd();
const outDir = resolve(root, 'samples');
mkdirSync(outDir, { recursive: true });

const buffer = readFileSync(resolve(root, 'public/fonts/AdventSans-Logo.otf'));
const copy = new ArrayBuffer(buffer.byteLength);
new Uint8Array(copy).set(buffer);
const typeface = createTypeface(opentype.parse(copy), true);

interface Sample {
  readonly name: string;
  readonly language: string;
  readonly layout: LayoutId;
  readonly entityName: string;
  readonly descriptor: string;
  readonly colour: string;
}

const SAMPLES: readonly Sample[] = [
  {
    name: '01-base-en-lateral',
    language: 'en',
    layout: 'lateral',
    entityName: '',
    descriptor: '',
    colour: '#12100b',
  },
  {
    name: '02-church-en-lateral',
    language: 'en',
    layout: 'lateral',
    entityName: 'Rosettenville',
    descriptor: '',
    colour: '#12100b',
  },
  {
    name: '03-church-en-stacked',
    language: 'en',
    layout: 'stacked',
    entityName: 'Rosettenville',
    descriptor: '',
    colour: '#255760',
  },
  {
    name: '04-union-en-lateral',
    language: 'en',
    layout: 'lateral',
    entityName: 'Zimbabwe East Union Conference',
    descriptor: 'Communication',
    colour: '#2f557f',
  },
  {
    name: '05-division-pt-lateral',
    language: 'pt',
    layout: 'lateral',
    entityName: 'Divisão da África Austral e Oceano Índico',
    descriptor: 'Comunicação',
    colour: '#12100b',
  },
  {
    name: '06-church-fr-stacked',
    language: 'fr',
    layout: 'stacked',
    entityName: 'Antananarivo Centre',
    descriptor: '',
    colour: '#12100b',
  },
  {
    name: '08-staged-af-lateral',
    language: 'af',
    layout: 'lateral',
    entityName: 'Kwa-Thema Sentraal',
    descriptor: '',
    colour: '#12100b',
  },
  {
    name: '09-staged-sn-lateral',
    language: 'sn',
    layout: 'lateral',
    entityName: 'Harare City Centre',
    descriptor: '',
    colour: '#12100b',
  },
  {
    name: '10-staged-zu-stacked',
    language: 'zu',
    layout: 'stacked',
    entityName: 'Kwa-Mashu',
    descriptor: '',
    colour: '#12100b',
  },
];

for (const sample of SAMPLES) {
  const language = requireLanguage(sample.language);
  const lockup = buildLockup(
    {
      layout: sample.layout,
      wordmarkLines: wordmarkLines(language),
      entityName: sample.entityName,
      descriptor: sample.descriptor,
      colour: sample.colour,
      includeClearSpace: false,
      uppercaseEntityName: true,
      locale: language.code,
    },
    typeface,
  );

  const svg = toSvgString(lockup, {
    colour: sample.colour,
    title: `${sample.entityName || 'Base logo'} — ${language.englishName}`,
    background: '#ffffff',
  });

  writeFileSync(resolve(outDir, `${sample.name}.svg`), svg);
  await sharp(Buffer.from(svg), { density: 72, limitInputPixels: false })
    .resize({ width: 1400, fit: 'inside' })
    .png()
    .toFile(resolve(outDir, `${sample.name}.png`));
}

console.log(`Wrote ${String(SAMPLES.length)} samples to samples/.`);
