import { type ReactNode } from 'react';
import cx from 'clsx';

import { useLang } from '@/shared/i18n';
import { useCopyToClipboard } from '@/shared/lib';
import { SyntaxSwitch } from '@/shared/ui/SyntaxSwitch';

import styles from './CodeBlockHeader.module.scss';

type CodeBlockHeaderProps = {
  code: string;
  title?: ReactNode;
  onClose?: () => void;
  className?: string;
  lang?: string;
  hasJsVariant?: boolean;
};

export function CodeBlockHeader({
  code,
  title = '',
  onClose = undefined,
  className = '',
  lang = 'tsx',
  hasJsVariant = false,
}: CodeBlockHeaderProps) {
  const { t } = useLang();
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className={cx(styles.header, className)}>
      {title && <div className={styles.header__title}>{title}</div>}
      <div className={styles.header__actions}>
        {hasJsVariant ? <SyntaxSwitch /> : <span className={styles.header__badge}>{lang}</span>}
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
