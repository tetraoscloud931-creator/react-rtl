import { useCallback } from 'react';
import type { CSSProperties } from 'react';

import { useDirection } from './hooks.js';
import type { Direction } from './types.js';

type Length = CSSProperties['marginInlineStart'];
type Color = CSSProperties['borderInlineStartColor'];
type LineStyle = CSSProperties['borderInlineStartStyle'];

export interface LogicalStyleInput {
  marginStart?: Length;
  marginEnd?: Length;
  paddingStart?: Length;
  paddingEnd?: Length;
  insetStart?: Length;
  insetEnd?: Length;
  borderStartWidth?: Length;
  borderEndWidth?: Length;
  borderStartColor?: Color;
  borderEndColor?: Color;
  borderStartStyle?: LineStyle;
  borderEndStyle?: LineStyle;
}

const LOGICAL_TARGETS = {
  marginStart: 'marginInlineStart',
  marginEnd: 'marginInlineEnd',
  paddingStart: 'paddingInlineStart',
  paddingEnd: 'paddingInlineEnd',
  insetStart: 'insetInlineStart',
  insetEnd: 'insetInlineEnd',
  borderStartWidth: 'borderInlineStartWidth',
  borderEndWidth: 'borderInlineEndWidth',
  borderStartColor: 'borderInlineStartColor',
  borderEndColor: 'borderInlineEndColor',
  borderStartStyle: 'borderInlineStartStyle',
  borderEndStyle: 'borderInlineEndStyle',
} as const satisfies Record<keyof LogicalStyleInput, keyof CSSProperties>;

export function toLogicalStyles(
  input: LogicalStyleInput & CSSProperties,
): CSSProperties {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    const target = LOGICAL_TARGETS[key as keyof typeof LOGICAL_TARGETS];
    out[target ?? key] = value;
  }

  return out as CSSProperties;
}

export function flipTranslate(value: number, direction: Direction): number {
  return direction === 'rtl' ? -value : value;
}

export function translateForDirection(value: number, direction: Direction): string {
  return `translateX(${flipTranslate(value, direction)}px)`;
}

export function mirrorInRTL(style: CSSProperties, direction: Direction): CSSProperties {
  if (direction !== 'rtl') return style;

  const existing = style.transform;
  if (existing === undefined) {
    return { ...style, transform: 'scaleX(-1)' };
  }

  return { ...style, transform: `${existing} scaleX(-1)` };
}

export function useMirror(): (style: CSSProperties) => CSSProperties {
  const direction = useDirection();
  return useCallback((style) => mirrorInRTL(style, direction), [direction]);
}
