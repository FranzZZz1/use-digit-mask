import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import cx from 'clsx';
import { type DialPlan } from 'use-digit-mask';

import { getFlag } from '../../utils/getFlag';

import styles from './CountrySelect.module.scss';

type CountryTriggerProps = Omit<ComponentPropsWithoutRef<'button'>, 'onClick'> & {
  currentPlan: DialPlan | undefined;
  isOpen: boolean;
  onClick?: () => void;
};

export const CountryTrigger = forwardRef<HTMLButtonElement, CountryTriggerProps>(
  ({ currentPlan, isOpen, onClick, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      className={styles.trigger}
      aria-label="Select country"
      aria-haspopup="listbox"
      onClick={onClick}
      {...rest}
    >
      <span className={styles.flag}>{getFlag(currentPlan?.id)}</span>
      <span className={styles.cc}>{currentPlan ? `+${currentPlan.cc}` : '+'}</span>
      <span className={cx(styles.arrow, isOpen && styles['arrow--open'])}>▾</span>
    </button>
  ),
);
