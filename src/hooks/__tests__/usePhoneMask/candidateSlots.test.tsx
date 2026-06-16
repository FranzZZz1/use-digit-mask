import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { type DialPlan, type ParsedValues, usePhoneMask } from 'use-digit-mask';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, getInput } from './_helpers';

const LONG_PLAN: DialPlan = { cc: '9', id: 'long', pattern: '##########' };
const SHORT_PLAN: DialPlan = { cc: '9', id: 'short', pattern: '##' };
const CUSTOM_PLANS: DialPlan[] = [LONG_PLAN, SHORT_PLAN];

function CustomCandidatePhone({ onChangeSpy }: { onChangeSpy: (value: string, parsed: ParsedValues) => void }) {
  const [value, setValue] = useState('');
  const { props, candidates, selectCandidate } = usePhoneMask({
    value,
    dialPlans: CUSTOM_PLANS,
    onChange(next: string, parsed: ParsedValues) {
      setValue(next);
      onChangeSpy(next, parsed);
    },
  });
  return (
    <div>
      <input {...props} data-testid="phone" type="tel" />
      {candidates.map((c) => (
        <button
          key={c.id}
          data-testid={`candidate-${c.id}`}
          type="button"
          onClick={() => {
            selectCandidate(c);
          }}
        >
          {c.id}
        </button>
      ))}
    </div>
  );
}

describe('usePhoneMask - переключение на кандидата с маской короче текущего тела', () => {
  it('formattedWithoutPlaceholderChars не сжимается до prefix, а отражает введённые цифры', () => {
    let lastParsed: ParsedValues | null = null;
    render(
      <CustomCandidatePhone
        onChangeSpy={(_, p) => {
          lastParsed = p;
        }}
      />,
    );
    const input = getInput();

    fireChangeAt(input, '91234567890', 11);
    expect(input.value).toBe('+9 1234567890');

    fireEvent.click(screen.getByTestId('candidate-short'));
    expect(getInput().value).toBe('+9 12');
    expect(lastParsed!.formattedWithoutPlaceholderChars).toBe('+9 12');
  });
});
