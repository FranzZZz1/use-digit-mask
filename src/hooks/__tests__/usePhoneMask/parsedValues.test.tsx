import React from 'react';
import { render } from '@testing-library/react';
import { type ParsedValues } from 'use-digit-mask';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, getInput, SpyPhone } from './_helpers';

describe('usePhoneMask - ParsedValues', () => {
  it('prefix = "+7" для российского номера', () => {
    let lastParsed: ParsedValues | null = null;
    render(
      <SpyPhone
        onChangeSpy={(_, parsed) => {
          lastParsed = parsed;
        }}
      />,
    );
    fireChangeAt(getInput(), '79991234567', 11);
    expect(lastParsed).not.toBeNull();
    expect(lastParsed!.prefix).toBe('+7');
    expect(lastParsed!.rawWithoutPrefix).toBe('9991234567');
  });

  it('prefix = "8" для alt-префикса', () => {
    let lastParsed: ParsedValues | null = null;
    render(
      <SpyPhone
        onChangeSpy={(_, parsed) => {
          lastParsed = parsed;
        }}
      />,
    );
    fireChangeAt(getInput(), '89991234567', 11);
    expect(lastParsed).not.toBeNull();
    expect(lastParsed!.prefix).toBe('8');
    expect(lastParsed!.rawWithoutPrefix).toBe('9991234567');
  });

  it('isMaskCompleted = true когда номер полностью заполнен', () => {
    let lastParsed: ParsedValues | null = null;
    render(
      <SpyPhone
        onChangeSpy={(_, parsed) => {
          lastParsed = parsed;
        }}
      />,
    );
    fireChangeAt(getInput(), '79991234567', 11);
    expect(lastParsed!.isMaskCompleted).toBe(true);
  });

  it('isMaskCompleted = false для частично введённого номера', () => {
    let lastParsed: ParsedValues | null = null;
    render(
      <SpyPhone
        onChangeSpy={(_, parsed) => {
          lastParsed = parsed;
        }}
      />,
    );
    fireChangeAt(getInput(), '7999', 4);
    expect(lastParsed!.isMaskCompleted).toBe(false);
  });
});
