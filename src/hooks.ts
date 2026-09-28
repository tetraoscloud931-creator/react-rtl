import { useMemo, useSyncExternalStore } from 'react';

import { readDocumentLocale } from './detect.js';
import { useLocaleContext, useResolvedLocale } from './context.js';
import type { Direction } from './types.js';

function subscribeToDocumentLocale(onChange: () => void): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => {};
  }

  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang', 'dir'],
  });

  return () => observer.disconnect();
}

function getDocumentSnapshot(): string {
  if (typeof document === 'undefined') return 'en:ltr';
  const { locale, direction } = readDocumentLocale();
  return `${locale}:${direction}`;
}

export function useDocumentLocale(): { locale: string; direction: Direction } {
  const snapshot = useSyncExternalStore(subscribeToDocumentLocale, getDocumentSnapshot, () => 'en:ltr');
  const [locale, direction] = snapshot.split(':');
  return { locale: locale ?? 'en', direction: direction === 'rtl' ? 'rtl' : 'ltr' };
}

export function useDirection(): Direction {
  const ctx = useLocaleContext();
  const fromDocument = useDocumentLocale();
  return ctx ? ctx.direction : fromDocument.direction;
}

export function useIsRTL(): boolean {
  return useDirection() === 'rtl';
}

export function useLocaleCode(): string {
  return useResolvedLocale().locale;
}

function stableKey(value: unknown): string {
  return value === undefined ? '' : JSON.stringify(value);
}

export function useNumberFormat(options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const locale = useLocaleCode();
  const key = stableKey(options);
  return useMemo(
    () => new Intl.NumberFormat(locale, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, key],
  );
}

export function useDateTimeFormat(options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const locale = useLocaleCode();
  const key = stableKey(options);
  return useMemo(
    () => new Intl.DateTimeFormat(locale, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, key],
  );
}
