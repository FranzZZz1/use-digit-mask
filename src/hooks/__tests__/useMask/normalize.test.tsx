import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fireChangeAt, fireKey, firePaste, getInput, placeCaret, TestInput } from './_helpers';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('normalize', () => {
  it('normalize применяется к digits перед рендером', () => {
    const norm = (d: string) => d.slice(0, 4);
    render(<TestInput mask="########" normalize={norm} />);
    const input = getInput();
    fireChangeAt(input, '12345678', 8);
    expect(input.value).toBe('1234____');
  });

  it('normalize заменяет все "0" на "9"', () => {
    const norm = (d: string) => d.replace(/0/g, '9');
    render(<TestInput mask="####" normalize={norm} />);
    const input = getInput();
    fireChangeAt(input, '1024', 4);
    expect(input.value).toBe('1924');
  });

  it('normalize применяется ровно один раз - non-idempotent реверс', () => {
    // Если бы normalize применялся дважды, reverse(reverse('1234')) = '1234', тест бы провалился
    const norm = (d: string) => d.split('').reverse().join('');
    render(<TestInput mask="####" normalize={norm} />);
    const input = getInput();
    fireChangeAt(input, '1234', 4);
    expect(input.value).toBe('4321');
  });

  it('normalize при вставке применяется ровно один раз', () => {
    const norm = (d: string) => d.split('').reverse().join('');
    render(<TestInput mask="####" normalize={norm} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '1234');
    expect(input.value).toBe('4321');
  });
});

// normalizeTime: зажимает часы до [0..23] и минуты до [0..59].
// Работает с голыми цифрами (без разделителя), которые mask передаёт в normalize.
// Частичный ввод (< 4 цифр) пропускается без изменений - нечего зажимать.
const normalizeTime = (d: string): string => {
  const hhRaw = d.slice(0, 2);
  const mmRaw = d.slice(2, 4);

  const hh = hhRaw.length === 2 ? String(Math.min(parseInt(hhRaw, 10), 23)).padStart(2, '0') : hhRaw;

  const mm = mmRaw.length === 2 ? String(Math.min(parseInt(mmRaw, 10), 59)).padStart(2, '0') : mmRaw;

  return hh + mm;
};

describe('normalize: нормализация времени (##:##)', () => {
  it('часы > 23 и минуты > 59 -> 23:59', () => {
    render(<TestInput mask="##:##" normalize={normalizeTime} />);
    const input = getInput();
    fireChangeAt(input, '4264', 4);
    expect(input.value).toBe('23:59');
  });

  it('часы > 23, минуты валидны -> зажимаются только часы (42:42 -> 23:42)', () => {
    render(<TestInput mask="##:##" normalize={normalizeTime} />);
    const input = getInput();
    fireChangeAt(input, '4242', 4);
    expect(input.value).toBe('23:42');
  });

  it('валидное время не изменяется (23:59 -> 23:59)', () => {
    render(<TestInput mask="##:##" normalize={normalizeTime} />);
    const input = getInput();
    fireChangeAt(input, '2359', 4);
    expect(input.value).toBe('23:59');
  });

  it('граничные нули 00:00 не изменяются', () => {
    render(<TestInput mask="##:##" normalize={normalizeTime} />);
    const input = getInput();
    fireChangeAt(input, '0000', 4);
    expect(input.value).toBe('00:00');
  });

  it('9999 -> 23:59', () => {
    render(<TestInput mask="##:##" normalize={normalizeTime} />);
    const input = getInput();
    fireChangeAt(input, '9999', 4);
    expect(input.value).toBe('23:59');
  });

  it('частичный ввод: только часы (99 -> 23:__)', () => {
    render(<TestInput mask="##:##" normalize={normalizeTime} />);
    const input = getInput();
    fireChangeAt(input, '99', 2);
    expect(input.value).toBe('23:__');
  });

  it('частичный ввод: одна цифра часов - без зажима', () => {
    render(<TestInput mask="##:##" normalize={normalizeTime} />);
    const input = getInput();
    fireChangeAt(input, '4', 1);
    expect(input.value).toBe('4_:__');
  });

  it('вставка "42:64" нормализуется', () => {
    render(<TestInput mask="##:##" normalize={normalizeTime} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '42:64');
    expect(input.value).toBe('23:59');
  });

  it('вставка "4264" (без разделителя) нормализуется', () => {
    render(<TestInput mask="##:##" normalize={normalizeTime} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '4264');
    expect(input.value).toBe('23:59');
  });

  it('backspace не ломает нормализацию: удаление минут из "23:59" -> "23:5_"', () => {
    render(<TestInput mask="##:##" initialValue="23:59" normalize={normalizeTime} />);
    const input = getInput();
    placeCaret(input, 5);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('23:5_');
  });

  it('normalize вызывается ровно один раз при вводе (spy)', () => {
    const spy = vi.fn((d: string) => normalizeTime(d));
    render(<TestInput mask="##:##" normalize={spy} />);
    const input = getInput();
    fireChangeAt(input, '4264', 4);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('4264');
  });

  it('normalize вызывается ровно один раз при вставке (spy)', () => {
    const spy = vi.fn((d: string) => normalizeTime(d));
    render(<TestInput mask="##:##" normalize={spy} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '4264');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('4264');
  });
});
