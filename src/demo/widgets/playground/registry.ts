import { type VariantSelectOption } from '@/shared/ui/VariantSelect';

export type PlaygroundId = 'useMask' | 'usePhoneMask' | 'useCountrySelect';

type PlaygroundMeta = { readonly id: PlaygroundId; readonly label: string };

const PLAYGROUND_REGISTRY = {
  useMask: { id: 'useMask', label: 'useMask' },
  usePhoneMask: { id: 'usePhoneMask', label: 'usePhoneMask' },
  useCountrySelect: { id: 'useCountrySelect', label: 'useCountrySelect' },
} as const satisfies Record<PlaygroundId, PlaygroundMeta>;

export const PLAYGROUND_IDS = Object.keys(PLAYGROUND_REGISTRY) as PlaygroundId[];

export const PLAYGROUND_OPTIONS: VariantSelectOption[] = PLAYGROUND_IDS.map((id, i) => ({
  value: i,
  label: id,
}));

export const PLAYGROUND_INDEX = Object.fromEntries(PLAYGROUND_IDS.map((id, i) => [id, i])) as Record<
  PlaygroundId,
  number
>;
