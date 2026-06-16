import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, getInput, TestInput } from './_helpers';

describe('blocks — статические ограничения', () => {
  it('первая цифра не ограничивается — только полное значение блока', () => {
    render(
      <TestInput
        mask="##:##"
        blocks={[
          { min: 0, max: 23 },
          { min: 0, max: 59 },
        ]}
      />,
    );
    const input = getInput();
    fireChangeAt(input, '3', 1);
    expect(input.value).toBe('3_:__');
    fireChangeAt(input, '30', 2);
    expect(input.value).toBe('23:__');
  });

  it('ограничивает полное значение блока', () => {
    render(
      <TestInput
        mask="##:##"
        blocks={[
          { min: 0, max: 23 },
          { min: 0, max: 59 },
        ]}
      />,
    );
    const input = getInput();
    fireChangeAt(input, '25', 2);
    expect(input.value).toBe('23:__');
  });

  it('ограничивает снизу (min)', () => {
    render(
      <TestInput
        mask="##/##"
        blocks={[
          { min: 1, max: 31 },
          { min: 1, max: 12 },
        ]}
      />,
    );
    const input = getInput();
    fireChangeAt(input, '00', 2);
    expect(input.value).toBe('01/__');
  });

  it('не ограничивает неполный блок по full-value', () => {
    render(<TestInput mask="##:##" blocks={[{ min: 0, max: 23 }]} />);
    const input = getInput();
    fireChangeAt(input, '2', 1);
    expect(input.value).toBe('2_:__');
  });

  it('null-блок не применяет ограничений', () => {
    render(<TestInput mask="##/##" blocks={[null, { min: 1, max: 12 }]} />);
    const input = getInput();
    fireChangeAt(input, '9999', 4);
    expect(input.value).toBe('99/12');
  });
});

describe('blocks — функциональные блоки (кросс-блочные)', () => {
  it('функция получает значения всех блоков', () => {
    const blocks = [(values: string[]) => ({ min: 1, max: parseInt(values[1] || '9', 10) }), { min: 1, max: 9 }];
    render(<TestInput mask="##-#" blocks={blocks} />);
    const input = getInput();
    fireChangeAt(input, '053', 3);
    expect(input.value).toBe('03-3');
  });

  it('пересчитывает ограничение при изменении другого блока', () => {
    const blocks = [
      { min: 0, max: 23 },
      (values: string[]) => ({
        min: 0,
        max: parseInt(values[0], 10) === 0 ? 30 : 59,
      }),
    ];
    render(<TestInput mask="##:##" blocks={blocks} />);
    const input = getInput();
    fireChangeAt(input, '0059', 4);
    expect(input.value).toBe('00:30');
  });
});
