import { type DialPlan, type PhoneMaskCandidate } from './types';

/**
 * Строит PhoneMaskCandidate из DialPlan.
 *
 * @remarks Сгенерированная маска добавляет слоты кода страны и ОДИН пробел-разделитель
 * перед `plan.pattern` (например, cc `'7'` + pattern `'(###) …'` → `'+# (###) …'`).
 * Если `pattern` уже начинается со своего разделителя — пробел может задвоиться;
 * пишите `pattern` без ведущего разделителя.
 */
export function dialPlanToCandidate(plan: DialPlan): PhoneMaskCandidate {
  const hasPlus = plan.hasPlus !== false;
  const prefixDigits = plan.cc;
  return {
    id: plan.id ?? plan.cc,
    cc: plan.cc,
    prefix: hasPlus ? `+${plan.cc}` : plan.cc,
    prefixDigits,
    mask: `${hasPlus ? '+' : ''}${'#'.repeat(plan.cc.length)} ${plan.pattern}`,
    label: plan.label,
  };
}
