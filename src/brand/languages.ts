/**
 * Language registry.
 *
 * ─── How this file works ────────────────────────────────────────────────────
 * Every language the tool can ever produce a lockup in is listed here exactly
 * once. `status` decides who sees it:
 *
 *   'active'  — offered to everyone in the main creator.
 *   'staged'  — held behind the Language Lab (see src/features/languageLab).
 *               Fully renderable and previewable, but not offered publicly
 *               until SID Communication has approved the wording.
 *
 * ─── Activating a language ──────────────────────────────────────────────────
 * 1. Open the Language Lab, preview the lockup, and check it against the
 *    union's own published usage.
 * 2. Get the wording confirmed in writing by the union communication director.
 * 3. Change `status` to 'active' and `approval.verified` to true in this file,
 *    recording who approved it and when.
 * 4. Open a pull request. That is the whole change — no artwork, no layout
 *    work, no build configuration.
 *
 * ─── Adding a language that is not listed ───────────────────────────────────
 * Append an entry. `wordmark` is the denomination name split into the lines it
 * should set on; keep it to two lines wherever the language allows, because
 * that is what the construction ratios are built around.
 *
 * IMPORTANT: the staged wordmarks below are working drafts prepared from
 * general usage, NOT approved denominational renderings. They are marked
 * `verified: false` for that reason and must not be published until a union
 * communication director has confirmed the wording.
 */


export type LanguageStatus = 'active' | 'staged';

export interface LanguageApproval {
  /** True only once a union communication director has confirmed the wording. */
  readonly verified: boolean;
  /** Name or office that confirmed it. */
  readonly approvedBy?: string;
  /** ISO date of confirmation. */
  readonly approvedOn?: string;
  readonly note?: string;
}

export interface LanguageDef {
  /** BCP-47 tag. Used in filenames, URLs and saved presets. */
  readonly code: string;
  /** The language's name in the language itself. */
  readonly endonym: string;
  /** The language's name in English, for administrative screens. */
  readonly englishName: string;
  readonly status: LanguageStatus;
  readonly direction: 'ltr' | 'rtl';
  /**
   * The denomination name, split into the lines it sets on.
   * The registered-trademark mark is added by the renderer, not typed here —
   * `registeredMarkAfter` says which word it follows.
   */
  readonly wordmark: readonly string[];
  /**
   * Word in `wordmark` that the ® follows. adventist.design requires the mark
   * after "Adventist" in English. Omit where the mark is not used.
   */
  readonly registeredMarkAfter?: string;
  /**
   * The shortened form of the denomination — "Adventist" in English — used by
   * the "only Adventist in the name" approach. Omit where no approved
   * shortening exists; the approach is then offered but disabled.
   */
  readonly denominationShort?: string;
  /**
   * The administrative naming wording, preferred form first:
   * ["of Seventh-day Adventists", "of the Seventh-day Adventist Church"].
   * Omit where no approved wording exists.
   */
  readonly administrativeForms?: readonly [string, string];
  /** ISO 3166-1 alpha-2 codes of SID territories where the language is used. */
  readonly territories: readonly string[];
  readonly approval: LanguageApproval;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Active languages
 *
 * The four working languages carried over from the reference implementation.
 * English, Portuguese and French are SID's administrative languages. The SID
 * regional extension publishes church logos in Afrikaans, French, Portuguese,
 * Shona, Siswati, South Sotho, Tswana, Xhosa and Zulu — and in no other
 * language, which is why Spanish is not offered here.
 * ──────────────────────────────────────────────────────────────────────────── */

const ACTIVE: readonly LanguageDef[] = [
  {
    code: 'en',
    endonym: 'English',
    englishName: 'English',
    status: 'active',
    direction: 'ltr',
    wordmark: ['Seventh-day', 'Adventist Church'],
    registeredMarkAfter: 'Adventist',
    denominationShort: 'Adventist',
    administrativeForms: ['of Seventh-day Adventists', 'of the Seventh-day Adventist Church'],
    territories: ['BW', 'LS', 'MW', 'MU', 'NA', 'SC', 'ZA', 'SZ', 'ZM', 'ZW', 'SH'],
    approval: {
      verified: true,
      approvedBy: 'General Conference identity guidelines',
      approvedOn: '2017-04-01',
      note: 'The ® is required after “Adventist” in English.',
    },
  },
  {
    code: 'pt',
    endonym: 'Português',
    englishName: 'Portuguese',
    status: 'active',
    direction: 'ltr',
    wordmark: ['Igreja Adventista', 'do Sétimo Dia'],
    territories: ['AO', 'MZ', 'ST'],
    approval: {
      verified: true,
      approvedBy: 'General Conference identity guidelines',
      approvedOn: '2017-04-01',
    },
  },
  {
    code: 'fr',
    endonym: 'Français',
    englishName: 'French',
    status: 'active',
    direction: 'ltr',
    wordmark: ['Église Adventiste', 'du Septième Jour'],
    territories: ['MG', 'MU', 'RE', 'YT', 'KM', 'SC'],
    approval: {
      verified: true,
      approvedBy: 'General Conference identity guidelines',
      approvedOn: '2017-04-01',
    },
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Staged languages — the SID vernaculars awaiting activation
 *
 * All are `verified: false` until confirmed. Do not activate without approval.
 *
 * This list once held every language of the SID territory, each with wording
 * translated from "Seventh-day Adventist Church". Checking the seven against
 * SID's own published artwork showed that assumption to be wrong in every
 * single case: the vernacular logos do not translate the denomination's name,
 * they name the Sabbath — Zulu reads "iNkonzo ya ma Sabatha", not
 * "Isonto lamaSeventh-day Adventist".
 *
 * The artwork is kept in docs/reference/sid-church-logos/. Check any change to
 * these seven against it rather than against a translation.
 *
 * The unverifiable entries were therefore removed rather than left to be
 * promoted by mistake. SID publishes artwork in nine languages only; a
 * language absent from that set cannot be checked and does not belong here.
 * ──────────────────────────────────────────────────────────────────────────── */

const DRAFT: LanguageApproval = {
  verified: false,
  note: 'Working draft. Requires confirmation by the union communication director before activation.',
};

function staged(
  code: string,
  endonym: string,
  englishName: string,
  wordmark: readonly string[],
  territories: readonly string[],
): LanguageDef {
  return {
    code,
    endonym,
    englishName,
    status: 'staged',
    direction: 'ltr',
    wordmark,
    territories,
    approval: DRAFT,
  };
}

const STAGED: readonly LanguageDef[] = [
  // These seven are the vernaculars SID actually publishes artwork for, and
  // their wording is transcribed from that artwork rather than translated.
  // They stay staged only because the published logos mark the symbol with ™
  // where this tool draws ®; the wording itself is confirmed.
  //
  // ── South Africa Union Conference ────────────────────────────────────────
  staged('af', 'Afrikaans', 'Afrikaans', ['Sewende-dag', 'Adventiste Kerk'], ['ZA', 'NA']),
  staged('zu', 'isiZulu', 'Zulu', ['iNkonzo ya', 'ma Sabatha'], ['ZA', 'SZ']),
  staged('xh', 'isiXhosa', 'Xhosa', ['iBandla la', 'Ma-Sabatha'], ['ZA']),
  staged('st', 'Sesotho', 'Southern Sotho', ['Kereke', 'ea Sabata'], ['ZA', 'LS']),
  staged('tn', 'Setswana', 'Tswana', ['Kereke', 'ya Sabata'], ['ZA', 'BW']),
  staged('ss', 'siSwati', 'Swati', ['Libandla', 'lemaSabatha'], ['SZ', 'ZA']),

  // ── Zimbabwe (Central, East and West Union Conferences) ──────────────────
  staged('sn', 'chiShona', 'Shona', ['Sangano', 'remaSabata'], ['ZW']),
];

export const LANGUAGES: readonly LanguageDef[] = [...ACTIVE, ...STAGED];

const languageIndex = new Map(LANGUAGES.map((l) => [l.code, l]));

export const ACTIVE_LANGUAGES = LANGUAGES.filter((l) => l.status === 'active');
export const STAGED_LANGUAGES = LANGUAGES.filter((l) => l.status === 'staged');

export const DEFAULT_LANGUAGE_CODE = 'en';

export function getLanguage(code: string): LanguageDef | undefined {
  return languageIndex.get(code);
}

export function requireLanguage(code: string): LanguageDef {
  const found = languageIndex.get(code);
  if (found) return found;
  const fallback = languageIndex.get(DEFAULT_LANGUAGE_CODE);
  /* c8 ignore next */
  if (!fallback) throw new Error('Language registry is missing its default language.');
  return fallback;
}

/**
 * The denomination name on one line, for headings, filenames and alt text.
 * A line ending in a hyphen is a word broken across the two lines, so it joins
 * without a space: "Sewendedag-" + "Adventistekerk".
 */
export function wordmarkText(language: LanguageDef): string {
  return joinLines(language.wordmark);
}

/**
 * The denomination name as a single string, carrying the ® where the language
 * requires it.
 *
 * Use this wherever the denomination is composed into a longer line — the mark
 * is required after "Adventist" in English, so dropping it when the entity name
 * joins the denomination would produce artwork the guidelines forbid.
 */
export function wordmarkTextWithMark(language: LanguageDef): string {
  return joinLines(wordmarkLines(language));
}

/** A line ending in a hyphen is a broken word, so it joins without a space. */
function joinLines(lines: readonly string[]): string {
  return lines.reduce(
    (text, line, index) =>
      index === 0 ? line : text.endsWith('-') ? text + line : `${text} ${line}`,
    '',
  );
}

/**
 * The wordmark lines with the registered-trademark mark inserted.
 * Kept separate from the registry so the raw wording stays easy to review.
 */
export function wordmarkLines(language: LanguageDef): readonly string[] {
  const mark = language.registeredMarkAfter;
  if (!mark) return language.wordmark;
  return language.wordmark.map((line) =>
    line.includes(mark) ? line.replace(mark, `${mark}®`) : line,
  );
}
