import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, getInput, TestInput } from './_helpers';

describe('Базовый ввод', () => {
  it('пустая маска - инпут пуст', () => {
    render(<TestInput mask="#### #### #### ####" />);
    expect(getInput().value).toBe('');
  });

  it('первый символ отображается в первом слоте', () => {
    render(<TestInput mask="#### #### #### ####" />);
    const input = getInput();
    fireChangeAt(input, '1', 1);
    expect(input.value).toBe('1___ ____ ____ ____');
  });

  it('заполнение всех 16 цифр', () => {
    render(<TestInput mask="#### #### #### ####" />);
    const input = getInput();
    fireChangeAt(input, '1234567890123456', 16);
    expect(input.value).toBe('1234 5678 9012 3456');
  });

  it('лишние цифры обрезаются до maxDigits', () => {
    render(<TestInput mask="##/##/####" />);
    const input = getInput();
    fireChangeAt(input, '123456789', 9);
    expect(input.value).toBe('12/34/5678');
  });

  it('нецифровые символы игнорируются', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    fireChangeAt(input, 'abc', 3);
    expect(input.value).toBe('');
  });

  it('нецифровые символы внутри строки фильтруются', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    fireChangeAt(input, 'a1b2', 4);
    expect(input.value).toBe('12__');
  });

  it('кастомный placeholderChar', () => {
    render(<TestInput mask="##-##" placeholderChar="*" />);
    const input = getInput();
    fireChangeAt(input, '12', 2);
    expect(input.value).toBe('12-**');
  });

  it('пустой placeholderChar - плейсхолдер не показывается', () => {
    render(<TestInput mask="##/##" placeholderChar="" />);
    const input = getInput();
    fireChangeAt(input, '12', 2);
    expect(input.value).toBe('12/');
  });
});

describe('Ввод в середину заполненной маски', () => {
  it('вставка цифры в середину - последняя цифра вытесняется', () => {
    render(<TestInput mask="#### #### #### ####" />);
    const input = getInput();
    fireChangeAt(input, '1234567890123456', 16);
    expect(input.value).toBe('1234 5678 9012 3456');

    fireChangeAt(input, '1234 59678 9012 3456', 7);
    expect(input.value).toBe('1234 5967 8901 2345');
  });

  it('вставка в начало - первые цифры сдвигаются', () => {
    render(<TestInput mask="####" initialValue="1234" />);
    const input = getInput();
    fireChangeAt(input, '91234', 1);
    expect(input.value).toBe('9123');
  });

  it('вставка перед разделителем', () => {
    render(<TestInput mask="## ## ##" initialValue="12 34 56" />);
    const input = getInput();
    fireChangeAt(input, '129 34 56', 3);
    expect(input.value).toBe('12 93 45');
  });

  it('вставка в маску с 1 свободным слотом', () => {
    render(<TestInput mask="####" initialValue="123_" />);
    const input = getInput();
    fireChangeAt(input, '1293', 3);
    expect(input.value).toBe('1293');
  });
});
