# use-digit-mask

[![npm version](https://img.shields.io/npm/v/use-digit-mask)](https://www.npmjs.com/package/use-digit-mask)
[![npm downloads](https://img.shields.io/npm/dm/use-digit-mask)](https://www.npmjs.com/package/use-digit-mask)
[![bundle size](https://img.shields.io/bundlephobia/minzip/use-digit-mask)](https://bundlephobia.com/package/use-digit-mask)
[![license](https://img.shields.io/npm/l/use-digit-mask)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue)](https://www.typescriptlang.org/)

Headless React hooks for digit-only masked inputs — phone numbers, cards, dates, PINs and more.

Unlike traditional masking libraries, it gives you full control over UI while handling all the hard parts: formatting, caret positioning, and parsing.

- **Zero runtime dependencies** — only `react` as a peer
- **Headless** — bring your own UI (works with any design system)
- **SSR-safe** — no `window` access during render
- **Form-friendly** — works with react-hook-form, Formik, etc.
- **Smart caret** — never jumps into invalid positions
- **Dynamic masks** — switch masks on the fly
- **Undo / redo history** — Ctrl+Z / Ctrl+Y out of the box, configurable depth
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

  const {
    isOpen, toggle, items, dividerAfter,
    containerRef, searchRef,
    query, setQuery, currentPlan, select,
  } = useCountrySelect({
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

### Undo / redo

`useMask` keeps an edit history. `Ctrl+Z` / `Ctrl+Y` (and `Cmd+Z` / `Cmd+Shift+Z` on Mac) work
out of the box. You can also call `api.undo()` / `api.redo()` programmatically and check
`api.canUndo` / `api.canRedo` to enable/disable custom buttons.

```tsx
import { useState } from 'react';
import { useMask } from 'use-digit-mask';

function CardInput() {
  const [value, setValue] = useState('');

  const { props, api } = useMask({
    mask: '#### #### #### ####',
    value,
    onChange: (next) => setValue(next),
    historyLimit: 50, // default: 100
  });

  return (
    <div>
      <input {...props} />
      <button onClick={api.undo} disabled={!api.canUndo}>Undo</button>
      <button onClick={api.redo} disabled={!api.canRedo}>Redo</button>
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

## Full API docs

**[→ franzzzz1.github.io/use-digit-mask](https://franzzzz1.github.io/use-digit-mask/#/docs)**

The live demo includes interactive examples and complete API reference for all three hooks:
`useMask` · `usePhoneMask` · `useCountrySelect`

## License

ISC © Vyacheslav Nesterenko (GitHub: [FranzZZz1](https://github.com/FranzZZz1))
