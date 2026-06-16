import { type OptionSchema } from '@/shared/ui/Playground';

import {
  ENTRY_GHOST_CHAR,
  ENTRY_GHOST_ONLY_WHEN_RESOLVED,
  ENTRY_OVERWRITE,
  type GhostOptions,
  type OverwriteOption,
} from '../shared/schema';

function parseCommaSeparated(v: string): string[] | null {
  const items = v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

export const USECOUNTRYSELECT_SCHEMA: OptionSchema = [
  { type: 'bool', key: 'trimMaskTail', alwaysSerialize: true },
  ENTRY_OVERWRITE,
  { type: 'bool', key: 'stickyPins' },
  { type: 'bool', key: 'disableSort' },
  { type: 'divider' },
  {
    type: 'str',
    key: 'priorityIds',
    placeholder: 'US, GB, RU',
    defaultValue: 'US, GB, RU',
    defaultEnabled: true,
    transform: parseCommaSeparated,
  },
  ENTRY_GHOST_CHAR,
  ENTRY_GHOST_ONLY_WHEN_RESOLVED,
];

export type UseCountrySelectOptions = OverwriteOption &
  GhostOptions & {
    trimMaskTail?: boolean;
    stickyPins?: boolean;
    disableSort?: boolean;
    priorityIds?: string[];
    ghost?: boolean;
  };
