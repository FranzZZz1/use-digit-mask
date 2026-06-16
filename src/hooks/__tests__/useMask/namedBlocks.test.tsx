import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, getInput, TestInput } from './_helpers';

describe('named blocks — разрешение маски', () => {
  it('ключи blocks заменяются на ## соответствующей длины', () => {
    render(
      <TestInput
        mask="DD/MM/YYYY"
        blocks={{
          DD: { min: 1, max: 31 },
          MM: { min: 1, max: 12 },
          YYYY: { min: 1, max: 9999 },
        }}
      />,
    );
    const input = getInput();
    fireChangeAt(input, '01012025', 8);
    expect(input.value).toBe('01/01/2025');
  });

  it('токен отсутствующий в blocks остаётся литералом', () => {
    render(<TestInput mask="DD:MM" blocks={{ MM: { min: 1, max: 12 } }} />);
    const input = getInput();
    fireChangeAt(input, '05', 2);
    expect(input.value).toBe('DD:05');
  });

  it('ограничение значений работает', () => {
    render(
      <TestInput
        mask="HH:mm"
        blocks={{
          HH: { min: 0, max: 23 },
          mm: { min: 0, max: 59 },
        }}
      />,
    );
    const input = getInput();
    fireChangeAt(input, '2565', 4);
    expect(input.value).toBe('23:59');
  });
});

describe('named blocks — кросс-блочные функции', () => {
  it('функция блока получает именованные значения других блоков', () => {
    function febMax(MM: string, YYYY: string): number {
      if (parseInt(MM, 10) !== 2) return 31;
      return parseInt(YYYY, 10) % 4 === 0 ? 29 : 28;
    }
    render(
      <TestInput
        mask="DD/MM/YYYY"
        blocks={{
          DD: ({ MM, YYYY }: Record<string, string>) => ({
            min: 1,
            max: febMax(MM, YYYY),
          }),
          MM: { min: 1, max: 12 },
          YYYY: { min: 1, max: 9999 },
        }}
      />,
    );
    const input = getInput();
    fireChangeAt(input, '31022024', 8);
    expect(input.value).toBe('29/02/2024');
  });

  it('деструктуризация по имени работает корректно', () => {
    render(
      <TestInput
        mask="HH:mm"
        blocks={{
          HH: { min: 0, max: 23 },
          mm: ({ HH }: Record<string, string>) => ({
            min: 0,
            max: parseInt(HH, 10) === 0 ? 30 : 59,
          }),
        }}
      />,
    );
    const input = getInput();
    fireChangeAt(input, '0059', 4);
    expect(input.value).toBe('00:30');
  });
});

describe('named blocks — некорректное ограничение (min > max)', () => {
  it('функция блока, возвращающая min > max, не пропускает значение без ограничения', () => {
    render(
      <TestInput
        mask="HH:mm"
        blocks={{
          HH: { min: 0, max: 23 },
          mm: () => ({ min: 5, max: 3 }),
        }}
      />,
    );
    const input = getInput();
    fireChangeAt(input, '1265', 4);
    // значение "65" нарушает оба ограничения (min=5, max=3) и приводится к границе,
    // а не пропускается как есть.
    expect(input.value).toBe('12:05');
  });
});
