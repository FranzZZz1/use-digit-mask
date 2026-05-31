import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, getInput, TestInput } from './_helpers';

const MASK = '+77 (###) ###-##-##';

describe('Многосимвольный префикс — вырезание через onChange (cut)', () => {
  it('вырезание тела с захватом одного символа префикса — тело очищается', () => {
    render(<TestInput mask={MASK} initialValue="+77 (123) 456-78-91" />);
    const input = getInput();
    fireChangeAt(input, '+7', 2);
    expect(input.value).toBe('');
  });

  it('вырезание всего содержимого — поле очищается', () => {
    render(<TestInput mask={MASK} initialValue="+77 (123) 456-78-91" />);
    const input = getInput();
    fireChangeAt(input, '', 0);
    expect(input.value).toBe('');
  });

  it('вырезание тела вместе с полным префиксом — тело очищается', () => {
    render(<TestInput mask={MASK} initialValue="+77 (123) 456-78-91" />);
    const input = getInput();
    fireChangeAt(input, '+77 (', 5);
    expect(input.value).toBe('');
  });

  it('вырезание до первого символа префикса — поле очищается', () => {
    render(<TestInput mask={MASK} initialValue="+77 (123) 456-78-91" />);
    const input = getInput();
    fireChangeAt(input, '+', 1);
    expect(input.value).toBe('');
  });

  it('alwaysActive: вырезание тела с захватом части префикса — показывается шаблон', () => {
    render(<TestInput alwaysActive mask={MASK} initialValue="+77 (123) 456-78-91" />);
    const input = getInput();
    fireChangeAt(input, '+7', 2);
    expect(input.value).toBe('+77 (___) ___-__-__');
  });

  it('guard: ввод цифры перед полным префиксом — цифра идёт в тело', () => {
    render(<TestInput alwaysActive mask={MASK} />);
    const input = getInput();
    fireChangeAt(input, '5+77 (___) ___-__-__', 1);
    expect(input.value).toBe('+77 (5__) ___-__-__');
  });
});

describe('Многосимвольный префикс — обычный ввод не ломается', () => {
  it('ввод цифры в первый слот', () => {
    render(<TestInput alwaysActive mask={MASK} />);
    const input = getInput();
    fireChangeAt(input, '+77 (9__) ___-__-__', 6);
    expect(input.value).toBe('+77 (9__) ___-__-__');
  });

  it('заполненная маска остаётся корректной', () => {
    render(<TestInput mask={MASK} initialValue="+77 (123) 456-78-91" />);
    const input = getInput();
    expect(input.value).toBe('+77 (123) 456-78-91');
  });

  it('вставка полного номера через onChange (Android IME)', () => {
    render(<TestInput alwaysActive mask={MASK} />);
    const input = getInput();
    fireChangeAt(input, '1234567890', 10);
    expect(input.value).toBe('+77 (123) 456-78-90');
  });
});
