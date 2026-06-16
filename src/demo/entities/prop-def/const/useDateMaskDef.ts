import { type PropDef } from './useMaskDef';

export const USE_DATE_MASK_PARAMS: PropDef[] = [
  { name: 'format', type: 'string', required: true },
  { name: 'value', type: 'string', required: true },
  { name: 'onChange', type: '(value: string, parsed: ParsedValues) => void', required: true },
  { name: 'min', type: 'Date | string', default: 'undefined' },
  { name: 'max', type: 'Date | string', default: 'undefined' },
];
