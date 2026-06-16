import { describe, expect, it } from 'vitest';

import { stripMaskFormatting } from '../internal/bypassMask';

describe('stripMaskFormatting', () => {
  it('вставка буквы в тело, начинающееся с цифры видимого префикса — цифры не теряются', () => {
    const result = stripMaskFormatting('+7 (777) 123-45-67', '+7 (7x77) 123-45-67', '7771234567', 4);
    expect(result).toEqual({ value: '7x771234567', caretPos: 2 });
  });
});
