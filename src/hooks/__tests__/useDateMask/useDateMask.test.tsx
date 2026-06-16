import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { useDateMask } from 'use-digit-mask';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, getInput } from '../useMask/_helpers';

function DateInput({ format, initialValue = '' }: { format: string; initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  const { props } = useDateMask({ format, value, onChange: setValue });
  return <input {...props} data-testid="input" />;
}

describe('useDateMask — парсинг формата', () => {
  it('dd/MM/yyyy → маска ##/##/####', () => {
    render(<DateInput format="dd/MM/yyyy" />);
    fireChangeAt(getInput(), '01012025', 8);
    expect(getInput().value).toBe('01/01/2025');
  });

  it('MM/dd/yyyy (US формат)', () => {
    render(<DateInput format="MM/dd/yyyy" />);
    fireChangeAt(getInput(), '01312025', 8);
    expect(getInput().value).toBe('01/31/2025');
  });

  it('yyyy-MM-dd (ISO)', () => {
    render(<DateInput format="yyyy-MM-dd" />);
    fireChangeAt(getInput(), '20250131', 8);
    expect(getInput().value).toBe('2025-01-31');
  });

  it('dd.MM.yyyy HH:mm (дата + время)', () => {
    render(<DateInput format="dd.MM.yyyy HH:mm" />);
    fireChangeAt(getInput(), '010120251430', 12);
    expect(getInput().value).toBe('01.01.2025 14:30');
  });

  it('HH:mm (только время)', () => {
    render(<DateInput format="HH:mm" />);
    fireChangeAt(getInput(), '1430', 4);
    expect(getInput().value).toBe('14:30');
  });
});

describe('useDateMask — ограничение значений', () => {
  it('месяц > 12 ограничивается до 12', () => {
    render(<DateInput format="dd/MM/yyyy" />);
    fireChangeAt(getInput(), '0119', 4);
    expect(getInput().value).toBe('01/12/____');
  });

  it('первая цифра месяца не ограничивается — только при заполнении блока', () => {
    render(<DateInput format="dd/MM/yyyy" />);
    const input = getInput();
    fireChangeAt(input, '012', 3);
    expect(input.value).toBe('01/2_/____');
    fireChangeAt(input, '0120', 4);
    expect(input.value).toBe('01/12/____');
  });

  it('часы > 23 ограничиваются', () => {
    render(<DateInput format="HH:mm" />);
    fireChangeAt(getInput(), '2560', 4);
    expect(getInput().value).toBe('23:59');
  });

  it('минуты > 59 ограничиваются', () => {
    render(<DateInput format="HH:mm" />);
    fireChangeAt(getInput(), '1465', 4);
    expect(getInput().value).toBe('14:59');
  });
});

describe('useDateMask — февраль и високосный год', () => {
  it('при вводе первой цифры месяца день не ограничивается (месяц ещё не завершён)', () => {
    render(<DateInput format="dd/MM/yyyy" initialValue="31/01/____" />);
    fireChangeAt(getInput(), '312', 3);
    expect(getInput().value).toBe('31/2_/____');
  });

  it('день 31 ограничивается до 29 при смене месяца на февраль (год неизвестен)', () => {
    render(<DateInput format="dd/MM/yyyy" initialValue="31/01/____" />);
    fireChangeAt(getInput(), '31/02/____', 5);
    expect(getInput().value).toBe('29/02/____');
  });

  it('февраль невисокосного года — максимум 28', () => {
    render(<DateInput format="dd/MM/yyyy" initialValue="29/02/2023" />);
    fireChangeAt(getInput(), '29/02/2023', 10);
    expect(getInput().value).toBe('28/02/2023');
  });

  it('февраль високосного года — максимум 29', () => {
    render(<DateInput format="dd/MM/yyyy" initialValue="29/02/2024" />);
    fireChangeAt(getInput(), '29/02/2024', 10);
    expect(getInput().value).toBe('29/02/2024');
  });

  it('30 апреля допустимо, 31 апреля — нет', () => {
    render(<DateInput format="dd/MM/yyyy" />);
    fireChangeAt(getInput(), '31042025', 8);
    expect(getInput().value).toBe('30/04/2025');
  });

  it('bypassMask недоступен: переданный в runtime проп игнорируется, маска применяется как обычно', () => {
    function BypassDateInput() {
      const [value, setValue] = useState('');
      // @ts-expect-error bypassMask не входит в UseDateMaskProps (never)
      const { props } = useDateMask({ format: 'dd/MM/yyyy', value, onChange: setValue, bypassMask: true });
      return <input {...props} data-testid="input" />;
    }

    render(<BypassDateInput />);
    fireChangeAt(getInput(), '01012025', 8);
    expect(getInput().value).toBe('01/01/2025');
  });
});
