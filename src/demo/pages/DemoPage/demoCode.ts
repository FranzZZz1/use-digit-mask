// Code snippets displayed in the modal code panel for each demo card.
// Keep examples minimal and focused — show only what's needed to reproduce the demo.

export const CODE_PHONE_RU = `\
import { useState } from 'react';
import { useMask } from 'use-digit-mask';

function PhoneRU() {
  const [value, setValue] = useState('');

  const { props } = useMask({
    mask: '+7 (###) ###-##-##',
    // also accepts '8' as a prefix without the '+'
    allowedPrefixes: ['+7', '8'],
    activateOnFocus: true,
    deactivateOnEmptyBlur: true,
    value,
    onChange: setValue,
  });

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="+7 (___) ___-__-__"
    />
  );
}`;

export const CODE_CREDIT_CARD = `\
import { useState } from 'react';
import { useMask } from 'use-digit-mask';

function CreditCard() {
  const [value, setValue] = useState('');

  const { props } = useMask({
    mask: '#### #### #### ####',
    value,
    onChange: setValue,
  });

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="#### #### #### ####"
    />
  );
}`;

export const CODE_DATE = `\
import { useState } from 'react';
import { useMask } from 'use-digit-mask';

function DateField() {
  const [value, setValue] = useState('');

  const { props } = useMask({
    mask: '##/##/####',
    value,
    onChange: setValue,
  });

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="MM/DD/YYYY"
    />
  );
}`;

export const CODE_PIN = `\
import { useState } from 'react';
import { useMask } from 'use-digit-mask';

function PinField() {
  const [value, setValue] = useState('');

  const { props } = useMask({
    mask: '####',
    // trimMaskTail hides placeholder chars until the user reaches that slot
    trimMaskTail: true,
    value,
    onChange: setValue,
  });

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="PIN"
    />
  );
}`;

export const CODE_PHONE_AUTO = `\
import { useState } from 'react';
import { usePhoneMask } from 'use-digit-mask';

function PhoneField() {
  const [value, setValue] = useState('');

  const {
    props,
    candidates,
    selectCandidate,
  } = usePhoneMask({
    value,
    onChange: (next) => setValue(next),
    trimMaskTail: true,
  });

  return (
    <div>
      <input {...props} type="text" inputMode="numeric" />

      {/* Shown when prefix is ambiguous, e.g. +7 → Russia / Kazakhstan */}
      {candidates.length > 1 && (
        <div>
          {candidates.map((c) => (
            <button key={c.id} onClick={() => selectCandidate(c)}>
              {c.label} {c.prefix}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}`;

export const CODE_PHONE_COUNTRY_SELECT = `\
import { useState } from 'react';
import { usePhoneMask, useCountrySelect } from 'use-digit-mask';

function PhoneWithCountry() {
  const [value, setValue] = useState('');

  const { props, id, allPlans, selectPlan, candidates } = usePhoneMask({
    value,
    onChange: (next) => setValue(next),
    trimMaskTail: true,
  });

  const {
    isOpen, toggle,
    query, setQuery,
    items, dividerAfter,
    containerRef, searchRef,
    select, currentPlan,
  } = useCountrySelect({
    allPlans,
    currentId: id,
    onSelect: selectPlan,
    // Typing +7 → Russia & Kazakhstan bubble to the top
    candidates,
    // Pinned at the top when input is empty
    priorityIds: ['US', 'GB', 'RU'],
  });

  return (
    <div style={{ display: 'flex' }}>

      {/* Country trigger + dropdown */}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <button onClick={toggle}>
          {currentPlan ? \`+\${currentPlan.cc}\` : '+'}
        </button>

        {isOpen && (
          <div role="listbox">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
            />

            {items.map((plan, i) => (
              <div key={plan.id}>
                {/* Visual divider between pinned group and the rest */}
                {i === dividerAfter && <hr />}
                <div role="option" onClick={() => select(plan)}>
                  {plan.label} +{plan.cc}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phone input */}
      <input {...props} type="text" inputMode="numeric" />
    </div>
  );
}`;
