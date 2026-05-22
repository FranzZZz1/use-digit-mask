import { useCountrySelect } from './docs/useCountrySelect';
import { useMask } from './docs/useMask';
import { usePhoneMask } from './docs/usePhoneMask';
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
  docs: { useMask, usePhoneMask, useCountrySelect },
};
