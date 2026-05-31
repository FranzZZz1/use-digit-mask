import React from 'react';
import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { type ParsedValues } from '../../types';
import { PHONE_MASK, PHONE_PREFIXES } from '../constants';

import { AsyncControlledInput, fireChangeAt, fireKey, firePaste, getInput, placeCaret, TestInput } from './_helpers';

describe('Undo (Ctrl+Z)', () => {
  it('отменяет последний введённый символ', () => {
    render(<TestInput mask="####" initialValue="12__" />);
    const input = getInput();
    expect(input.value).toBe('12__');

    fireChangeAt(input, '123_', 3);
    expect(input.value).toBe('123_');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('12__');
  });

  it('несколько последовательных Ctrl+Z откатывают по одному шагу', () => {
    render(<TestInput mask="####" />);
    const input = getInput();

    fireChangeAt(input, '1', 1);
    expect(input.value).toBe('1___');

    fireChangeAt(input, '12__', 2);
    expect(input.value).toBe('12__');

    fireChangeAt(input, '123_', 3);
    expect(input.value).toBe('123_');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('12__');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('1___');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('');
  });

  it('Ctrl+Z при пустой истории ничего не меняет', () => {
    render(<TestInput mask="####" initialValue="12__" />);
    const input = getInput();
    expect(input.value).toBe('12__');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('12__');
  });

  it('Meta+Z работает как Ctrl+Z (Mac)', () => {
    render(<TestInput mask="####" initialValue="12__" />);
    const input = getInput();

    fireChangeAt(input, '123_', 3);
    expect(input.value).toBe('123_');

    fireKey(input, 'z', { metaKey: true });
    expect(input.value).toBe('12__');
  });

  it('удаление через Backspace попадает в историю и может быть отменено', () => {
    render(<TestInput mask="####" initialValue="123_" />);
    const input = getInput();

    placeCaret(input, 3);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('12__');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('123_');
  });

  it('удаление через Delete попадает в историю и может быть отменено', () => {
    render(<TestInput mask="####" initialValue="123_" />);
    const input = getInput();

    placeCaret(input, 0);
    fireKey(input, 'Delete');
    expect(input.value).toBe('23__');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('123_');
  });

  it('M6: вставка префикса поверх непустого неактивного поля откатывается через Ctrl+Z', () => {
    render(<TestInput mask={PHONE_MASK} allowedPrefixes={PHONE_PREFIXES} initialValue="+7 (983) 120-48-97" />);
    const input = getInput();
    expect(input.value).toBe('+7 (983) 120-48-97');

    placeCaret(input, 0, input.value.length);
    firePaste(input, '+7');
    expect(input.value).toBe('+7 (___) ___-__-__');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('Ctrl+Z вызывает onChange с корректным значением', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask="####" onChangeSpy={spy} />);
    const input = getInput();

    fireChangeAt(input, '1', 1);
    fireChangeAt(input, '12__', 2);
    spy.mockClear();

    fireKey(input, 'z', { ctrlKey: true });
    expect(spy).toHaveBeenCalledWith('1___', expect.any(Object));
  });
});

describe('Redo (Ctrl+Y / Ctrl+Shift+Z)', () => {
  it('Ctrl+Y повторяет отменённое действие', () => {
    render(<TestInput mask="####" />);
    const input = getInput();

    fireChangeAt(input, '1', 1);
    fireChangeAt(input, '12__', 2);
    expect(input.value).toBe('12__');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('1___');

    fireKey(input, 'y', { ctrlKey: true });
    expect(input.value).toBe('12__');
  });

  it('Ctrl+Shift+Z повторяет отменённое действие', () => {
    render(<TestInput mask="####" />);
    const input = getInput();

    fireChangeAt(input, '5', 1);
    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('');

    fireKey(input, 'z', { ctrlKey: true, shiftKey: true });
    expect(input.value).toBe('5___');
  });

  it('несколько Ctrl+Z, затем несколько Ctrl+Y восстанавливают всё', () => {
    render(<TestInput mask="####" />);
    const input = getInput();

    fireChangeAt(input, '1', 1);
    fireChangeAt(input, '12__', 2);
    fireChangeAt(input, '123_', 3);

    fireKey(input, 'z', { ctrlKey: true });
    fireKey(input, 'z', { ctrlKey: true });
    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('');

    fireKey(input, 'y', { ctrlKey: true });
    fireKey(input, 'y', { ctrlKey: true });
    fireKey(input, 'y', { ctrlKey: true });
    expect(input.value).toBe('123_');
  });

  it('новый ввод после Ctrl+Z обрезает стек redo', () => {
    render(<TestInput mask="####" />);
    const input = getInput();

    fireChangeAt(input, '1', 1);
    fireChangeAt(input, '12__', 2);

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('1___');

    fireChangeAt(input, '19__', 2);
    expect(input.value).toBe('19__');

    fireKey(input, 'y', { ctrlKey: true });
    expect(input.value).toBe('19__');
  });

  it('Ctrl+Y при пустом redo-стеке ничего не меняет', () => {
    render(<TestInput mask="####" initialValue="12__" />);
    const input = getInput();

    fireKey(input, 'y', { ctrlKey: true });
    expect(input.value).toBe('12__');
  });
});

describe('historyLimit', () => {
  it('превышение лимита отбрасывает самые старые записи', () => {
    render(<TestInput mask="########" historyLimit={3} />);
    const input = getInput();

    fireChangeAt(input, '1', 1);
    fireChangeAt(input, '12______', 2);
    fireChangeAt(input, '123_____', 3);
    fireChangeAt(input, '1234____', 4);
    expect(input.value).toBe('1234____');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('123_____');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('12______');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('1_______');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('1_______');
  });
});

describe('Сброс истории при внешнем value', () => {
  it('initialValue при маунте не создаёт историю — Ctrl+Z ничего не делает', () => {
    render(<TestInput mask="####" initialValue="123_" />);
    const input = getInput();
    expect(input.value).toBe('123_');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('123_');
  });

  it('пользовательский ввод после initialValue создаёт историю', () => {
    render(<TestInput mask="####" initialValue="12__" />);
    const input = getInput();

    fireChangeAt(input, '123_', 3);
    expect(input.value).toBe('123_');

    fireKey(input, 'z', { ctrlKey: true });
    expect(input.value).toBe('12__');
  });
});

it('undo не должен очищать history при async controlled updates', async () => {
  vi.useFakeTimers();

  render(<AsyncControlledInput mask="####" />);

  const input = getInput();

  fireChangeAt(input, '1', 1);

  await act(async () => {
    await vi.runAllTimersAsync();
  });

  fireChangeAt(input, '12__', 2);

  await act(async () => {
    await vi.runAllTimersAsync();
  });

  fireKey(input, 'z', { ctrlKey: true });

  expect(input.value).toBe('1___');
});

it('undo не должен создавать новую history entry', () => {
  render(<TestInput mask="####" />);
  const input = getInput();

  fireChangeAt(input, '1', 1);
  fireChangeAt(input, '12__', 2);
  fireChangeAt(input, '123_', 3);

  fireKey(input, 'z', { ctrlKey: true });
  expect(input.value).toBe('12__');

  fireKey(input, 'z', { ctrlKey: true });
  expect(input.value).toBe('1___');

  fireKey(input, 'y', { ctrlKey: true });
  expect(input.value).toBe('12__');

  fireKey(input, 'y', { ctrlKey: true });
  expect(input.value).toBe('123_');
});
