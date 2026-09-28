import { describe, expect, it } from 'vitest';

import { detectDirection, isDirection, resolveLocale } from './detect.js';

describe('detectDirection', () => {
  it.each(['ar', 'ar-EG', 'ar-SA', 'he', 'he-IL', 'fa', 'fa-IR', 'ur', 'ur-PK', 'ps', 'dv'])(
    'treats %s as rtl',
    (locale) => {
      expect(detectDirection(locale)).toBe('rtl');
    },
  );

  it.each(['en', 'en-US', 'en-GB', 'fr', 'de', 'tr', 'ru', 'es-MX', 'zh-CN'])(
    'treats %s as ltr',
    (locale) => {
      expect(detectDirection(locale)).toBe('ltr');
    },
  );

  it('lets an explicit script override the language', () => {
    expect(detectDirection('ar-Latn')).toBe('ltr');
  });

  it.each(['', '   ', 'not a locale', '!!'])('falls back to ltr for %j', (locale) => {
    expect(detectDirection(locale)).toBe('ltr');
  });
});

describe('isDirection', () => {
  it('accepts only rtl and ltr', () => {
    expect(isDirection('rtl')).toBe(true);
    expect(isDirection('ltr')).toBe(true);
    expect(isDirection('RTL')).toBe(false);
    expect(isDirection('auto')).toBe(false);
    expect(isDirection(undefined)).toBe(false);
  });
});

describe('resolveLocale', () => {
  it('derives direction from the language', () => {
    expect(resolveLocale({ lang: 'ar' })).toEqual({ locale: 'ar', direction: 'rtl' });
  });

  it('prefers an explicit dir attribute over the language', () => {
    expect(resolveLocale({ lang: 'ar', dir: 'ltr' })).toEqual({ locale: 'ar', direction: 'ltr' });
  });

  it('ignores a dir value that is not a direction', () => {
    expect(resolveLocale({ lang: 'ar', dir: 'sideways' })).toEqual({ locale: 'ar', direction: 'rtl' });
  });

  it('accepts a dir without a lang', () => {
    expect(resolveLocale({ dir: 'rtl' })).toEqual({ locale: 'en', direction: 'rtl' });
  });

  it.each([null, undefined, {}])('defaults to en/ltr for %j', (source) => {
    expect(resolveLocale(source)).toEqual({ locale: 'en', direction: 'ltr' });
  });
});
