import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { useMask } from 'use-digit-mask';
import { describe, expect, it } from 'vitest';

import { type UseMaskProps } from '../../types';

import { fireChangeAt, getInput } from './_helpers';

function GhostInput({
  ghostChar = '_',
  initialValue = '',
  ...rest
}: Omit<UseMaskProps, 'value' | 'onChange'> & { initialValue?: string; ghostChar?: string }) {
  const [value, setValue] = useState(initialValue);
  const { props, ghostValue } = useMask({ ...rest, ghostChar, value, onChange: setValue });
  return <input {...props} data-testid="input" data-ghost={ghostValue} />;
}

function getGhost(): string {
  return screen.getByTestId('input').dataset.ghost ?? '';
}

describe('ghostValue без trimMaskTail (по умолчанию)', () => {
  it('пустое неактивное поле: ghostValue = полная маска с ghostChar', () => {
    render(<GhostInput mask="####" ghostChar="•" />);
    expect(getGhost()).toBe('••••');
  });

  it('после ввода 2 цифр: ghostValue = пробелы (placeholder уже в rootValue)', () => {
    render(<GhostInput mask="####" ghostChar="•" />);
    const input = getInput();
    fireChangeAt(input, '12__', 2);
    expect(getGhost()).toBe('    ');
  });

  it('alwaysActive, пустое поле: ghostValue = "" (не дублирует шаблон)', () => {
    render(<GhostInput alwaysActive mask="####" ghostChar="•" />);
    expect(getGhost()).toBe('');
  });
});

describe('ghostValue с trimMaskTail=true', () => {
  it('пустое неактивное поле: ghostValue = полная маска с ghostChar', () => {
    render(<GhostInput trimMaskTail mask="####" ghostChar="•" />);
    expect(getGhost()).toBe('••••');
  });

  it('2 цифры: оставшиеся слоты заполняются ghostChar', () => {
    render(<GhostInput trimMaskTail mask="####" ghostChar="•" />);
    const input = getInput();
    fireChangeAt(input, '12__', 2);
    expect(getGhost()).toBe('  ••');
  });

  it('полная маска: нет незаполненных слотов', () => {
    render(<GhostInput trimMaskTail mask="####" ghostChar="•" />);
    const input = getInput();
    fireChangeAt(input, '1234', 4);
    expect(getGhost()).toBe('    ');
  });

  it('маска с разделителями "## ## ##": ghost учитывает литералы', () => {
    render(<GhostInput trimMaskTail mask="## ## ##" ghostChar="•" />);
    const input = getInput();
    fireChangeAt(input, '12', 2);
    expect(getGhost()).toBe('   •• ••');
  });

  it('ghostChar не задан: используется placeholderChar', () => {
    render(<GhostInput trimMaskTail mask="####" placeholderChar="_" />);
    const input = getInput();
    fireChangeAt(input, '12__', 2);
    expect(getGhost()).toBe('  __');
  });

  it('с префикс-маской: ghost включает литералы после последнего слота', () => {
    render(<GhostInput trimMaskTail mask="+7 (###)" ghostChar="•" allowedPrefixes={['+7', '8']} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    expect(getGhost()).toBe('    •••)');
  });
});
