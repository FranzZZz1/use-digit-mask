import { DateMaskField } from '@/entities/phone-input';
import { useLang } from '@/shared/i18n';

import {
  buildCodeDateMask,
  buildCodeDateMaskDatetime,
  buildCodeDateMaskIso,
  buildRecipeBirthDate,
  buildRecipeDateMax,
} from '../lib/useDateMaskCode';
import { type DemoCardConfig } from '../types';

export function useDateMaskCards(): DemoCardConfig[] {
  const { t } = useLang();
  const c = t.demo.cards;
  const cc = t.demo.codeComments;

  return [
    {
      id: 'date-dmy',
      title: 'dd/MM/yyyy',
      description: c.dateMask.desc,
      code: buildCodeDateMask(cc),
      component: <DateMaskField overwrite format="dd/MM/yyyy" />,
    },
    {
      id: 'date-iso',
      title: c.dateMaskIso.title,
      description: c.dateMaskIso.desc,
      code: buildCodeDateMaskIso(cc),
      component: <DateMaskField overwrite format="yyyy-MM-dd" />,
    },
    {
      id: 'date-max',
      title: c.dateMaskMax.title,
      description: c.dateMaskMax.desc,
      code: [buildRecipeDateMax(cc)],
      component: <DateMaskField overwrite format="dd/MM/yyyy" max={new Date()} />,
    },
    {
      id: 'date-birth',
      title: c.dateMaskBirth.title,
      description: c.dateMaskBirth.desc,
      code: [buildRecipeBirthDate(cc)],
      component: (
        <DateMaskField
          overwrite
          format="dd/MM/yyyy"
          min={new Date('1900-01-01')}
          max={new Date(new Date().getFullYear(), 11, 31)}
        />
      ),
    },
    {
      id: 'date-datetime',
      title: c.dateMaskDatetime.title,
      description: c.dateMaskDatetime.desc,
      code: buildCodeDateMaskDatetime(cc),
      component: <DateMaskField overwrite format="dd.MM.yyyy HH:mm" />,
    },
  ];
}
