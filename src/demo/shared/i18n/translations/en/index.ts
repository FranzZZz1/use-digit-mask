import { type Translation } from '@/shared/i18n';

import { useCountrySelect } from './docs/useCountrySelect.en';
import { useDateMask } from './docs/useDateMask.en';
import { useMask } from './docs/useMask.en';
import { usePhoneMask } from './docs/usePhoneMask.en';
import { changelogEntries } from './changelog';
import { changelog, code, nav, sections } from './common';
import { demo } from './demo';
import { toc } from './toc';

export const en: Translation = {
  nav,
  demo,
  code,
  sections,
  changelog: { ...changelog, entries: changelogEntries },
  toc,
  docs: { useMask, useDateMask, usePhoneMask, useCountrySelect },
};
