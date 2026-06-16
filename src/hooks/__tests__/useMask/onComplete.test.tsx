import React, { useState } from 'react';
import { act, render } from '@testing-library/react';
import { useMask } from 'use-digit-mask';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type ParsedValues } from '../../types';

import { fireChangeAt, firePaste, getInput, TestInput } from './_helpers';

afterEach(() => {
  vi.restoreAllMocks();
});

const CARD_MASK = '#### #### #### ####';

describe('onComplete', () => {
  it('вызывается при заполнении всех слотов', () => {
    const onComplete = vi.fn<(parsed: ParsedValues) => void>();
    render(<TestInput mask={CARD_MASK} onComplete={onComplete} />);
    const input = getInput();
    fireChangeAt(input, '1234567890123456', 16);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0].isMaskCompleted).toBe(true);
  });

  it('не вызывается повторно, если маска уже заполнена и значение не менялось', () => {
    const onComplete = vi.fn();
    render(<TestInput mask={CARD_MASK} onComplete={onComplete} />);
    const input = getInput();
    fireChangeAt(input, '1234567890123456', 16);
    fireChangeAt(input, '1234 5678 9012 3456', 19);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('вызывается снова после очистки и повторного заполнения', () => {
    const onComplete = vi.fn();
    render(<TestInput mask={CARD_MASK} onComplete={onComplete} />);
    const input = getInput();
    fireChangeAt(input, '1234567890123456', 16);
    expect(onComplete).toHaveBeenCalledTimes(1);

    fireChangeAt(input, '1234 5678 9012 345_', 18);
    fireChangeAt(input, '1234567890123456', 16);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it('вызывается при вставке, полностью заполняющей маску', () => {
    const onComplete = vi.fn();
    render(<TestInput mask={CARD_MASK} onComplete={onComplete} />);
    const input = getInput();
    firePaste(input, '1234567890123456');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('не вызывается при незаполненной маске', () => {
    const onComplete = vi.fn();
    render(<TestInput mask={CARD_MASK} onComplete={onComplete} />);
    const input = getInput();
    fireChangeAt(input, '12345', 5);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('не вызывается при программном изменении value извне', () => {
    const onComplete = vi.fn();

    function Wrapper() {
      const [value, setValue] = useState('');
      const { props } = useMask({
        mask: CARD_MASK,
        value,
        onChange: setValue,
        onComplete,
      });
      return (
        <>
          <input {...props} data-testid="input" />
          <button
            type="button"
            onClick={() => {
              setValue('1234 5678 9012 3456');
            }}
          >
            fill
          </button>
        </>
      );
    }

    const { getByRole } = render(<Wrapper />);
    act(() => {
      getByRole('button').click();
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('передаёт корректный ParsedValues в callback', () => {
    const onComplete = vi.fn<(parsed: ParsedValues) => void>();
    render(<TestInput mask={CARD_MASK} onComplete={onComplete} />);
    const input = getInput();
    fireChangeAt(input, '1234567890123456', 16);
    const parsed = onComplete.mock.calls[0][0];
    expect(parsed.rawWithoutPrefix).toBe('1234567890123456');
    expect(parsed.formattedWithPrefix).toBe('1234 5678 9012 3456');
    expect(parsed.isMaskCompleted).toBe(true);
  });
});
