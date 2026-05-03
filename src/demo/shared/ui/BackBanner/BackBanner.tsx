import cx from 'clsx';

import { useLang } from '@/shared/i18n';
import { useDocsNavigate } from '@/shared/lib';
import { type BackTo } from '@/shared/types';

import styles from './BackBanner.module.scss';

type Props = {
  backTo: BackTo;
  isClosing: boolean;
  onDismiss: () => void;
  onClosed: () => void;
  className?: string;
};

export function BackBanner({ backTo, isClosing, onDismiss, onClosed, className = '' }: Props) {
  const navigate = useDocsNavigate();
  const { t } = useLang();

  const handleBack = () => {
    onClosed();
    navigate(backTo.path, { scrollTo: backTo.sectionId });
  };

  const handleAnimationEnd = () => {
    if (isClosing) {
      onClosed();
    }
  };

  const tocKey = backTo.hookLabel as keyof typeof t.toc;
  const entry = t.toc[tocKey]?.find((e) => e.id === backTo.sectionId);
  const sectionLabel = entry?.dativeLabel ?? entry?.label ?? backTo.sectionId;

  return (
    <div
      className={cx(styles.banner, isClosing && styles['banner--closing'], className)}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={styles.banner__inner}>
        <button type="button" className={styles.banner__back} onClick={handleBack}>
          <span className={styles['banner__back-label']}>
            ←&nbsp;{t.sections.backTo}&nbsp;<span className={styles.banner__section}>{sectionLabel}</span>
            <span className={styles.banner__sep}>&nbsp;·&nbsp;</span>
            <span className={styles.banner__hook}>{backTo.hookLabel}</span>
          </span>
        </button>
        <button
          type="button"
          className={styles.banner__dismiss}
          aria-label={t.sections.backToDismiss}
          onClick={onDismiss}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
