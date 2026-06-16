import { DEFAULT_GHOST_CHAR } from '@/shared/lib';
import { type HookArg } from '@/shared/lib/snippetUtils';
import { type OptionsState, type StrOptionState } from '@/shared/ui/Playground';

export function pushBoolArg(args: HookArg[], state: OptionsState, key: string): void {
  if (state[key]?.enabled) args.push({ key, value: true });
}

export function readGhostState(state: OptionsState): {
  withGhost: boolean;
  ghostCharValue: string;
  withGhostOnlyWhenResolved: boolean;
} {
  const withGhost = state.ghostChar?.enabled ?? false;
  const ghostCharValue = (state.ghostChar as StrOptionState | undefined)?.value || DEFAULT_GHOST_CHAR;
  const withGhostOnlyWhenResolved = withGhost && (state.ghostOnlyWhenResolved?.enabled ?? false);
  return { withGhost, ghostCharValue, withGhostOnlyWhenResolved };
}
