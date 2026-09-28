# @tetraoscloud931-creator/react-rtl

Arabic-first RTL primitives for React: locale context, direction hooks, logical styles, and memoized `Intl` formatters.

Most RTL libraries stop at `dir="rtl"`. This one treats the locale as state — a single provider owns it, direction is derived from it, and every consumer reads from the same source instead of re-deriving `ar` → `rtl` in a dozen files.

- **One source of truth** — a `LocaleProvider` owns the locale; `dir` follows unless you override it
- **No duplicated script logic** — `detectDirection` uses `Intl.Locale#maximize`, so `az-Arab` is RTL and `ar-Latn` is LTR
- **Write `marginStart`, not `marginLeft`** — `toLogicalStyles` maps start/end shorthands onto the inline properties so one style object works in both directions
- **Memoized formatters** — `Intl.NumberFormat` is a surprisingly expensive constructor; these are built once per locale
- **SSR-safe** — no `document` access at import time
- **Zero runtime dependencies** — React is a peer

## Install

```bash
npm install @tetraoscloud931-creator/react-rtl
```

Published from [`tetraoscloud931-creator/react-rtl`](https://github.com/tetraoscloud931-creator/react-rtl) via GitHub Actions — no long-lived token involved.

## Quick start

```tsx
import { LocaleProvider, useIsRTL, useNumberFormat } from '@tetraoscloud931-creator/react-rtl';

function Price({ amount }: { amount: number }) {
  const money = useNumberFormat({ style: 'currency', currency: 'SAR' });
  return <span dir="auto">{money.format(amount)}</span>;
}

export function App() {
  return (
    <LocaleProvider locale="ar">
      <Price amount={1250} />
    </LocaleProvider>
  );
}
```

`LocaleProvider` sets `<html lang="ar" dir="rtl">` for you. Pass `syncDocument={false}` when you are inside a shell that already owns the document root.

## API

### `<LocaleProvider />`

| Prop | Type | Default | |
|---|---|---|---|
| `locale` | `string` | `<html lang>` or `'en'` | Seeds and re-syncs the active locale |
| `direction` | `'rtl' \| 'ltr'` | derived from `locale` | Overrides derivation |
| `syncDocument` | `boolean` | `true` | Mirror the locale onto `<html>` |

### Hooks

| Hook | Returns |
|---|---|
| `useLocale()` | `{ locale, direction, isRTL, setLocale, setDirection }` — throws outside a provider |
| `useDirection()` | `'rtl' \| 'ltr'` — provider, else the document root (reactive) |
| `useIsRTL()` | `boolean` |
| `useLocaleCode()` | `string` — the locale alone, for `Intl` |
| `useNumberFormat(options?)` | memoized `Intl.NumberFormat` |
| `useDateTimeFormat(options?)` | memoized `Intl.DateTimeFormat` |
| `useDocumentLocale()` | `{ locale, direction }` from `<html>`, live |

### Pure helpers

| | |
|---|---|
| `detectDirection(locale)` | `'rtl' \| 'ltr'` — never throws |
| `resolveLocale({ lang, dir })` | explicit `dir` wins, else derive from `lang` |
| `readDocumentLocale()` | SSR-safe read of `<html lang dir>` |
| `cx(...)` | class joiner: strings, arrays, `{ on: boolean }` |
| `toLogicalStyles(styles)` | maps `marginStart` / `paddingEnd` / `insetStart` / `borderStart*` onto the inline properties |
| `mirrorInRTL(style, dir)` | adds `scaleX(-1)` in RTL — for arrows, chevrons, back arrows |
| `flipTranslate(value, dir)` | negates a pixel offset in RTL |
| `translateForDirection(value, dir)` | that offset as a `translateX()` string |

## Logical styles

### `toLogicalStyles`

The shorthand pair you'd otherwise be tempted to get wrong:

```tsx
import { toLogicalStyles } from '@tetraoscloud931-creator/react-rtl';

const style = toLogicalStyles({
  marginStart: 16,      // → marginInlineStart
  marginEnd: 8,         // → marginInlineEnd
  paddingStart: '1rem', // → paddingInlineStart
  insetEnd: 'auto',     // → insetInlineEnd
  color: 'red',         // passed through untouched
});

// { marginInlineStart: 16, marginInlineEnd: 8,
//   paddingInlineStart: '1rem', insetInlineEnd: 'auto', color: 'red' }
```

Also covers `insetStart` / `insetEnd`, `borderStartWidth` / `borderEndWidth`, `borderStartColor` / `borderEndColor`, and `borderStartStyle` / `borderEndStyle`.

Ordinary properties pass straight through, and `undefined` values are dropped so spreading the result can't clear a style an ancestor set.

### `useMirror`

Icons that point somewhere have to point the other way in RTL. `useMirror` is bound to the provider's direction:

```tsx
import { useMirror } from '@tetraoscloud931-creator/react-rtl';

function BackIcon() {
  const mirror = useMirror();
  return <svg style={mirror({ transform: 'rotate(0deg)' })} d="M15 18l-6-6 6-6" />;
}
```

In `ar` that renders `rotate(0deg) scaleX(-1)`; in `en` the style comes back untouched.

### `flipTranslate` / `translateForDirection`

For animations that should move toward the reading direction:

```tsx
import { translateForDirection } from '@tetraoscloud931-creator/react-rtl';

const style = { transform: translateForDirection(12, direction) };
// ar → translateX(-12px)   en → translateX(12px)
```

## Behaviour worth knowing

**Direction follows the locale until you override it.**

```tsx
const { setLocale, setDirection } = useLocale();

setDirection('ltr');    // manual override
setLocale('he');        // override is cleared, direction re-derives to rtl
```

**`useDirection` works without a provider** — it falls back to the document root and subscribes to `lang`/`dir` changes via `MutationObserver`, so it stays correct even if something else mutates `<html>`.

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm test            # vitest
npm run build       # ESM + CJS + type declarations
npm run verify      # all three, in order
```

## License

MIT
