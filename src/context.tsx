import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { detectDirection, readDocumentLocale } from './detect.js';
import type { Direction, LocaleContextValue, ResolvedLocale } from './types.js';

const LocaleContext = createContext<LocaleContextValue | null>(null);

export interface LocaleProviderProps {
  children: ReactNode;
  locale?: string;
  direction?: Direction;
  syncDocument?: boolean;
}

export function LocaleProvider({
  children,
  locale: localeProp,
  direction: directionProp,
  syncDocument = true,
}: LocaleProviderProps) {
  const seed = useMemo(() => readDocumentLocale(), []);

  const [locale, setLocalLocale] = useState<string>(localeProp ?? seed.locale);
  const [seenLocaleProp, setSeenLocaleProp] = useState<string | undefined>(localeProp);
  const [directionOverride, setDirectionOverride] = useState<Direction | null>(null);

  if (localeProp !== undefined && localeProp !== seenLocaleProp) {
    setSeenLocaleProp(localeProp);
    setLocalLocale(localeProp);
  }

  const direction = directionProp ?? directionOverride ?? detectDirection(locale);

  useEffect(() => {
    if (!syncDocument || typeof document === 'undefined') return;
    const root = document.documentElement;
    if (root.lang !== locale) root.lang = locale;
    if (root.dir !== direction) root.dir = direction;
  }, [syncDocument, locale, direction]);

  const setLocale = useCallback((next: string) => {
    setDirectionOverride(null);
    setLocalLocale(next);
  }, []);

  const setDirection = useCallback((next: Direction) => {
    setDirectionOverride(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      direction,
      isRTL: direction === 'rtl',
      setLocale,
      setDirection,
    }),
    [locale, direction, setLocale, setDirection],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext(): LocaleContextValue | null {
  return useContext(LocaleContext);
}

export function useResolvedLocale(): ResolvedLocale {
  const ctx = useLocaleContext();
  const fallback = useMemo(() => readDocumentLocale(), []);
  return ctx ? { locale: ctx.locale, direction: ctx.direction } : fallback;
}

export function useLocale(): LocaleContextValue {
  const ctx = useLocaleContext();
  if (!ctx) {
    throw new Error('useLocale() must be called inside a <LocaleProvider>.');
  }
  return ctx;
}
