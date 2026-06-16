import { Fragment, type RefObject } from 'react';
import cx from 'clsx';
import { type DialPlan } from 'use-digit-mask';

import { useLang } from '@/shared/i18n';

import { getFlag } from '../../utils/getFlag';

import styles from './CountrySelect.module.scss';

type CountryDropdownBodyProps = {
  query: string;
  onQueryChange: (q: string) => void;
  items: DialPlan[];
  currentId: string | null;
  dividerAfter: number;
  searchRef: RefObject<HTMLInputElement | null>;
  onSelect: (plan: DialPlan) => void;
};

export function CountryDropdownBody({
  query,
  onQueryChange,
  items,
  currentId,
  dividerAfter,
  searchRef,
  onSelect,
}: CountryDropdownBodyProps) {
  const { lang } = useLang();

  return (
    <>
      <div className={styles.search__wrapper}>
        <input
          ref={searchRef}
          className={styles.search}
          value={query}
          placeholder="Search country or code…"
          onChange={(e) => {
            onQueryChange(e.target.value);
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
                onSelect(plan);
              }}
            >
              <span className={styles.item__flag}>{getFlag(plan.id)}</span>
              <span className={styles.item__label}>{plan.label?.[lang] ?? plan.cc}</span>
              <span className={styles.item__cc}>+{plan.cc}</span>
            </li>
          </Fragment>
        ))}
      </ul>
    </>
  );
}
