import cx from 'clsx';

import { useLang } from '@/shared/i18n';
import { type Syntax, useSyntax } from '@/shared/lib';

import styles from './SyntaxSwitch.module.scss';

type SyntaxOption = { value: Syntax; label: string };

export function SyntaxSwitch() {
  const { t } = useLang();
  const { syntax, setSyntax } = useSyntax();

  const options: SyntaxOption[] = [
    { value: 'ts', label: t.code.ts },
    { value: 'js', label: t.code.js },
  ];

  return (
    <div className={styles.switch}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={cx(styles.switch__btn, syntax === opt.value && styles['switch__btn--active'])}
          onClick={() => {
            setSyntax(opt.value);
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
