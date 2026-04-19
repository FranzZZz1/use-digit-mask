import { type ReactNode, useEffect, useState } from 'react';

import { highlightTsx } from '../../utils/highlight';
import { Modal } from '../Modal';

import styles from './CodeModal.module.scss';

type CodeModalProps = {
  title: string;
  code: string;
  onClose: () => void;
  children: ReactNode;
};

export function CodeModal({ title, code, onClose, children }: CodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    highlightTsx(code).then((html) => {
      if (mounted) setHighlighted(html);
    });

    return () => {
      mounted = false;
    };
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1800);
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={styles.header__actions}>
          <span className={styles.lang__badge}>tsx</span>
          <button type="button" className={styles.copy__btn} title="Copy code" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button type="button" className={styles.close__btn} aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.preview}>
          <p className={styles.preview__label}>Preview</p>
          <div className={styles.preview__content}>{children}</div>
        </div>

        <div className={styles.code__panel}>
          {/* eslint-disable-next-line react/no-danger */}
          <div className={styles.code} dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
      </div>
    </Modal>
  );
}
