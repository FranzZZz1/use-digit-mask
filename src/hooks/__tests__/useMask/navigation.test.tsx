import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { flushRaf } from '../../../test-setup';
import { PHONE_MASK } from '../constants';

import { ControlledInput, fireChangeAt, fireKey, firePaste, getInput, placeCaret, TestInput } from './_helpers';

describe('Навигация клавишами', () => {
  it('Home / ArrowUp -> курсор к началу (prefixLength)', () => {
    render(<TestInput mask={PHONE_MASK} allowedPrefixes={['+7']} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    placeCaret(input, 10);
    fireKey(input, 'Home');
    flushRaf();
    expect(input.selectionStart).toBe(4);
  });

  it('End / ArrowDown -> курсор после последней цифры', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    fireChangeAt(input, '12__', 2);
    placeCaret(input, 0);
    fireKey(input, 'End');
    flushRaf();
    expect(input.selectionStart).toBe(2);
  });

  it('ArrowLeft -> курсор назад через разделитель', () => {
    render(<TestInput mask="#### ####" initialValue="1234 5___" />);
    const input = getInput();
    placeCaret(input, 6);
    fireKey(input, 'ArrowLeft');
    flushRaf();
    expect(input.selectionStart).toBe(4);
  });

  it('ArrowRight -> курсор вперёд через разделитель', () => {
    render(<TestInput mask="#### ####" initialValue="1234 5___" />);
    const input = getInput();
    placeCaret(input, 4);
    fireKey(input, 'ArrowRight');
    flushRaf();
    expect(input.selectionStart).toBe(6);
  });

  it('клик перед prefix -> курсор выставляется в начало слотов', () => {
    render(<TestInput mask={PHONE_MASK} allowedPrefixes={['+7']} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireEvent.click(input, { target: { selectionStart: 1, selectionEnd: 1 } });
    flushRaf();
    expect(input.selectionStart).toBe(4);
  });
});

describe('Позиция курсора', () => {
  it('после ввода первой цифры курсор после неё', () => {
    render(<TestInput mask="#### ####" />);
    const input = getInput();
    fireChangeAt(input, '1___  ____', 1);
    flushRaf();
    expect(input.selectionStart).toBe(1);
  });

  it('после 4-й цифры курсор перешагивает пробел', () => {
    render(<TestInput mask="#### ####" />);
    const input = getInput();
    fireChangeAt(input, '1234 ____', 4);
    flushRaf();
    expect(input.selectionStart).toBe(4);
  });

  it('после 5-й цифры курсор за пробелом на позиции 6', () => {
    render(<TestInput mask="#### ####" />);
    const input = getInput();
    fireChangeAt(input, '1234 5___', 6);
    flushRaf();
    expect(input.selectionStart).toBe(6);
  });

  it('backspace - курсор смещается влево', () => {
    render(<TestInput mask="####" initialValue="12__" />);
    const input = getInput();
    placeCaret(input, 2);
    fireKey(input, 'Backspace');
    flushRaf();
    expect(input.selectionStart).toBe(1);
  });

  it('home - курсор в prefixLength', () => {
    render(<TestInput mask="+7 (###)" allowedPrefixes={['+7']} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    placeCaret(input, 7);
    fireKey(input, 'Home');
    flushRaf();
    expect(input.selectionStart).toBe(4);
  });

  it('end - курсор после последней цифры', () => {
    render(<TestInput mask="####" initialValue="12__" />);
    const input = getInput();
    placeCaret(input, 0);
    fireKey(input, 'End');
    flushRaf();
    expect(input.selectionStart).toBe(2);
  });
});

describe('Каретка — вставка / история / внешний sync', () => {
  it('после вставки курсор в конце вставленного', () => {
    render(<TestInput mask="#### ####" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '1234');
    flushRaf();
    expect(input.value).toBe('1234 ____');
    expect(input.selectionStart).toBe(4);
  });

  it('после вставки в середину курсор после вставленного фрагмента', () => {
    render(<TestInput mask="#### ####" initialValue="1234 5678" />);
    const input = getInput();
    placeCaret(input, 2);
    firePaste(input, '99');
    flushRaf();
    expect(input.value).toBe('1299 3456');
    expect(input.selectionStart).toBe(4);
  });

  it('после undo курсор в конце восстановленного значения', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    fireChangeAt(input, '1', 1);
    fireChangeAt(input, '12__', 2);
    fireKey(input, 'z', { ctrlKey: true });
    flushRaf();
    expect(input.value).toBe('1___');
    expect(input.selectionStart).toBe(1);
  });

  it('внешнее изменение value ставит курсор в конец', () => {
    const { rerender } = render(<ControlledInput mask="####" value="12__" onChange={() => {}} />);
    const input = getInput();
    rerender(<ControlledInput mask="####" value="1234" onChange={() => {}} />);
    flushRaf();
    expect(input.value).toBe('1234');
    expect(input.selectionStart).toBe(4);
  });
});
