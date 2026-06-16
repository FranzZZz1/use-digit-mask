import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { useDateMask } from 'use-digit-mask';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, getInput } from '../useMask/_helpers';

function DateInput({
  format,
  initialValue = '',
  min = undefined,
  max = undefined,
}: {
  format: string;
  initialValue?: string;
  min?: Date | string;
  max?: Date | string;
}) {
  const [value, setValue] = useState(initialValue);
  const { props } = useDateMask({ format, min, max, value, onChange: setValue });
  return <input {...props} data-testid="input" />;
}

describe('useDateMask — max: Date (не в будущем)', () => {
  const today = new Date(2025, 5, 15);

  it('год ограничен до текущего', () => {
    render(<DateInput format="dd/MM/yyyy" max={today} />);
    fireChangeAt(getInput(), '01019999', 8);
    expect(getInput().value).toBe('01/01/2025');
  });

  it('при текущем году месяц ограничен до текущего', () => {
    render(<DateInput format="dd/MM/yyyy" max={today} />);
    fireChangeAt(getInput(), '01992025', 8);
    expect(getInput().value).toBe('01/06/2025');
  });

  it('при текущем год+месяц день ограничен', () => {
    render(<DateInput format="dd/MM/yyyy" max={today} />);
    fireChangeAt(getInput(), '31062025', 8);
    expect(getInput().value).toBe('15/06/2025');
  });

  it('будущий месяц в текущем году не ограничивает день', () => {
    render(<DateInput format="dd/MM/yyyy" max={today} />);
    fireChangeAt(getInput(), '31052025', 8);
    expect(getInput().value).toBe('31/05/2025');
  });
});

describe('useDateMask — min: Date (не раньше даты)', () => {
  const minDate = new Date(2000, 0, 1);

  it('год ограничен снизу', () => {
    render(<DateInput format="dd/MM/yyyy" min={minDate} />);
    fireChangeAt(getInput(), '01011999', 8);
    expect(getInput().value).toBe('01/01/2000');
  });
});

describe('useDateMask — min: string (кросс-поле, время)', () => {
  it('часы end не раньше часов start', () => {
    render(<DateInput format="HH:mm" min="14:30" />);
    fireChangeAt(getInput(), '0900', 4);
    expect(getInput().value).toBe('14:30');
  });

  it('при совпадении часа минуты ограничены снизу', () => {
    render(<DateInput format="HH:mm" min="14:30" />);
    fireChangeAt(getInput(), '1410', 4);
    expect(getInput().value).toBe('14:30');
  });

  it('при другом часе (> min) минуты свободны', () => {
    render(<DateInput format="HH:mm" min="14:30" />);
    fireChangeAt(getInput(), '1510', 4);
    expect(getInput().value).toBe('15:10');
  });

  it('неполный min-string — только полные токены участвуют', () => {
    render(<DateInput format="HH:mm" min="14:__" />);
    fireChangeAt(getInput(), '1410', 4);
    expect(getInput().value).toBe('14:10');
  });
});

describe('useDateMask — max: string', () => {
  it('max как строка: часы не превышают', () => {
    render(<DateInput format="HH:mm" max="18:00" />);
    fireChangeAt(getInput(), '2300', 4);
    expect(getInput().value).toBe('18:00');
  });
});
