import  { type PropDef } from './useMaskDef';

export const USE_COUNTRY_SELECT_PARAMS: PropDef[] = [
  { name: 'allPlans', type: 'DialPlan[]', required: true },
  { name: 'onSelect', type: '(plan: DialPlan) => void', required: true },
  { name: 'currentId', type: 'string | null' },
  { name: 'candidates', type: 'PhoneMaskCandidate[]' },
  { name: 'priorityIds', type: 'string[]' },
  { name: 'stickyPins', type: 'boolean', default: 'false' },
  { name: 'inputRef', type: 'RefObject<HTMLInputElement | null>' },
  { name: 'disableSort', type: 'boolean', default: 'false' },
  { name: 'noInternalListeners', type: 'boolean', default: 'false' },
];

export const USE_COUNTRY_SELECT_RETURN_VALUES: PropDef[] = [
  { name: 'isOpen', type: 'boolean' },
  { name: 'toggle', type: '() => void' },
  { name: 'close', type: '() => void' },
  { name: 'query', type: 'string' },
  { name: 'setQuery', type: '(q: string) => void' },
  { name: 'currentPlan', type: 'DialPlan | undefined' },
  { name: 'items', type: 'DialPlan[]' },
  { name: 'dividerAfter', type: 'number' },
  { name: 'containerRef', type: 'RefObject<HTMLDivElement>' },
  { name: 'searchRef', type: 'RefObject<HTMLInputElement>' },
  { name: 'select', type: '(plan: DialPlan) => void' },
];
