import { type Translation } from '@/shared/i18n';

import { useCountrySelect } from './docs/useCountrySelect';
import { useMask } from './docs/useMask';
import { usePhoneMask } from './docs/usePhoneMask';
import { code, nav, sections } from './common';
import { demo } from './demo';
import { toc } from './toc';

export const en: Translation = {
  nav,
  demo,
  code,
  sections,
  toc,
  docs: { useMask, usePhoneMask, useCountrySelect },
};
