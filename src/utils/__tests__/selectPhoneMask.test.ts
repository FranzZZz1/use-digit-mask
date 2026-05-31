import { type DialPlan, E164_MASK, selectPhoneMask } from 'use-digit-mask';
import { describe, expect, it } from 'vitest';

const PLANS: DialPlan[] = [
  { id: 'RU', cc: '7', pattern: '(###) ###-##-##', altPrefixes: ['8'] },
  { id: 'KZ', cc: '7', pattern: '(###) ###-##-##' },
  { id: 'US', cc: '1', pattern: '(###) ###-####' },
];

describe('selectPhoneMask', () => {
  it('пустые цифры -> FALLBACK (E.164, без кандидатов)', () => {
    const r = selectPhoneMask('', PLANS);
    expect(r.mask).toBe(E164_MASK);
    expect(r.cc).toBeNull();
    expect(r.id).toBeNull();
    expect(r.candidates).toEqual([]);
  });

  it('нет совпадений по cc -> FALLBACK', () => {
    const r = selectPhoneMask('999', PLANS);
    expect(r.mask).toBe(E164_MASK);
    expect(r.id).toBeNull();
  });

  it('однозначный план (+1) -> mask/prefix плана, кандидаты пусты', () => {
    const r = selectPhoneMask('1999', PLANS);
    expect(r.id).toBe('US');
    expect(r.prefix).toBe('+1');
    expect(r.mask).toBe('+# (###) ###-####');
    expect(r.candidates).toEqual([]);
  });

  it('неоднозначность +7 (RU/KZ) -> candidates ≥ 2, best — первый по порядку', () => {
    const r = selectPhoneMask('79991234567', PLANS);
    expect(r.prefix).toBe('+7');
    expect(r.id).toBe('RU');
    expect(r.candidates.length).toBe(2);
    expect(r.candidates.map((c) => c.id).sort()).toEqual(['KZ', 'RU']);
  });

  it('alt-prefix "8" -> prefix "8", parentPrefix "+7", candidates пусты', () => {
    const r = selectPhoneMask('89991234567', PLANS);
    expect(r.prefix).toBe('8');
    expect(r.parentPrefix).toBe('+7');
    expect(r.mask).toBe('# (###) ###-##-##');
    expect(r.candidates).toEqual([]);
  });

  it('частичный ввод по cc (cc.startsWith(digits)) поднимает кандидатов', () => {
    const plans: DialPlan[] = [
      { id: 'PE', cc: '51', pattern: '### ### ###' },
      { id: 'MX', cc: '52', pattern: '## #### ####' },
    ];
    const r = selectPhoneMask('5', plans);
    expect(r.candidates.length).toBe(2);
  });

  it('best = самый длинный совпавший префикс', () => {
    const plans: DialPlan[] = [
      { id: 'A', cc: '1', pattern: '### ###' },
      { id: 'B', cc: '123', pattern: '### ###' },
    ];
    const r = selectPhoneMask('123456', plans);
    expect(r.id).toBe('B');
    expect(r.prefix).toBe('+123');
  });
});
