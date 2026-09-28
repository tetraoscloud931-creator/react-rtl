import { describe, expect, it } from 'vitest';

import { cx } from './cx.js';

describe('cx', () => {
  it('joins truthy string arguments', () => {
    expect(cx('card', 'card--active')).toBe('card card--active');
  });

  it('drops falsy values', () => {
    expect(cx('card', false, null, undefined, '')).toBe('card');
  });

  it('keeps zero, which is a legitimate class name', () => {
    expect(cx(0)).toBe('0');
  });

  it('flattens nested arrays', () => {
    expect(cx(['a', ['b', ['c']]])).toBe('a b c');
  });

  it('keeps only the enabled keys of a dictionary', () => {
    expect(cx({ base: true, active: false, muted: true, hidden: undefined })).toBe('base muted');
  });

  it('mixes strings, arrays and dictionaries', () => {
    expect(cx('root', ['a', null], { b: true, c: false }, undefined)).toBe('root a b');
  });

  it('returns an empty string with no usable input', () => {
    expect(cx()).toBe('');
    expect(cx(false, null, {})).toBe('');
  });
});
