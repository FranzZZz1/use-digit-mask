import styles from './CodePane.module.scss';

type CodePaneProps = {
  html: string;
  isLoading: boolean;
  lineCount?: number;
};

export function CodePane({ html, isLoading, lineCount }: CodePaneProps) {
  if (isLoading) {
    return (
      <div className={styles['pane__spinner-wrapper']}>
        <span className={styles.pane__spinner} aria-label="Loading…" />
      </div>
    );
  }

  return (
    <div className={styles.pane}>
      {lineCount !== undefined && (
        <div className={styles.pane__gutter} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i} className={styles['pane__gutter-num']}>
              {i + 1}
            </span>
          ))}
        </div>
      )}
      <div className={styles.pane__code} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
