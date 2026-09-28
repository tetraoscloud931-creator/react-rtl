import type { Direction, DocumentLocaleSource, ResolvedLocale } from './types.js';

const RTL_LANGUAGES = new Set([
  'ar',
  'ckb',
  'dv',
  'fa',
  'he',
  'ku',
  'ps',
  'sd',
  'ug',
  'ur',
  'yi',
]);

const RTL_SCRIPTS = /^(Arab|Hebr|Thaa|Nkoo|Adlm|Syrc|Samr|Mend|Hatr)$/;

const DEFAULT_LOCALE = 'en';

export function isDirection(value: unknown): value is Direction {
  return value === 'rtl' || value === 'ltr';
}

export function detectDirection(locale: string): Direction {
  if (!locale) return 'ltr';

  try {
    const maximized = new Intl.Locale(locale).maximize();
    const language = maximized.language.toLowerCase();
    const script = maximized.script;

    if (script) return RTL_SCRIPTS.test(script) ? 'rtl' : 'ltr';
    return RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr';
  } catch {
    return 'ltr';
  }
}

export function resolveLocale(source: DocumentLocaleSource | null | undefined): ResolvedLocale {
  const lang = source?.lang?.trim();
  const dir = source?.dir?.trim().toLowerCase();

  if (isDirection(dir)) {
    return { locale: lang || DEFAULT_LOCALE, direction: dir };
  }

  if (lang) {
    return { locale: lang, direction: detectDirection(lang) };
  }

  return { locale: DEFAULT_LOCALE, direction: 'ltr' };
}

export function readDocumentLocale(): ResolvedLocale {
  if (typeof document === 'undefined') {
    return { locale: DEFAULT_LOCALE, direction: 'ltr' };
  }

  const root = document.documentElement;
  return resolveLocale({ lang: root.lang, dir: root.dir });
}
