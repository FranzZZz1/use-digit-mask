import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, fireKey, getInput, placeCaret, TestInput } from './_helpers';

describe('Активация маски через allowedPrefixes', () => {
  const MASK = '+7 (###) ###-##-##';
  const PREFIXES = ['+7', '8'];

  it('ввод "7" активирует маску и показывает пустой шаблон', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('ввод "8" активирует маску', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '8', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('ввод любой другой цифры не активирует', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '5', 1);
    expect(input.value).toBe('+7 (5__) ___-__-__');
  });

  it('после активации ввод цифр заполняет слоты', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');

    fireChangeAt(input, '+7 (9__) ___-__-__', 5);
    expect(input.value).toBe('+7 (9__) ___-__-__');
  });

  it('backspace в начале активной маски -> деактивирует', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');

    placeCaret(input, 0);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('');
  });
});

describe('activateOnFocus', () => {
  it('фокус показывает пустой шаблон маски', () => {
    render(<TestInput activateOnFocus mask="+7 (###) ###-##-##" allowedPrefixes={['+7', '8']} />);
    const input = getInput();
    fireEvent.focus(input);
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('повторный фокус не сбрасывает введённые цифры', () => {
    render(<TestInput activateOnFocus mask="####" />);
    const input = getInput();
    fireEvent.focus(input);
    fireChangeAt(input, '____', 4);
    fireChangeAt(input, '12__', 2);
    expect(input.value).toBe('12__');
    fireEvent.blur(input);
    fireEvent.focus(input);
    expect(input.value).toBe('12__');
  });
});

describe('deactivateOnEmptyBlur', () => {
  it('blur на пустой активной маске -> скрывает шаблон', () => {
    render(<TestInput activateOnFocus deactivateOnEmptyBlur mask="####" />);
    const input = getInput();
    fireEvent.focus(input);
    expect(input.value).toBe('____');
    fireEvent.blur(input);
    expect(input.value).toBe('');
  });

  it('blur с введёнными цифрами -> маска остаётся видимой', () => {
    render(<TestInput activateOnFocus deactivateOnEmptyBlur mask="####" />);
    const input = getInput();
    fireEvent.focus(input);
    fireChangeAt(input, '1___', 1);
    fireEvent.blur(input);
    expect(input.value).toBe('1___');
  });
});

describe('trimMaskTail', () => {
  it('значение не содержит плейсхолдеров в хвосте', () => {
    render(<TestInput trimMaskTail mask="####" />);
    const input = getInput();
    fireChangeAt(input, '12', 2);
    expect(input.value).toBe('12');
  });

  it('полностью заполненная маска - нет плейсхолдеров', () => {
    render(<TestInput trimMaskTail mask="####" />);
    const input = getInput();
    fireChangeAt(input, '1234', 4);
    expect(input.value).toBe('1234');
  });

  it('пустая маска - пустая строка (не шаблон)', () => {
    render(<TestInput trimMaskTail mask="####" />);
    expect(getInput().value).toBe('');
  });

  it('trimMaskTail + маска с разделителями', () => {
    render(<TestInput trimMaskTail mask="##/##/####" />);
    const input = getInput();
    fireChangeAt(input, '0101', 4);
    expect(input.value).toBe('01/01');
  });
});
