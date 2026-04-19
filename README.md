# use-digit-mask

Headless React hook for digit-only masked inputs — phone numbers, cards, dates, PINs and more.

Unlike traditional masking libraries, it gives you full control over UI while handling all the hard parts: formatting, caret positioning, and parsing.

- **Zero runtime dependencies** — only `react` as a peer
- **Headless** — bring your own UI (works with any design system)
- **SSR-safe** — no `window` access during render
- **Form-friendly** — works with react-hook-form, Formik, etc.
- **Smart caret** — never jumps into invalid positions
- **Dynamic masks** — switch masks on the fly
- **Phone masking built-in** — auto-detect country, E.164 fallback
- **Country selector hook** — headless `useCountrySelect` for building country dropdowns

## Install

```bash
npm install use-digit-mask
```

## Quick start

### Basic mask

```tsx
import { useState } from 'react';
import { useMask } from 'use-digit-mask';

function CardInput() {
  const [value, setValue] = useState('');

  const { props } = useMask({
    mask: '#### #### #### ####',
    value,
    onChange: (next) => setValue(next),
  });

  return <input {...props} placeholder="Card number" />;
}
```

### Phone mask with auto-detection

```tsx
import { useState } from 'react';
import { usePhoneMask } from 'use-digit-mask';

function PhoneInput() {
  const [value, setValue] = useState('');

  const { props, id, prefix } = usePhoneMask({
    value,
    onChange: (next) => setValue(next),
  });

  return (
    <div>
      <input {...props} placeholder="Phone number" />
      <span>{id ?? '—'} {prefix}</span>
    </div>
  );
}
```

### Phone with country selector

```tsx
import { useState } from 'react';
import { usePhoneMask, useCountrySelect } from 'use-digit-mask';

function PhoneWithCountry() {
  const [value, setValue] = useState('');

  const { props, id, candidates, allPlans, selectPlan } = usePhoneMask({
    value,
    onChange: (next) => setValue(next),
  });

  const { isOpen, toggle, items, dividerAfter, containerRef, searchRef,
          query, setQuery, currentPlan, select } = useCountrySelect({
    allPlans,
    currentId: id,
    onSelect: selectPlan,
    candidates,
    priorityIds: ['US', 'GB', 'RU'],
  });

  return (
    <div>
      <div ref={containerRef}>
        <button onClick={toggle}>
          {currentPlan ? `+${currentPlan.cc}` : '+'}
        </button>

        {isOpen && (
          <ul role="listbox">
            <li><input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} /></li>
            {items.map((plan, i) => (
              <>
                {i === dividerAfter && <li role="separator" />}
                <li key={plan.id} role="option" onClick={() => select(plan)}>
                  {plan.label} +{plan.cc}
                </li>
              </>
            ))}
          </ul>
        )}
      </div>

      <input {...props} />
    </div>
  );
}
```

### With react-hook-form

```tsx
import { useController } from 'react-hook-form';
import { useMask } from 'use-digit-mask';

function PhoneField({ control }) {
  const { field } = useController({ name: 'phone', control });

  const { props } = useMask({
    mask: '+7 (###) ###-##-##',
    value: field.value,
    allowedPrefixes: ['+7', '8'],
    onChange: field.onChange,
  });

  return <input {...props} />;
}
```

## API

### `useMask(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `mask` | `string` | — | Mask pattern. `#` = digit slot, everything else is a literal. |
| `value` | `string` | — | Controlled value. |
| `onChange` | `(value: string, parsed: ParsedValues) => void` | — | Called on every change with the formatted string and parsed data. |
| `allowedPrefixes` | `string[]` | `[]` | Prefixes that are recognized and stripped from raw digits. |
| `placeholderChar` | `string` | `_` | Character for unfilled slots. |
| `normalize` | `(digits) => string` | — | Transform extracted digits before applying to mask. |
| `activateOnFocus` | `boolean` | `false` | Show mask skeleton on focus even when empty. |
| `deactivateOnEmptyBlur` | `boolean` | `false` | Hide mask skeleton on blur when no digits entered. |
| `trimMaskTail` | `boolean` | `false` | Cut off unfilled tail instead of showing placeholders. |

Returns `{ props, api }`:

- **`props`** — spread onto `<input>`: `value`, `ref`, `onChange`, `onKeyDown`, `onPaste`, `onClick`, `onFocus`, `onBlur`, `onMouseDown`, `onCompositionStart`, `onCompositionEnd`
- **`api.getParsedValues()`** — returns `ParsedValues` on demand
- **`api.formatDigits(digits)`** — format a digit string through the mask

### `ParsedValues`

| Field | Type | Description |
|---|---|---|
| `prefix` | `string` | Detected prefix (e.g. `+7`). |
| `rawWithPrefix` | `string` | Digits with prefix. |
| `rawWithoutPrefix` | `string` | Subscriber digits without the country prefix. |
| `formattedWithPrefix` | `string` | Full formatted value. |
| `formattedWithoutPrefix` | `string` | Formatted value without prefix. |
| `formattedWithoutPlaceholderChars` | `string` | Formatted value trimmed to last filled digit. |
| `isMaskCompleted` | `boolean` | All digit slots are filled. |

### `usePhoneMask(options)`

| Option | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | `undefined` | Controlled value. Omit for uncontrolled mode. |
| `defaultValue` | `string` | `''` | Initial value for uncontrolled mode. |
| `onChange` | `(value: string, parsed: ParsedValues) => void` | `undefined` | Change handler. |
| `placeholderChar` | `string` | `_` | Placeholder character. |
| `dialPlans` | `DialPlan[]` | built-in plans | Country dial plans for mask auto-detection. |
| `trimMaskTail` | `boolean` | `false` | Trim unfilled tail. |

Returns `{ props, api, mask, cc, id, prefix, candidates, allPlans, selectCandidate, selectPlan }`:

| Return | Type | Description |
|---|---|---|
| `props` | `object` | Spread onto `<input>`. |
| `api` | `object` | `formatDigits`, `getParsedValues`. |
| `mask` | `string` | Currently active mask string. |
| `cc` | `string \| null` | Country code digits (e.g. `'7'`). |
| `id` | `string \| null` | ISO 3166-1 alpha-2 country id (e.g. `'RU'`). |
| `prefix` | `string` | Active prefix (e.g. `'+7'`, `'8'`). |
| `candidates` | `PhoneMaskCandidate[]` | Ambiguous matches — non-empty only when multiple plans share the same prefix (e.g. `+7` → Russia / Kazakhstan). |
| `allPlans` | `DialPlan[]` | Full list of dial plans (pass to `useCountrySelect`). |
| `selectCandidate(c)` | `function` | Switch to a specific candidate (same prefix, different country). |
| `selectPlan(plan)` | `function` | Switch to any dial plan by its `DialPlan` object. |

### `useCountrySelect(options)`

Headless hook for building a country-selector dropdown. Handles sorting, search filtering, open/close state, outside-click, Escape key, and auto-focus.

| Option | Type | Default | Description |
|---|---|---|---|
| `allPlans` | `DialPlan[]` | — | Full list of plans. Pass `allPlans` from `usePhoneMask`. |
| `currentId` | `string \| null` | — | ISO id of the active plan. Pass `id` from `usePhoneMask`. |
| `onSelect` | `(plan: DialPlan) => void` | — | Called when user picks a country. Wire to `selectPlan`. |
| `candidates` | `PhoneMaskCandidate[]` | `undefined` | Ambiguous candidates from `usePhoneMask`. Float to top while typing. |
| `priorityIds` | `string[]` | `undefined` | ISO ids pinned at the top when input is empty (e.g. `['US', 'GB', 'RU']`). |
| `stickyPins` | `boolean` | `false` | When `true`, `priorityIds` stay pinned regardless of typing. Candidates float below the divider instead of displacing pins. |

Returns `{ isOpen, toggle, close, query, setQuery, currentPlan, items, dividerAfter, containerRef, searchRef, select }`:

| Return | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Whether the dropdown is open. |
| `toggle` | `() => void` | Toggle open/closed. Attach to trigger button `onClick`. |
| `close` | `() => void` | Close and clear search. |
| `query` | `string` | Current search string. |
| `setQuery` | `(q: string) => void` | Update search. Attach to search input `onChange`. |
| `currentPlan` | `DialPlan \| undefined` | The currently active plan object. |
| `items` | `DialPlan[]` | Sorted + filtered list to render. |
| `dividerAfter` | `number` | Insert a visual divider before `items[dividerAfter]`. `-1` = no divider. |
| `containerRef` | `RefObject` | Attach to root container for outside-click detection. |
| `searchRef` | `RefObject` | Attach to search `<input>` — auto-focused on open. |
| `select` | `(plan: DialPlan) => void` | Select a plan, calls `onSelect` and closes. |

**Sorting rules for `items`:**

- **`stickyPins: false` (default)**:
  - Empty input → `priorityIds` at top, divider, rest
  - Typing → candidates (multiple ambiguous matches) at top, divider, rest; `priorityIds` ignored
  - Single resolved country → natural order, no grouping

- **`stickyPins: true`**:
  - Always → `priorityIds` pinned, divider, then candidates not in pins, then rest

- **Search active** → filtered by label or dial code, no reordering

### `PhoneMaskCandidate`

```ts
type PhoneMaskCandidate = {
  id: string;           // ISO 3166-1 alpha-2, e.g. 'RU'
  mask: string;         // full mask string, e.g. '+7 (###) ###-##-##'
  cc: string;           // country code digits, e.g. '7'
  prefix: string;       // display prefix, e.g. '+7'
  prefixDigits: string; // digits extracted from prefix, e.g. '7'
  label?: string;       // human-readable label, e.g. 'Russia'
};
```

### `DialPlan`

```ts
type DialPlan = {
  id?: string;           // ISO 3166-1 alpha-2, e.g. 'RU' (defaults to cc)
  cc: string;            // country code digits, e.g. '7'
  pattern: string;       // local pattern, e.g. '(###) ###-##-##'
  label?: string;        // human-readable label, e.g. 'Russia'
  hasPlus?: boolean;     // prepend '+' to cc in the main prefix (default: true)
  altPrefixes?: string[]; // alternative dialing prefixes, e.g. ['8'] for Russia
};
```

**`hasPlus`** controls the display prefix of the plan's main candidate:
- `hasPlus: true` (default) → prefix `+7`, mask `+# (###) ###-##-##`
- `hasPlus: false` → prefix `7`, mask `# (###) ###-##-##`

**`altPrefixes`** lists additional prefix strings users may dial with. A leading `+` means the prefix includes a plus sign; no `+` means without:

```ts
// Russia — can be dialled as +7 or 8
{ cc: '7', pattern: '(###) ###-##-##', altPrefixes: ['8'] }
```

### `selectPhoneMask(digits, plans?)`

Low-level utility. Returns `PhoneMaskResult` for a digit string — best mask, country code, prefix, and ambiguous candidates.

```ts
type PhoneMaskResult = {
  mask: string;
  cc: string | null;
  id: string | null;
  prefix: string;
  candidates: PhoneMaskCandidate[]; // empty when match is unambiguous
};
```

### `E164_MASK`

Fallback mask for unrecognized numbers: `'+###############'`.

### Uncontrolled mode

```tsx
function UncontrolledPhone() {
  const { props } = usePhoneMask({
    defaultValue: '+7',
    onChange: (_, parsed) => console.log(parsed.rawWithoutPrefix),
  });

  return <input {...props} />;
}
```

## License

ISC © Vyacheslav Nesterenko (Github: [FranzZZz1](https://github.com/FranzZZz1))
