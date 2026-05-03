import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, firePaste, getInput, UncontrolledPhone } from './_helpers';

describe('usePhoneMask - базовое поведение', () => {
  it('пустое поле на старте', () => {
    render(<UncontrolledPhone />);
    expect(getInput().value).toBe('');
  });

  it('ввод +7... отображается в российском формате', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    fireChangeAt(input, '79991234567', 11);
    expect(input.value).toBe('+7 (999) 123-45-67');
  });

  it('ввод +1... отображается в американском формате', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    fireChangeAt(input, '12025551234', 11);
    expect(input.value).toBe('+1 (202) 555-1234');
  });

  it('вставка полного номера с +7', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    firePaste(input, '+7 (999) 123-45-67');
    expect(input.value).toBe('+7 (999) 123-45-67');
  });

  it('вставка номера без +: "79991234567" -> российский формат', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    firePaste(input, '79991234567');
    expect(input.value).toBe('+7 (999) 123-45-67');
  });
});
