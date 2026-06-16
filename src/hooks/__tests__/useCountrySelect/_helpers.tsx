import React from 'react';
import { type DialPlan, type PhoneMaskCandidate, useCountrySelect, type UseCountrySelectOptions } from 'use-digit-mask';

export const PLANS: DialPlan[] = [
  { id: 'US', cc: '1', pattern: '(###) ###-####', label: { en: 'United States', ru: 'США' } },
  { id: 'GB', cc: '44', pattern: '#### ######', label: { en: 'United Kingdom', ru: 'Великобритания' } },
  { id: 'RU', cc: '7', pattern: '(###) ###-##-##', label: { en: 'Russia', ru: 'Россия' } },
  { id: 'DE', cc: '49', pattern: '### #######', label: { en: 'Germany', ru: 'Германия' } },
  { id: 'FR', cc: '33', pattern: '# ## ## ## ##', label: { en: 'France', ru: 'Франция' } },
];

export function makeCandidate(id: string, cc: string): PhoneMaskCandidate {
  return { id, cc, mask: `+${cc}`, prefix: `+${cc}`, prefixDigits: cc };
}

export function CountrySelectTest({ props }: { props: UseCountrySelectOptions & { extraInputTestId?: string } }) {
  const { extraInputTestId, ...hookProps } = props;
  const hook = useCountrySelect(hookProps);

  return (
    <div>
      <div ref={hook.containerRef} data-testid="container">
        <button type="button" data-testid="trigger" onClick={hook.toggle}>
          Toggle
        </button>
        {hook.isOpen && (
          <>
            <input ref={hook.searchRef} readOnly data-testid="search" />
            <ul data-testid="dropdown">
              {hook.items.map((plan) => (
                <li key={plan.id ?? plan.cc}>
                  <button
                    type="button"
                    data-testid={`item-${plan.id ?? plan.cc}`}
                    onClick={() => {
                      hook.select(plan);
                    }}
                  >
                    {plan.label?.en}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div data-testid="outside">Outside</div>
      {extraInputTestId && (
        <input ref={hookProps.inputRef as React.RefObject<HTMLInputElement>} data-testid={extraInputTestId} />
      )}
    </div>
  );
}
