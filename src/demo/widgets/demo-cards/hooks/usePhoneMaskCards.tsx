import { PhoneField } from '@/entities/phone-input';
import { useLang } from '@/shared/i18n';

import { buildCodeGhostPhone, buildCodePhoneAuto } from '../lib/usePhoneMaskCode';
import { type DemoCardConfig } from '../types';

export function usePhoneMaskCards(): DemoCardConfig[] {
  const { t } = useLang();
  const c = t.demo.cards;
  const cc = t.demo.codeComments;

  return [
    {
      id: 'phone-auto',
      title: c.phoneAuto.title,
      description: c.phoneAuto.desc,
      code: buildCodePhoneAuto(cc),
      component: <PhoneField showCandidates />,
    },
    {
      id: 'ghost-phone',
      title: c.ghostPhone.title,
      description: c.ghostPhone.desc,
      code: buildCodeGhostPhone(cc),
      component: <PhoneField ghost ghostOnlyWhenResolved ghostChar="9" />,
    },
  ];
}
