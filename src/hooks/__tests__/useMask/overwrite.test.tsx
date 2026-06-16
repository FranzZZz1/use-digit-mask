import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, firePaste, getInput, placeCaret, TestInput } from './_helpers';

const DATE_MASK = '##/##/####';

function browserInsert(value: string, charPos: number, typed: string): [string, number] {
  const next = value.slice(0, charPos) + typed + value.slice(charPos);
  return [next, charPos + 1];
}

describe('overwrite mode', () => {
  it('в режиме overwrite цифра заменяет digit на позиции курсора', () => {
    render(<TestInput overwrite mask={DATE_MASK} initialValue="01012025" />);
    const input = getInput();
    expect(input.value).toBe('01/01/2025');

    const [newVal, cursor] = browserInsert('01/01/2025', 3, '5');
    fireChangeAt(input, newVal, cursor);
    expect(input.value).toBe('01/51/2025');
  });

  it('в режиме insert (по умолчанию) цифра вставляется, сдвигая остальные', () => {
    render(<TestInput mask={DATE_MASK} initialValue="01012025" />);
    const input = getInput();

    const [newVal, cursor] = browserInsert('01/01/2025', 3, '5');
    fireChangeAt(input, newVal, cursor);
    expect(input.value).toBe('01/50/1202');
  });

  it('overwrite в начале маски заменяет первую цифру', () => {
    render(<TestInput overwrite mask={DATE_MASK} initialValue="01012025" />);
    const input = getInput();

    const [newVal, cursor] = browserInsert('01/01/2025', 0, '3');
    fireChangeAt(input, newVal, cursor);
    expect(input.value).toBe('31/01/2025');
  });

  it('overwrite в конце заполненной маски ведёт себя как insert (нет digit для замены)', () => {
    render(<TestInput overwrite mask={DATE_MASK} initialValue="01012025" />);
    const input = getInput();

    const [newVal, cursor] = browserInsert('01/01/2025', 10, '9');
    fireChangeAt(input, newVal, cursor);
    expect(input.value).toBe('01/01/2025');
  });

  it('overwrite в незаполненной части работает как обычный insert', () => {
    render(<TestInput overwrite mask={DATE_MASK} initialValue="0101" />);
    const input = getInput();
    expect(input.value).toBe('01/01/____');

    const [newVal, cursor] = browserInsert('01/01/____', 6, '2');
    fireChangeAt(input, newVal, cursor);
    expect(input.value).toBe('01/01/2___');
  });

  it('overwrite на позиции литерала (/) выставляет курсор в следующий digit-слот', () => {
    render(<TestInput overwrite mask={DATE_MASK} initialValue="01012025" />);
    const input = getInput();

    const [newVal, cursor] = browserInsert('01/01/2025', 2, '5');
    fireChangeAt(input, newVal, cursor);
    expect(input.value).toBe('01/51/2025');
  });
});

describe('overwrite mode — paste', () => {
  it('вставка без выделения перезаписывает цифры начиная с позиции курсора', () => {
    render(<TestInput overwrite mask={DATE_MASK} initialValue="01012025" />);
    const input = getInput();
    placeCaret(input, 2);
    firePaste(input, '99');
    expect(input.value).toBe('01/99/2025');
  });

  it('вставка с выделением заменяет выделенный фрагмент (как в insert)', () => {
    render(<TestInput overwrite mask={DATE_MASK} initialValue="01012025" />);
    const input = getInput();
    placeCaret(input, 3, 5);
    firePaste(input, '12');
    expect(input.value).toBe('01/12/2025');
  });

  it('insert mode — вставка сдвигает цифры вправо', () => {
    render(<TestInput mask={DATE_MASK} initialValue="01012025" />);
    const input = getInput();
    placeCaret(input, 2);
    firePaste(input, '99');
    expect(input.value).toBe('01/99/0120');
  });

  it('вставка в конец заполненной маски не меняет значение', () => {
    render(<TestInput overwrite mask={DATE_MASK} initialValue="01012025" />);
    const input = getInput();
    placeCaret(input, 10);
    firePaste(input, '99');
    expect(input.value).toBe('01/01/2025');
  });
});
