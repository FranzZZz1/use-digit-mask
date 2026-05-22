import { type ReactNode } from 'react';
import cx from 'clsx';

import styles from './CodeTabBar.module.scss';

type Variant = 'underline' | 'pill';

const DEFAULT_VARIANT: Variant = 'underline';

type Props = {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
  variant?: Variant;
  actions?: ReactNode;
};

export function CodeTabBar({ tabs, activeTab, onTabChange, variant = DEFAULT_VARIANT, actions }: Props) {
  const hasTabs = tabs.length > 0;

  return (
    <div
      role={hasTabs ? 'tablist' : undefined}
      className={cx(styles.bar, styles[`bar--${variant}`], !hasTabs && styles['bar--actions-only'])}
    >
      {hasTabs &&
        tabs.map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={activeTab === index}
            className={cx(styles.tab, styles[`tab--${variant}`], activeTab === index && styles['tab--active'])}
            onClick={() => {
              onTabChange(index);
            }}
          >
            {label}
          </button>
        ))}

      {actions && <div className={cx(styles.actions, styles[`actions--${variant}`])}>{actions}</div>}
    </div>
  );
}
