import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { LocaleProvider } from './context.js';
import {
  flipTranslate,
  mirrorInRTL,
  toLogicalStyles,
  translateForDirection,
  useMirror,
} from './logical.js';

function wrapperWith(locale: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
  };
}

describe('toLogicalStyles', () => {
  it('maps start/end shorthands onto the inline properties', () => {
    expect(
      toLogicalStyles({
        marginStart: 8,
        marginEnd: 16,
        paddingStart: '1rem',
        paddingEnd: 0,
        insetStart: 4,
        insetEnd: 'auto',
      }),
    ).toEqual({
      marginInlineStart: 8,
      marginInlineEnd: 16,
      paddingInlineStart: '1rem',
      paddingInlineEnd: 0,
      insetInlineStart: 4,
      insetInlineEnd: 'auto',
    });
  });

  it('maps border shorthands', () => {
    expect(
      toLogicalStyles({
        borderStartWidth: 2,
        borderEndColor: 'red',
        borderStartStyle: 'solid',
        borderEndWidth: 'thin',
      }),
    ).toEqual({
      borderInlineStartWidth: 2,
      borderInlineEndColor: 'red',
      borderInlineStartStyle: 'solid',
      borderInlineEndWidth: 'thin',
    });
  });

  it('passes ordinary properties through untouched', () => {
    expect(toLogicalStyles({ color: 'red', display: 'flex' })).toEqual({
      color: 'red',
      display: 'flex',
    });
  });

  it('keeps already-logical properties rather than mangling them', () => {
    const input = { marginInlineStart: 8, marginStart: 2 };
    expect(toLogicalStyles(input)).toEqual({ marginInlineStart: 2 });
  });

  it('drops undefined values so spreading cannot clear an inherited style', () => {
    expect(toLogicalStyles({ marginStart: 8, marginEnd: undefined })).toEqual({
      marginInlineStart: 8,
    });
  });

  it('returns an empty object for no input', () => {
    expect(toLogicalStyles({})).toEqual({});
  });
});

describe('flipTranslate', () => {
  it('negates in rtl and preserves in ltr', () => {
    expect(flipTranslate(10, 'rtl')).toBe(-10);
    expect(flipTranslate(10, 'ltr')).toBe(10);
  });
});

describe('translateForDirection', () => {
  it('builds a px transform that faces the reading direction', () => {
    expect(translateForDirection(10, 'rtl')).toBe('translateX(-10px)');
    expect(translateForDirection(10, 'ltr')).toBe('translateX(10px)');
  });
});

describe('mirrorInRTL', () => {
  it('leaves ltr styles alone', () => {
    const style = { transform: 'translateX(4px)' };
    expect(mirrorInRTL(style, 'ltr')).toBe(style);
  });

  it('adds a mirror when there is no transform yet', () => {
    expect(mirrorInRTL({}, 'rtl')).toEqual({ transform: 'scaleX(-1)' });
  });

  it('composes after an existing transform', () => {
    expect(mirrorInRTL({ transform: 'rotate(90deg)' }, 'rtl')).toEqual({
      transform: 'rotate(90deg) scaleX(-1)',
    });
  });
});

describe('useMirror', () => {
  it('mirrors under an rtl provider', () => {
    const { result } = renderHook(() => useMirror(), { wrapper: wrapperWith('ar') });

    expect(result.current({})).toEqual({ transform: 'scaleX(-1)' });
  });

  it('does not mirror under an ltr provider', () => {
    const { result } = renderHook(() => useMirror(), { wrapper: wrapperWith('en') });

    expect(result.current({})).toEqual({});
  });
});
