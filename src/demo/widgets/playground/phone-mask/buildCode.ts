import { DEFAULT_GHOST_CHAR, DEFAULT_PLACEHOLDER_CHAR } from '@/shared/lib';
import {
  basicMaskTab,
  dedent,
  GHOST_SCSS,
  ghostOverlayJsx,
  indentLines,
  numericInput,
} from '@/shared/lib/snippetUtils';
import { type OptionsState, type StrOptionState } from '@/shared/ui/Playground';

export { GHOST_SCSS };

const BASIC_PHONE_JSX = dedent`
  <div>
${indentLines(numericInput(), 4)}
    {candidates.length > 1 && (
      <div>
        {candidates.map((c) => (
          <button key={c.id} onClick={() => selectCandidate(c)}>
            {c.label} {c.prefix}
          </button>
        ))}
      </div>
    )}
  </div>
`;

export function buildUsePhoneMaskCode(placeholderChar: string, state: OptionsState, isAlternative: boolean): string {
  const withGhost = state.ghostChar?.enabled ?? false;
  const withGhostOnlyWhenResolved = withGhost && (state.ghostOnlyWhenResolved?.enabled ?? false);
  const ghostCharValue = (state.ghostChar as StrOptionState | undefined)?.value || DEFAULT_GHOST_CHAR;
  const trimMaskTail = state.trimMaskTail?.enabled ?? false;

  const hookOpts: string[] = [];
  if (trimMaskTail) hookOpts.push('trimMaskTail: true,');
  if (placeholderChar && placeholderChar !== DEFAULT_PLACEHOLDER_CHAR) {
    hookOpts.push(`placeholderChar: '${placeholderChar}',`);
  }

  if (withGhost) {
    hookOpts.push(`ghostChar: '${ghostCharValue}',`);

    const destructure = withGhostOnlyWhenResolved ? '{ props, ghostValue, mask }' : '{ props, ghostValue }';
    const extraCondition = withGhostOnlyWhenResolved ? 'showGhost' : undefined;
    const e164Import = withGhostOnlyWhenResolved ? "import { E164_MASK } from 'use-digit-mask';\n" : '';

    const codeTab = basicMaskTab('tsx', {
      hook: 'usePhoneMask',
      componentName: 'PhoneField',
      hookOptions: hookOpts,
      destructure,
      jsx: ghostOverlayJsx('Start typing a number...', extraCondition),
      extraImports: [`${e164Import}import styles from './PhoneField.module.scss';`].join('\n'),
    });

    const baseCode = !isAlternative ? codeTab.code : (codeTab.codeJs ?? codeTab.code);

    if (withGhostOnlyWhenResolved) {
      const showGhostLine = '\n\n  const showGhost = mask !== E164_MASK;';
      const insertBefore = '\n\n  return (';
      return baseCode.replace(insertBefore, `${showGhostLine}${insertBefore}`);
    }

    return baseCode;
  }

  const codeTab = basicMaskTab('tsx', {
    hook: 'usePhoneMask',
    componentName: 'PhoneField',
    hookOptions: hookOpts,
    destructure: '{ props, candidates, selectCandidate }',
    jsx: BASIC_PHONE_JSX,
  });

  return !isAlternative ? codeTab.code : (codeTab.codeJs ?? codeTab.code);
}
