import { type CSSProperties, type RefObject, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  disableSort?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
};

export function CountrySelect({
  allPlans,
  currentId,
  onSelect,
  candidates,
  priorityIds,
  stickyPins,
  disableSort,
  inputRef,
}: CountrySelectProps) {
  const { isOpen, toggle, query, setQuery, currentPlan, items, dividerAfter, containerRef, searchRef, select } =
    useCountrySelect({ allPlans, currentId, onSelect, candidates, priorityIds, stickyPins, disableSort, inputRef });

  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    const el = containerRef.current;
    if (!el) return undefined;

    const update = () => {
      const rect = el.getBoundingClientRect();

      setDropdownStyle({
        top: rect.bottom + 8,
        left: rect.left,
      });
    };

    update();

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [containerRef, isOpen]);

  return (
    <div ref={containerRef} className={styles.root}>
      <CountryTrigger currentPlan={currentPlan} isOpen={isOpen} onClick={toggle} />

      {isOpen &&
        createPortal(
          // eslint-disable-next-line jsx-a11y/interactive-supports-focus
          <div
            className={styles.dropdown}
            style={dropdownStyle}
            role="listbox"
            onMouseDown={(e) => {
              e.nativeEvent.stopPropagation();
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
          </div>,
          document.body,
        )}
    </div>
  );
}
