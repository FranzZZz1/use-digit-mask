import { DEFAULT_GHOST_CHAR } from '@/shared/lib';
import { type OptionSchema } from '@/shared/ui/Playground';

export const USEPHONE_SCHEMA: OptionSchema = [
  { type: 'bool', key: 'trimMaskTail', alwaysSerialize: true },
  { type: 'divider' },
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

export type UsePhoneMaskOptions = {
  trimMaskTail?: boolean;
  placeholderChar?: string;
  ghostChar?: string;
  ghostOnlyWhenResolved?: boolean;
};
