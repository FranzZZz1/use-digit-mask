import { type RefObject } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { type DialPlan, type PhoneMaskCandidate, useCountrySelect } from 'use-digit-mask';

import { CountryDropdownBody } from './CountryDropdownBody';
import { CountryTrigger } from './CountryTrigger';

import styles from './CountrySelect.module.scss';

type CountrySelectRadixProps = {
  allPlans: DialPlan[];
  currentId: string | null;
  onSelect: (plan: DialPlan) => void;
  candidates?: PhoneMaskCandidate[];
  priorityIds?: string[];
  stickyPins?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
};

export function CountrySelectRadix({
  allPlans,
  currentId,
  onSelect,
  candidates,
  priorityIds,
  stickyPins,
  inputRef,
}: CountrySelectRadixProps) {
  const { isOpen, toggle, close, query, setQuery, currentPlan, items, dividerAfter, searchRef, select } =
    useCountrySelect({
      allPlans,
      currentId,
      onSelect,
      candidates,
      priorityIds,
      stickyPins,
      inputRef,
      noInternalListeners: true,
    });

  return (
    <div className={styles.root}>
      <Popover.Root
        open={isOpen}
        onOpenChange={(open) => {
          !open && close();
        }}
      >
        <Popover.Trigger asChild>
          <CountryTrigger currentPlan={currentPlan} isOpen={isOpen} onClick={toggle} />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={styles.content}
            sideOffset={4}
            align="start"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              searchRef.current?.focus();
            }}
          >
            <CountryDropdownBody
              query={query}
              items={items}
              currentId={currentId}
              dividerAfter={dividerAfter}
              searchRef={searchRef}
              onQueryChange={setQuery}
              onSelect={select}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
