import cx from 'clsx';

import styles from './Switch.module.scss';

type Props = {
  id: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
};

export function Switch({ id, checked, onChange, disabled }: Props) {
  return (
    <label className={cx(styles.switch, checked && styles['switch--on'])}>
      <input
        id={id}
        type="checkbox"
        className={styles.switch__input}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className={styles.switch__thumb} />
    </label>
  );
}
