import { DEFAULT_GHOST_CHAR } from '@/shared/lib';
import { type OptionSchema } from '@/shared/ui/Playground';

function parseCommaSeparated(v: string): string[] | null {
  const items = v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

export const USECOUNTRYSELECT_SCHEMA: OptionSchema = [
  { type: 'bool', key: 'trimMaskTail', alwaysSerialize: true },
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
  {
    type: 'str',
    key: 'ghostChar',
    placeholder: DEFAULT_GHOST_CHAR,
    maxLength: 1,
    defaultValue: DEFAULT_GHOST_CHAR,
    fallback: DEFAULT_GHOST_CHAR,
  },
  { type: 'bool', key: 'ghostOnlyWhenResolved', requiresParent: 'ghostChar' },
];

export type UseCountrySelectOptions = {
  trimMaskTail?: boolean;
  stickyPins?: boolean;
  disableSort?: boolean;
  priorityIds?: string[];
  ghost?: boolean;
  ghostChar?: string;
  ghostOnlyWhenResolved?: boolean;
};
