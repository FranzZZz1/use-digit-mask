import { MaskField } from '@/entities/phone-input';
import { useLang } from '@/shared/i18n';

import {
  buildCodeAlwaysActive,
  buildCodeGhostMask,
  buildCodeNormalize,
  buildCodePhoneRu,
  buildCodePin,
  CODE_CREDIT_CARD,
  CODE_DATE,
} from '../lib/useMaskCode';
import { type DemoCardConfig } from '../types';

function normalizeTime(digits: string): string {
  let result = digits;

  if (result.length >= 2) {
    const hh = Math.min(parseInt(result.slice(0, 2), 10), 23);
    result = String(hh).padStart(2, '0') + result.slice(2);
  }

  if (result.length >= 4) {
    const mm = Math.min(parseInt(result.slice(2, 4), 10), 59);
    result = result.slice(0, 2) + String(mm).padStart(2, '0');
  }

  return result;
}

export function useMaskCards(): DemoCardConfig[] {
  const { t } = useLang();
  const c = t.demo.cards;
  const cc = t.demo.codeComments;
  const [ghostMaskAlways, ghostMaskHide] = buildCodeGhostMask(cc);

  return [
    {
      id: 'phone-ru',
      title: c.phoneRu.title,
      description: c.phoneRu.desc,
      code: buildCodePhoneRu(cc),
      component: (
        <MaskField activateOnFocus deactivateOnEmptyBlur mask="+7 (###) ###-##-##" allowedPrefixes={['+7', '8']} />
      ),
    },
    {
      id: 'credit-card',
      title: c.creditCard.title,
      description: c.creditCard.desc,
      code: CODE_CREDIT_CARD,
      component: <MaskField mask="#### #### #### ####" />,
    },
    {
      id: 'date',
      title: c.date.title,
      description: c.date.desc,
      code: CODE_DATE,
      component: <MaskField mask="##/##/####" />,
    },
    {
      id: 'pin',
      title: c.pin.title,
      description: c.pin.desc,
      code: buildCodePin(cc),
      component: <MaskField trimMaskTail mask="####" />,
    },
    {
      id: 'normalize',
      title: c.normalize.title,
      description: c.normalize.desc,
      code: buildCodeNormalize(cc),
      component: <MaskField mask="##:##" normalize={normalizeTime} />,
    },
    {
      id: 'always-active',
      title: c.alwaysActive.title,
      description: c.alwaysActive.desc,
      code: buildCodeAlwaysActive(cc),
      component: <MaskField alwaysActive mask="+7 (###) ###-##-##" allowedPrefixes={['+7', '8']} />,
    },
    {
      id: 'ghost-mask',
      title: c.ghostMask.title,
      description: c.ghostMask.desc,
      variants: [
        {
          label: 'Always',
          component: <MaskField ghost trimMaskTail mask="#### #### #### ####" ghostChar="·" />,
          code: ghostMaskAlways,
        },
        {
          label: 'Hide on input',
          component: <MaskField ghost hideGhostOnInput trimMaskTail mask="#### #### #### ####" ghostChar="·" />,
          code: ghostMaskHide,
        },
      ],
    },
  ];
}
