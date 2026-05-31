import { DEFAULT_GHOST_CHAR } from '@/shared/lib';
import { type OptionSchema } from '@/shared/ui/Playground';

function parseCommaSeparated(v: string): string[] | null {
  const items = v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

export const USEMASK_SCHEMA: OptionSchema = [
  { type: 'bool', key: 'trimMaskTail' },
  { type: 'bool', key: 'alwaysActive' },
  { type: 'bool', key: 'activateOnFocus' },
  { type: 'bool', key: 'deactivateOnEmptyBlur', requiresParent: 'activateOnFocus' },
  { type: 'divider' },
  { type: 'str', key: 'prefixAliases', placeholder: '+7, 8', defaultValue: '+7, 8', transform: parseCommaSeparated },
  {
    type: 'str',
    key: 'ghostChar',
    placeholder: DEFAULT_GHOST_CHAR,
    maxLength: 1,
    defaultValue: DEFAULT_GHOST_CHAR,
    fallback: DEFAULT_GHOST_CHAR,
  },
];

export type UseMaskOptions = {
  prefixAliases?: string[];
  placeholderChar?: string;
  activateOnFocus?: boolean;
  deactivateOnEmptyBlur?: boolean;
  trimMaskTail?: boolean;
  ghostChar?: string;
  alwaysActive?: boolean;
};
