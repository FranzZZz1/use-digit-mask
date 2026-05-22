import { PhoneField } from '@/entities/phone-input';
import { useLang } from '@/shared/i18n';

import { buildCodeCountrySelectRadix, buildCodePhoneCountrySelect } from '../lib/useCountrySelectCode';
import { type DemoCardConfig } from '../types';

export function useCountrySelectCards(): DemoCardConfig[] {
  const { t } = useLang();
  const c = t.demo.cards;
  const cc = t.demo.codeComments;

  return [
    {
      id: 'country-select',
      title: c.countrySelect.title,
      description: c.countrySelect.desc,
      variants: [
        {
          label: 'Custom',
          component: <PhoneField showCountrySelect priorityIds={['US', 'GB', 'RU']} />,
          code: buildCodePhoneCountrySelect(cc),
        },
        {
          label: 'Radix UI',
          badge: '@radix-ui/react-popover',
          component: <PhoneField showCountrySelect radixSelect priorityIds={['US', 'GB', 'RU']} />,
          code: buildCodeCountrySelectRadix(cc),
        },
      ],
    },
  ];
}
