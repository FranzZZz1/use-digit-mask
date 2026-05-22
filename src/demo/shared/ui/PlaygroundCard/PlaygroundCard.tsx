import { useLang } from '@/shared/i18n';

import styles from './PlaygroundCard.module.scss';

type Props = {
  onOpen: () => void;
};

export function PlaygroundCard({ onOpen }: Props) {
  const { t } = useLang();
  const c = t.demo.cards.playground;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{c.title}</h3>
        <p className={styles.desc}>{c.desc}</p>
      </div>

      <button type="button" className={styles.cta} onClick={onOpen}>
        {c.cta}
      </button>
    </div>
  );
}
