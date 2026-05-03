import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import cx from 'clsx';

import styles from './VariantSelect.module.scss';

export type VariantSelectOption = {
  label: string;
  value: number;
};

type VariantSelectProps = {
  options: VariantSelectOption[];
  value: number;
  onChange: (value: number) => void;
};

export function VariantSelect({ options, value, onChange }: VariantSelectProps) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.value === value)?.label ?? '';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={styles.trigger}>
        {currentLabel}
        <span className={styles.trigger__icon}>▾</span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className={styles.content} sideOffset={4} align="start">
          <ul role="listbox" className={styles.list}>
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={cx(styles.item, opt.value === value && styles['item--active'])}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
