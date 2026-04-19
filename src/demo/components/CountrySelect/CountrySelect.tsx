import { Fragment } from 'react';
import cx from 'clsx';
import { type DialPlan, type PhoneMaskCandidate, useCountrySelect } from 'use-digit-mask';

import styles from './CountrySelect.module.scss';

function getFlag(id?: string): string {
  if (!id) return '🌐';

  const iso = id.slice(0, 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(iso)) return '🌐';

  return [...iso].map((c) => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6)).join('');
}

type CountrySelectProps = {
  allPlans: DialPlan[];
  currentId: string | null;
  onSelect: (plan: DialPlan) => void;
  candidates?: PhoneMaskCandidate[];
  priorityIds?: string[];
  stickyPins?: boolean;
};

export function CountrySelect({
  allPlans,
  currentId,
  onSelect,
  candidates,
  priorityIds,
  stickyPins,
}: CountrySelectProps) {
  const { isOpen, toggle, query, setQuery, currentPlan, items, dividerAfter, containerRef, searchRef, select } =
    useCountrySelect({ allPlans, currentId, onSelect, candidates, priorityIds, stickyPins });

  return (
    <div ref={containerRef} className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Select country"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={toggle}
      >
        <span className={styles.flag}>{getFlag(currentPlan?.id)}</span>
        <span className={styles.cc}>{currentPlan ? `+${currentPlan.cc}` : '+'}</span>
        <span className={cx(styles.arrow, isOpen && styles['arrow--open'])}>▾</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.search__wrapper}>
            <input
              ref={searchRef}
              className={styles.search}
              value={query}
              placeholder="Search country or code…"
              onChange={(e) => {
                setQuery(e.target.value);
              }}
            />
          </div>

          <ul className={styles.list}>
            {items.length === 0 && <li className={styles.empty}>No countries found</li>}
            {items.map((plan, index) => (
              <Fragment key={plan.id ?? plan.cc}>
                {index === dividerAfter && <li className={styles.divider} role="separator" aria-hidden="true" />}
                <li
                  role="option"
                  aria-selected={plan.id === currentId}
                  className={cx(styles.item, plan.id === currentId && styles['item--active'])}
                  onClick={() => {
                    select(plan);
                  }}
                >
                  <span className={styles.item__flag}>{getFlag(plan.id)}</span>
                  <span className={styles.item__label}>{plan.label ?? plan.cc}</span>
                  <span className={styles.item__cc}>+{plan.cc}</span>
                </li>
              </Fragment>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
