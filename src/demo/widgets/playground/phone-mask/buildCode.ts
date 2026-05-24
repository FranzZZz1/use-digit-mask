import { DEFAULT_GHOST_CHAR, DEFAULT_PLACEHOLDER_CHAR } from '@/shared/lib';
import {
  buildMaskCodeTab,
  dedent,
  ghostOverlayJsx,
  type HookArg,
  type ImportSpec,
  indentLines,
  type MaskTabOpts,
  numericInput,
} from '@/shared/lib/snippetUtils';
import { type OptionsState, type StrOptionState } from '@/shared/ui/Playground';

const CANDIDATES_JSX = dedent`
  <section>
${indentLines(numericInput(), 4)}
    {candidates.length > 1 && (
      <fieldset>
        <legend>Select country</legend>
        {candidates.map((c) => (
          <button key={c.id} type="button" onClick={() => selectCandidate(c)}>
            {c.label} {c.prefix}
          </button>
        ))}
      </fieldset>
    )}
  </section>
`;

function collectBasePhoneArgs(placeholderChar: string, state: OptionsState): HookArg[] {
  const args: HookArg[] = [];

  if (state.trimMaskTail?.enabled) {
    args.push({ key: 'trimMaskTail', value: true });
  }
  if (placeholderChar && placeholderChar !== DEFAULT_PLACEHOLDER_CHAR) {
    args.push({ key: 'placeholderChar', value: placeholderChar });
  }

  return args;
}

function buildGhostPhoneTab(
  baseArgs: HookArg[],
  ghostCharValue: string,
  withGhostOnlyWhenResolved: boolean,
): ReturnType<typeof buildMaskCodeTab> {
  const hookOptions: HookArg[] = [...baseArgs, { key: 'ghostChar', value: ghostCharValue }];
  const destructure = withGhostOnlyWhenResolved ? '{ props, ghostValue, mask }' : '{ props, ghostValue }';
  const extraCondition = withGhostOnlyWhenResolved ? 'showGhost' : undefined;

  const extraImports: ImportSpec[] = [
    ...(withGhostOnlyWhenResolved ? [{ from: 'use-digit-mask', named: ['E164_MASK'] }] : []),
    { from: './PhoneField.module.scss', default: 'styles', isStyle: true },
  ];

  const extraVars = withGhostOnlyWhenResolved ? ['const showGhost = mask !== E164_MASK;'] : [];

  const tabOpts: MaskTabOpts = {
    hook: 'usePhoneMask',
    componentName: 'PhoneField',
    hookOptions,
    destructure,
    jsx: ghostOverlayJsx('Start typing a number...', extraCondition),
    extraImports,
    extraVars,
  };

  return buildMaskCodeTab('tsx', tabOpts);
}

function buildCandidatesPhoneTab(baseArgs: HookArg[]): ReturnType<typeof buildMaskCodeTab> {
  const tabOpts: MaskTabOpts = {
    hook: 'usePhoneMask',
    componentName: 'PhoneField',
    hookOptions: baseArgs,
    destructure: '{ props, candidates, selectCandidate }',
    jsx: CANDIDATES_JSX,
  };

  return buildMaskCodeTab('tsx', tabOpts);
}

export function buildUsePhoneMaskTab(
  placeholderChar: string,
  state: OptionsState,
): ReturnType<typeof buildMaskCodeTab> {
  const withGhost = state.ghostChar?.enabled ?? false;
  const withGhostOnlyWhenResolved = withGhost && (state.ghostOnlyWhenResolved?.enabled ?? false);
  const ghostCharValue = (state.ghostChar as StrOptionState | undefined)?.value || DEFAULT_GHOST_CHAR;

  const baseArgs = collectBasePhoneArgs(placeholderChar, state);

  if (withGhost) {
    return buildGhostPhoneTab(baseArgs, ghostCharValue, withGhostOnlyWhenResolved);
  }

  return buildCandidatesPhoneTab(baseArgs);
}
