import { dialPlanToCandidate } from 'use-digit-mask';
import { describe, expect, it } from 'vitest';

import { formatDigitsWithMask } from '../formatDigitsWithMask';

describe('formatDigitsWithMask', () => {
  it('заполняет слоты и добивает placeholder-ом', () => {
    expect(formatDigitsWithMask('123', '##-##', '_')).toBe('12-3_');
  });

  it('обрезает лишние цифры до числа слотов', () => {
    expect(formatDigitsWithMask('12345', '##', '_')).toBe('12');
  });

  it('пустые цифры -> только placeholder-ы и литералы', () => {
    expect(formatDigitsWithMask('', '##/##', '_')).toBe('__/__');
  });

  it('игнорирует литералы при подсчёте слотов', () => {
    expect(formatDigitsWithMask('0101', '##/##/####', '_')).toBe('01/01/____');
  });

  it('кастомный placeholderChar', () => {
    expect(formatDigitsWithMask('1', '###', '•')).toBe('1••');
  });
});

describe('dialPlanToCandidate', () => {
  it('hasPlus по умолчанию -> "+cc" и слот-маска с плюсом', () => {
    const c = dialPlanToCandidate({ id: 'RU', cc: '7', pattern: '(###) ###-##-##' });
    expect(c.prefix).toBe('+7');
    expect(c.prefixDigits).toBe('7');
    expect(c.mask).toBe('+# (###) ###-##-##');
  });

  it('hasPlus=false -> без плюса', () => {
    const c = dialPlanToCandidate({ id: 'X', cc: '8', pattern: '(###) ###-##-##', hasPlus: false });
    expect(c.prefix).toBe('8');
    expect(c.mask).toBe('# (###) ###-##-##');
  });

  it('многозначный cc -> соответствующее число слотов префикса', () => {
    const c = dialPlanToCandidate({ id: 'JP', cc: '81', pattern: '##-####-####' });
    expect(c.mask).toBe('+## ##-####-####');
    expect(c.prefixDigits).toBe('81');
  });

  it('id по умолчанию = cc, если не задан', () => {
    const c = dialPlanToCandidate({ cc: '7', pattern: '(###)' });
    expect(c.id).toBe('7');
  });
});
