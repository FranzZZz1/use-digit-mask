import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, firePaste, getInput, UncontrolledPhone } from './_helpers';

describe('usePhoneMask - мобильная вставка через onChange', () => {
  it('вставка "7120" (cursor=4 ≤ prefixLength=4) → "+7 (120) ___-__-__"', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    fireChangeAt(input, '7120', 4);
    expect(input.value).toBe('+7 (120) ___-__-__');
  });

  it('вставка "712" (cursor=3 ≤ prefixLength=4) → "+7 (12_) ___-__-__"', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    fireChangeAt(input, '712', 3);
    expect(input.value).toBe('+7 (12_) ___-__-__');
  });

  it('вставка "71" (cursor=2 ≤ prefixLength=4) → "+7 (1__) ___-__-__"', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    fireChangeAt(input, '71', 2);
    expect(input.value).toBe('+7 (1__) ___-__-__');
  });

  it('вставка "71234567890" (cursor=11 > prefixLength) — не регрессирует', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    fireChangeAt(input, '71234567890', 11);
    expect(input.value).toBe('+7 (123) 456-78-90');
  });

  it('prefixOnly "7" (cursor=1) активирует маску без тела', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');
  });
});

describe('usePhoneMask - onPaste не регрессирует после фикса', () => {
  it('firePaste "79001234567" → "+7 (900) 123-45-67"', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    firePaste(input, '79001234567');
    expect(input.value).toBe('+7 (900) 123-45-67');
  });

  it('firePaste "+7 (999) 123-45-67" → тот же номер', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    firePaste(input, '+7 (999) 123-45-67');
    expect(input.value).toBe('+7 (999) 123-45-67');
  });

  it('firePaste "89001234567" → "8 (900) 123-45-67" (alt-prefix)', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    firePaste(input, '89001234567');
    expect(input.value).toBe('8 (900) 123-45-67');
  });
});
