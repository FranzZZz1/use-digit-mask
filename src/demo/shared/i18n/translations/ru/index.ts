import { useCountrySelect } from './docs/useCountrySelect.ru';
import { useDateMask } from './docs/useDateMask.ru';
import { useMask } from './docs/useMask.ru';
import { usePhoneMask } from './docs/usePhoneMask.ru';
import { changelogEntries } from './changelog';
import { changelog, code, nav, sections } from './common';
import { demo } from './demo';
import { toc } from './toc';

export const ru = {
  nav,
  demo,
  code,
  sections,
  changelog: { ...changelog, entries: changelogEntries },
  toc,
  docs: { useMask, useDateMask, usePhoneMask, useCountrySelect },
};
