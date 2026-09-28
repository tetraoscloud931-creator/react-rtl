import { act, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LocaleProvider, useLocale } from './context.js';
import { useDirection, useDocumentLocale, useIsRTL, useNumberFormat } from './hooks.js';

function wrapperWith(locale: string, syncDocument = false) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <LocaleProvider locale={locale} syncDocument={syncDocument}>
        {children}
      </LocaleProvider>
    );
  };
}

function Probe() {
  const { locale, direction } = useLocale();
  return <span data-testid="probe">{`${locale}:${direction}`}</span>;
}

beforeEach(() => {
  document.documentElement.lang = '';
  document.documentElement.dir = '';
});

afterEach(() => {
  document.documentElement.lang = '';
  document.documentElement.dir = '';
});

describe('LocaleProvider', () => {
  it('derives direction from the locale prop', () => {
    const { result } = renderHook(() => useLocale(), { wrapper: wrapperWith('ar') });

    expect(result.current.locale).toBe('ar');
    expect(result.current.direction).toBe('rtl');
    expect(result.current.isRTL).toBe(true);
  });

  it('honours an explicit direction prop over the language', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LocaleProvider locale="ar" direction="ltr" syncDocument={false}>
        {children}
      </LocaleProvider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.direction).toBe('ltr');
    expect(result.current.isRTL).toBe(false);
  });

  it('re-derives direction when the locale is switched', () => {
    const { result } = renderHook(() => useLocale(), { wrapper: wrapperWith('en') });
    expect(result.current.direction).toBe('ltr');

    act(() => result.current.setLocale('ar'));

    expect(result.current.locale).toBe('ar');
    expect(result.current.direction).toBe('rtl');
  });

  it('clears a manual direction override when the locale is switched', () => {
    const { result } = renderHook(() => useLocale(), { wrapper: wrapperWith('ar') });

    act(() => result.current.setDirection('ltr'));
    expect(result.current.direction).toBe('ltr');

    act(() => result.current.setLocale('he'));
    expect(result.current.direction).toBe('rtl');
  });

  it('lets setLocale win over a locale prop that has not changed', () => {
    const { result } = renderHook(() => useLocale(), { wrapper: wrapperWith('en') });

    act(() => result.current.setLocale('ar'));

    expect(result.current.locale).toBe('ar');
    expect(result.current.direction).toBe('rtl');
  });

  it('re-syncs when the locale prop itself changes', () => {
    const probe = (
      <LocaleProvider locale="en" syncDocument={false}>
        <Probe />
      </LocaleProvider>
    );

    const { rerender } = render(probe);
    expect(screen.getByTestId('probe').textContent).toBe('en:ltr');

    rerender(
      <LocaleProvider locale="ar" syncDocument={false}>
        <Probe />
      </LocaleProvider>,
    );

    expect(screen.getByTestId('probe').textContent).toBe('ar:rtl');
  });

  it('mirrors the locale onto the document by default', () => {
    renderHook(() => useLocale(), { wrapper: wrapperWith('ar', true) });

    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('leaves the document alone when syncDocument is off', () => {
    renderHook(() => useLocale(), { wrapper: wrapperWith('ar', false) });

    expect(document.documentElement.lang).toBe('');
    expect(document.documentElement.dir).toBe('');
  });

  it('throws a clear error when used outside a provider', () => {
    expect(() => renderHook(() => useLocale())).toThrow(/<LocaleProvider>/);
  });
});

describe('useDirection / useIsRTL', () => {
  it('reads from the provider when one is present', () => {
    const { result } = renderHook(() => ({ dir: useDirection(), rtl: useIsRTL() }), {
      wrapper: wrapperWith('ar'),
    });

    expect(result.current.dir).toBe('rtl');
    expect(result.current.rtl).toBe(true);
  });

  it('falls back to the document without a provider', () => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';

    const { result } = renderHook(() => useIsRTL());

    expect(result.current).toBe(true);
  });
});

describe('useDocumentLocale', () => {
  it('reacts to dir being set on the document root', async () => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';

    const { result } = renderHook(() => useDocumentLocale());
    expect(result.current.direction).toBe('ltr');

    await act(async () => {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    });

    expect(result.current.direction).toBe('rtl');
  });
});

describe('useNumberFormat', () => {
  it('builds a formatter for the provider locale', () => {
    const { result } = renderHook(() => useNumberFormat(), { wrapper: wrapperWith('ar-EG') });

    expect(result.current.resolvedOptions().locale).toBe('ar-EG');
  });

  it('keeps the same instance across rerenders', () => {
    const { result, rerender } = renderHook(() => useNumberFormat({ style: 'percent' }), {
      wrapper: wrapperWith('en'),
    });

    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });

  it('rebuilds when the options change', () => {
    const { result, rerender } = renderHook(
      ({ style }: { style: Intl.NumberFormatOptions['style'] }) => useNumberFormat({ style }),
      { wrapper: wrapperWith('en'), initialProps: { style: 'decimal' as const } },
    );

    expect(result.current.resolvedOptions().style).toBe('decimal');

    rerender({ style: 'percent' as const });

    expect(result.current.resolvedOptions().style).toBe('percent');
  });
});
