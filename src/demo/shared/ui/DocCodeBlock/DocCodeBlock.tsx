import { useHighlighted } from '@/shared/lib';

import { CodeBlockHeader } from '../CodeBlockHeader';
import { CodePane } from '../CodePane';

import styles from './DocCodeBlock.module.scss';

type Props = {
  code: string;
  label?: string;
};

export function DocCodeBlock({ code, label }: Props) {
  const { html, isLoading } = useHighlighted(code);

  return (
    <div className={styles.block}>
      <CodeBlockHeader
        title={label ? <span className={styles.block__label}>{label}</span> : undefined}
        code={code}
        className={styles.block__header}
      />

      <div className={styles.block__body}>
        <CodePane html={html} isLoading={isLoading} />
      </div>
    </div>
  );
}
