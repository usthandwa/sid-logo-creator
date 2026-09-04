/**
 * Download filenames.
 *
 * A church that downloads six variants should be able to tell them apart in
 * their Downloads folder six months later, so the name carries everything
 * that distinguishes the file.
 */

export interface FilenameParts {
  readonly entityName: string;
  readonly languageCode: string;
  readonly layoutId: string;
  readonly colourId: string;
  readonly extension: 'svg' | 'png';
  readonly widthPx?: number;
}

export function buildFilename(parts: FilenameParts): string {
  const segments = [
    slug(parts.entityName) || 'seventh-day-adventist-church',
    parts.languageCode,
    parts.layoutId,
    parts.colourId,
  ];
  if (parts.widthPx) segments.push(`${String(parts.widthPx)}px`);
  return `${segments.join('_')}.${parts.extension}`;
}

/**
 * Latin-ises accents so the filename survives a trip through email, Windows
 * and an FTP server, without silently dropping non-Latin scripts entirely.
 */
export function slug(value: string): string {
  const normalised = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalised.slice(0, 60);
}
