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

    const { props, cc } = usePhoneMask({
        value,
        onChange: (next) => setValue(next),
    });

    return (
        <div>
            <input {...props} placeholder="Phone number" />
            <span>Country: {cc ?? '—'}</span>
        </div>
    );
}
```

### With react-hook-form

```tsx
import { useForm, useController } from 'react-hook-form';
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
| `rawWithoutPrefix` | `string` | Digits without prefix. |
| `formattedWithPrefix` | `string` | Full formatted value. |
| `formattedWithoutPrefix` | `string` | Formatted value without prefix. |
| `formattedWithoutPlaceholderChars` | `string` | Formatted value trimmed to last filled digit. |
| `isMaskCompleted` | `boolean` | All digit slots are filled. |

### `usePhoneMask(options)`

| Option | Type                                           | Default | Description |
|---|------------------------------------------------|---|---|
| `value` | `string`                                       | `undefined` | Controlled value. Omit for uncontrolled mode. |
| `defaultValue` | `string`                                       | `''` | Initial value for uncontrolled mode. |
| `onChange` | `(value: strig, parsed: ParsedValues) => void` | `undefined` | Change handler. |
| `placeholderChar` | `string`                                       | `_` | Placeholder character. |
| `dialPlans` | `DialPlan[]`                                   | built-in plans | Country dial plans for mask auto-detection. |
| `trimMaskTail` | `boolean`                                      | `false` | Trim unfilled tail. |

Returns `{ props, api, mask, cc, prefix, candidates, selectCandidate }`:

- **`props`** — same as `useMask`, spread onto `<input>`
- **`api`** — same as `useMask`
- **`mask`** — currently active mask string
- **`cc`** — detected country code digits (e.g. `'7'`) or `null`
- **`prefix`** — detected prefix (e.g. `'+7'`, `'8'`)
- **`candidates`** — `PhoneMaskCandidate[]` — alternative masks matching the current input (empty when only one match)
- **`selectCandidate(candidate)`** — manually select mask

### `PhoneMaskCandidate`
```ts
type PhoneMaskCandidate = {
  mask: string;         // full mask string, e.g. '+44 #### ######'
  cc: string;           // country code digits, e.g. '44'
  prefix: string;       // display prefix, e.g. '+44'
  prefixDigits: string; // digits extracted from prefix, e.g. '44'
  label?: string;       // human-readable label, e.g. 'UK'
};
```

### `PhoneMaskResult`

Returned by `selectPhoneMask`:
```ts
type PhoneMaskResult = {
  mask: string;
  cc: string | null;
  prefix: string;
  candidates: PhoneMaskCandidate[];
};
```

### `E164_MASK`

Fallback mask for unrecognized numbers: `'+###############'`.

### Country picker example
```tsx
function PhoneWithPicker() {
  const [value, setValue] = useState('');
  const { props, cc, candidates, selectCandidate } = usePhoneMask({
    value,
    onChange: (next) => setValue(next),
  });

  return (
    <div>
      {candidates.length > 0 && (
        <select
          value={cc ?? ''}
          onChange={(e) => {
            const candidate = candidates.find((c) => c.cc === e.target.value);
            if (candidate) selectCandidate(candidate);
          }}
        >
          {candidates.map((c) => (
            <option key={c.cc} value={c.cc}>
              {c.label ?? c.prefix}
            </option>
          ))}
        </select>
      )}

      <input {...props} />
    </div>
  );
}
```

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

### `selectPhoneMask(digits, plans?)`

Returns `PhoneMaskResult` for a given digit string — includes the best mask, detected country code, prefix, and a list of alternative candidates.

### `DialPlan`
```ts
type DialPlan = {
    cc: string;          // country code digits, e.g. '7'
    pattern: string;     // local pattern, e.g. '(###) ###-##-##'
    label?: string;      // human-readable label, e.g. 'Russia'
    altPrefixes?: {      // alternative prefixes, e.g. 8 for Russia
        cc: string;
        hasPlus: boolean;
    }[];
};
```

## License

ISC © Vyacheslav Nesterenko (Github: [FranzZZz1](https://github.com/FranzZZz1))
