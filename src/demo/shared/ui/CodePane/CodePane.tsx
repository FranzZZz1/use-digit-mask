import cx from 'clsx';

import styles from './CodePane.module.scss';

type CodePaneProps = {
  html: string;
  isLoading: boolean;
  lineCount: number;
  gutter?: boolean;
};

export function CodePane({ html, isLoading, lineCount, gutter }: CodePaneProps) {
  const gutterNode = gutter && (
    <div className={styles.pane__gutter} aria-hidden="true">
      {Array.from({ length: lineCount }, (_, i) => (
        <span key={i} className={styles['pane__gutter-num']}>
          {i + 1}
        </span>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className={cx(styles.pane, styles['pane--loading'])}>
        {gutterNode}
        <div className={styles.pane__code}>
          <pre className={styles.pane__skeleton} aria-hidden="true">
            {Array.from({ length: lineCount }, () => ' ').join('\n')}
          </pre>
        </div>
        <div className={styles['pane__spinner-overlay']}>
          <span className={styles.pane__spinner} aria-label="Loading…" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pane}>
      {gutterNode}
      <div className={styles.pane__code} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
