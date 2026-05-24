import { DEFAULT_GHOST_CHAR } from '@/shared/lib';
import {
  ghostOverlayJsx,
  type HookArg,
  indentLines,
  numericInput,
  rawCode,
  renderHookOptions,
} from '@/shared/lib/snippetUtils';
import { type OptionsState, type StrOptionState } from '@/shared/ui/Playground';

function parsePriorityIds(v: string): string[] {
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

type PhoneMaskSectionOpts = {
  withGhost: boolean;
  withGhostOnlyWhenResolved: boolean;
  ghostCharValue: string;
  trimMaskTail: boolean;
};

type PhoneMaskSection = {
  destructure: string;
  hookArgs: HookArg[];
  e164Import: string;
  scssImport: string;
  showGhostLine: string;
  inputJsx: string;
};

function buildPhoneMaskSection({
  withGhost,
  withGhostOnlyWhenResolved,
  ghostCharValue,
  trimMaskTail,
}: PhoneMaskSectionOpts): PhoneMaskSection {
  const hookArgs: HookArg[] = [];
  if (trimMaskTail) hookArgs.push({ key: 'trimMaskTail', value: true });
  if (withGhost) hookArgs.push({ key: 'ghostChar', value: ghostCharValue });

  const destructure = withGhost
    ? `{ props, ghostValue, ${withGhostOnlyWhenResolved ? 'mask, ' : ''}id, allPlans, selectPlan, candidates }`
    : '{ props, id, allPlans, selectPlan, candidates }';

  const e164Import = withGhostOnlyWhenResolved ? 'E164_MASK, ' : '';
  const scssImport = withGhost ? "\n\nimport styles from './PhoneWithCountry.module.scss';" : '';
  const showGhostLine = withGhostOnlyWhenResolved ? '\n\n  const showGhost = mask !== E164_MASK;' : '';

  const extraCondition = withGhostOnlyWhenResolved ? 'showGhost' : undefined;
  const inputJsx = withGhost
    ? indentLines(ghostOverlayJsx('Start typing a number...', extraCondition), 6)
    : indentLines(numericInput(), 6);

  return { destructure, hookArgs, e164Import, scssImport, showGhostLine, inputJsx };
}

type CountrySelectSectionOpts = {
  parsedIds: string[];
  stickyPins: boolean;
  disableSort: boolean;
};

function collectCountrySelectArgs({ parsedIds, stickyPins, disableSort }: CountrySelectSectionOpts): HookArg[] {
  const args: HookArg[] = [
    { key: 'allPlans', value: rawCode('allPlans') },
    { key: 'currentId', value: rawCode('id') },
    { key: 'onSelect', value: rawCode('selectPlan') },
    { key: 'candidates', value: rawCode('candidates') },
  ];

  if (parsedIds.length > 0) {
    args.push({ key: 'priorityIds', value: parsedIds });
  }
  if (stickyPins) args.push({ key: 'stickyPins', value: true });
  if (disableSort) args.push({ key: 'disableSort', value: true });

  return args;
}

function renderTemplate(phone: PhoneMaskSection, countrySelectArgs: HookArg[]): string {
  const phoneMaskArgsBlock = phone.hookArgs.length > 0 ? `\n${renderHookOptions(phone.hookArgs, 4)}` : '';
  const countrySelectArgsBlock = renderHookOptions(countrySelectArgs, 4);

  return `import { useState } from 'react';
import { ${phone.e164Import}usePhoneMask, useCountrySelect } from 'use-digit-mask';${phone.scssImport}

function PhoneWithCountry() {
  const [value, setValue] = useState('');

  const ${phone.destructure} = usePhoneMask({
    value,
    onChange: (next) => setValue(next),${phoneMaskArgsBlock}
  });${phone.showGhostLine}

  const {
    isOpen, toggle,
    query, setQuery,
    items, dividerAfter,
    containerRef, searchRef,
    select, currentPlan,
  } = useCountrySelect({
${countrySelectArgsBlock}
  });

  return (
    <section style={{ display: 'flex' }}>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <button type="button" aria-haspopup="listbox" aria-expanded={isOpen} onClick={toggle}>
          {currentPlan ? \`+\${currentPlan.cc}\` : '+'}
        </button>

        {isOpen && (
          <ul role="listbox" aria-label="Country">
            <li role="presentation">
              <input
                ref={searchRef}
                type="search"
                aria-label="Search country"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
              />
            </li>
            {items.map((plan, i) => (
              <li key={plan.id} role="option" aria-selected={plan.id === id} onClick={() => select(plan)}>
                {i === dividerAfter && <hr />}
                {plan.label} +{plan.cc}
              </li>
            ))}
          </ul>
        )}
      </div>

${phone.inputJsx}
    </section>
  );
}`;
}

export function buildUseCountrySelectCode(state: OptionsState): string {
  const withGhost = state.ghostChar?.enabled ?? false;
  const withGhostOnlyWhenResolved = withGhost && (state.ghostOnlyWhenResolved?.enabled ?? false);
  const ghostCharValue = (state.ghostChar as StrOptionState | undefined)?.value || DEFAULT_GHOST_CHAR;
  const trimMaskTail = state.trimMaskTail?.enabled ?? false;
  const stickyPins = state.stickyPins?.enabled ?? false;
  const disableSort = state.disableSort?.enabled ?? false;

  const priorityIdsOpt = state.priorityIds as StrOptionState | undefined;
  const parsedIds =
    priorityIdsOpt?.enabled && priorityIdsOpt.value.trim() ? parsePriorityIds(priorityIdsOpt.value) : [];

  const phone = buildPhoneMaskSection({ withGhost, withGhostOnlyWhenResolved, ghostCharValue, trimMaskTail });
  const countrySelectArgs = collectCountrySelectArgs({ parsedIds, stickyPins, disableSort });

  return renderTemplate(phone, countrySelectArgs);
}
