import { DEFAULT_GHOST_CHAR } from '@/shared/lib';
import { dedent, GHOST_SCSS, ghostOverlayJsx, indentLines, numericInput } from '@/shared/lib/snippetUtils';
import { type OptionsState, type StrOptionState } from '@/shared/ui/Playground';

function parsePriorityIds(v: string): string[] {
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export { GHOST_SCSS };

export function buildUseCountrySelectCode(state: OptionsState): string {
  const withGhost = state.ghostChar?.enabled ?? false;
  const ghostCharValue = (state.ghostChar as StrOptionState | undefined)?.value || DEFAULT_GHOST_CHAR;
  const withGhostOnlyWhenResolved = withGhost && (state.ghostOnlyWhenResolved?.enabled ?? false);
  const trimMaskTail = state.trimMaskTail?.enabled ?? false;
  const stickyPins = state.stickyPins?.enabled ?? false;
  const disableSort = state.disableSort?.enabled ?? false;
  const priorityIdsOpt = state.priorityIds as StrOptionState | undefined;
  const parsedIds =
    priorityIdsOpt?.enabled && priorityIdsOpt.value.trim() ? parsePriorityIds(priorityIdsOpt.value) : [];

  const phoneMaskDestructure = withGhost
    ? `{ props, ghostValue, ${withGhostOnlyWhenResolved ? 'mask, ' : ''}id, allPlans, selectPlan, candidates }`
    : '{ props, id, allPlans, selectPlan, candidates }';
  const e164Import = withGhostOnlyWhenResolved ? 'E164_MASK, ' : '';
  const scssImportLine = withGhost ? "\n\n    import styles from './PhoneWithCountry.module.scss';" : '';
  const showGhostLine = withGhostOnlyWhenResolved ? '\n\n      const showGhost = mask !== E164_MASK;' : '';

  const phoneMaskOpts: string[] = [];
  if (trimMaskTail) phoneMaskOpts.push('trimMaskTail: true,');
  if (withGhost) phoneMaskOpts.push(`ghostChar: '${ghostCharValue}',`);
  const phoneMaskOptsBlock = phoneMaskOpts.length > 0 ? `\n${phoneMaskOpts.map((l) => `        ${l}`).join('\n')}` : '';
  const phoneInputJsx = withGhost
    ? indentLines(ghostOverlayJsx('Start typing a number...', withGhostOnlyWhenResolved ? 'showGhost' : undefined), 10)
    : indentLines(numericInput(), 10);

  const countrySelectOpts: string[] = ['allPlans,', 'currentId: id,', 'onSelect: selectPlan,', 'candidates,'];
  if (parsedIds.length > 0) {
    countrySelectOpts.push(`priorityIds: [${parsedIds.map((id) => `'${id}'`).join(', ')}],`);
  }
  if (stickyPins) countrySelectOpts.push('stickyPins: true,');
  if (disableSort) countrySelectOpts.push('disableSort: true,');

  const optsStr = countrySelectOpts.map((l) => `        ${l}`).join('\n');

  return dedent`
    import { useState } from 'react';
    import { ${e164Import}usePhoneMask, useCountrySelect } from 'use-digit-mask';${scssImportLine}

    function PhoneWithCountry() {
      const [value, setValue] = useState('');

      const ${phoneMaskDestructure} = usePhoneMask({
        value,
        onChange: (next) => setValue(next),${phoneMaskOptsBlock}
      });${showGhostLine}

      const {
        isOpen, toggle,
        query, setQuery,
        items, dividerAfter,
        containerRef, searchRef,
        select, currentPlan,
      } = useCountrySelect({
${optsStr}
      });

      return (
        <div style={{ display: 'flex' }}>
          <div ref={containerRef} style={{ position: 'relative' }}>
            <button onClick={toggle}>
              {currentPlan ? \`+\${currentPlan.cc}\` : '+'}
            </button>

            {isOpen && (
              <div role="listbox">
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                />
                {items.map((plan, i) => (
                  <div key={plan.id}>
                    {i === dividerAfter && <hr />}
                    <div role="option" onClick={() => select(plan)}>
                      {plan.label} +{plan.cc}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

${phoneInputJsx}
        </div>
      );
    }
  `;
}
