import { type ReactNode } from 'react';
import cx from 'clsx';

import { useLang } from '@/shared/i18n';
import { useCopyToClipboard } from '@/shared/lib';

import styles from './CodeBlockHeader.module.scss';

type CodeBlockHeaderProps = {
  code: string;
  title?: ReactNode;
  onClose?: () => void;
  className?: string;
};

export function CodeBlockHeader({ code, title = '', onClose = undefined, className = '' }: CodeBlockHeaderProps) {
  const { t } = useLang();
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className={cx(styles.header, className)}>
      {title && <div className={styles.header__title}>{title}</div>}
      <div className={styles.header__actions}>
        <span className={styles.header__badge}>tsx</span>
        <button
          type="button"
          className={styles.header__copy}
          onClick={() => {
            copy(code);
          }}
        >
          {copied ? t.code.copied : t.code.copy}
        </button>
        {onClose && (
          <button type="button" className={styles.header__close} aria-label={t.code.close} onClick={onClose}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
