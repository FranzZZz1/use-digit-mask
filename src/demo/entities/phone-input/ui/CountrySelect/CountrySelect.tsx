import { type RefObject } from 'react';
import { type DialPlan, type PhoneMaskCandidate, useCountrySelect } from 'use-digit-mask';

import { CountryDropdownBody } from './CountryDropdownBody';
import { CountryTrigger } from './CountryTrigger';

import styles from './CountrySelect.module.scss';

type CountrySelectProps = {
  allPlans: DialPlan[];
  currentId: string | null;
  onSelect: (plan: DialPlan) => void;
  candidates?: PhoneMaskCandidate[];
  priorityIds?: string[];
  stickyPins?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
};

export function CountrySelect({
  allPlans,
  currentId,
  onSelect,
  candidates,
  priorityIds,
  stickyPins,
  inputRef,
}: CountrySelectProps) {
  const { isOpen, toggle, query, setQuery, currentPlan, items, dividerAfter, containerRef, searchRef, select } =
    useCountrySelect({ allPlans, currentId, onSelect, candidates, priorityIds, stickyPins, inputRef });

  return (
    <div ref={containerRef} className={styles.root}>
      <CountryTrigger currentPlan={currentPlan} isOpen={isOpen} onClick={toggle} />

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          <CountryDropdownBody
            query={query}
            items={items}
            currentId={currentId}
            dividerAfter={dividerAfter}
            searchRef={searchRef}
            onQueryChange={setQuery}
            onSelect={select}
          />
        </div>
      )}
    </div>
  );
}
