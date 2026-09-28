export type Direction = 'rtl' | 'ltr';

export interface LocaleContextValue {
  locale: string;
  direction: Direction;
  isRTL: boolean;
  setLocale: (locale: string) => void;
  setDirection: (direction: Direction) => void;
}

export interface DocumentLocaleSource {
  lang?: string | null;
  dir?: string | null;
}

export interface ResolvedLocale {
  locale: string;
  direction: Direction;
}
