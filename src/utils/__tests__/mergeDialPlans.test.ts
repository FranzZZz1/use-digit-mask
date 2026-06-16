import { type DialPlan, mergeDialPlans } from 'use-digit-mask';
import { describe, expect, it } from 'vitest';

const BASE: Record<string, DialPlan> = {
  RU: { id: 'RU', cc: '7', pattern: '(###) ###-##-##', label: { en: 'Russia', ru: 'Россия' } },
  US: { id: 'US', cc: '1', pattern: '(###) ###-####', label: { en: 'United States', ru: 'США' } },
};

describe('mergeDialPlans', () => {
  it('переопределяет поле существующей записи (override wins)', () => {
    const r = mergeDialPlans({ RU: { pattern: '###' } }, BASE);
    const ru = r.find((p) => p.id === 'RU');
    expect(ru?.pattern).toBe('###');
    expect(ru?.label).toEqual({ en: 'Russia', ru: 'Россия' });
  });

  it('null удаляет запись', () => {
    const r = mergeDialPlans({ US: null }, BASE);
    expect(r.find((p) => (p.id as string) === 'US')).toBeUndefined();
    expect(r.find((p) => p.id === 'RU')).toBeDefined();
  });

  it('добавляет новую запись (cc по умолчанию = ключ)', () => {
    const r = mergeDialPlans({ XX: { pattern: '###-###', label: { en: 'Custom', ru: 'Кастом' } } }, BASE);
    const xx = r.find((p) => p.id === 'XX');
    expect(xx).toMatchObject({ id: 'XX', cc: 'XX', pattern: '###-###', label: { en: 'Custom', ru: 'Кастом' } });
  });

  it('новая запись с явным cc сохраняет его', () => {
    const r = mergeDialPlans({ XX: { cc: '999', pattern: '###' } }, BASE);
    expect(r.find((p) => p.id === 'XX')?.cc).toBe('999');
  });

  it('бросает, если у новой записи нет pattern', () => {
    expect(() => mergeDialPlans({ XX: { cc: '999' } }, BASE)).toThrow(/requires a "pattern"/);
  });

  it('cc существующей записи нельзя изменить', () => {
    const r = mergeDialPlans({ RU: { cc: '999', pattern: '(###) ###-##-##' } }, BASE);
    expect(r.find((p) => p.id === 'RU')?.cc).toBe('7');
  });

  it('не мутирует базовый объект', () => {
    const baseCopy = JSON.parse(JSON.stringify(BASE));
    mergeDialPlans({ US: null, RU: { pattern: '###' } }, BASE);
    expect(BASE).toEqual(baseCopy);
  });
});
