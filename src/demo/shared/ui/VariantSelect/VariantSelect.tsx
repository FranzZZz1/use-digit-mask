import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import cx from 'clsx';

import styles from './VariantSelect.module.scss';

export type VariantSelectOption<T extends string | number = number> = {
  label: string;
  value: T;
};

type VariantSelectProps<T extends string | number = number> = {
  options: VariantSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  triggerClassName?: string;
};

export function VariantSelect<T extends string | number = number>({
  options,
  value,
  onChange,
  triggerClassName = '',
}: VariantSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.value === value)?.label ?? '';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={cx(styles.trigger, triggerClassName)}>
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
