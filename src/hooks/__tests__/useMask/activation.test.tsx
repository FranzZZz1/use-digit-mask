import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PHONE_MASK, PHONE_PREFIXES } from '../constants';

import { fireChangeAt, fireKey, getInput, placeCaret, RussiaPhone, TestInput } from './_helpers';

describe('Ввод при allowedPrefixes = []', () => {
  it('ввод "7" (совпадает с цифрой маски) кладёт цифру в первый слот, не показывает пустой шаблон', () => {
    render(<TestInput mask={PHONE_MASK} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    expect(input.value).toBe('+7 (7__) ___-__-__');
  });

  it('ввод "9" кладёт цифру в первый слот', () => {
    render(<TestInput mask={PHONE_MASK} />);
    const input = getInput();
    fireChangeAt(input, '9', 1);
    expect(input.value).toBe('+7 (9__) ___-__-__');
  });

  it('продолжение ввода после первой цифры корректно заполняет следующие слоты', () => {
    render(<TestInput mask={PHONE_MASK} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '+7 (79_) ___-__-__', 6);
    expect(input.value).toBe('+7 (79_) ___-__-__');
  });
});

describe('Активация маски через allowedPrefixes', () => {
  it('ввод "7" активирует маску и показывает пустой шаблон', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('ввод "8" активирует маску', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '8', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('ввод любой другой цифры не активирует', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '5', 1);
    expect(input.value).toBe('+7 (5__) ___-__-__');
  });

  it('после активации ввод цифр заполняет слоты', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');

    fireChangeAt(input, '+7 (9__) ___-__-__', 5);
    expect(input.value).toBe('+7 (9__) ___-__-__');
  });

  it('backspace в начале активной маски -> деактивирует', () => {
    render(<RussiaPhone />);
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
    render(<RussiaPhone activateOnFocus />);
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

describe('prefixAliases (актуальное имя вместо устаревшего allowedPrefixes)', () => {
  it('"7" активирует маску', () => {
    render(<TestInput mask={PHONE_MASK} prefixAliases={PHONE_PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('"8" также активирует маску', () => {
    render(<TestInput mask={PHONE_MASK} prefixAliases={PHONE_PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '8', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('overflow-стрипинг работает через prefixAliases', () => {
    render(<TestInput mask={PHONE_MASK} prefixAliases={PHONE_PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 11);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('RussiaPhone использует allowedPrefixes — тест контракта хелпера', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');
  });
});
