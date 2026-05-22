import { useHighlighted, useSyntax } from '@/shared/lib';

import { CodeBlockHeader } from '../CodeBlockHeader';
import { CodePane } from '../CodePane';

import styles from './DocCodeBlock.module.scss';

type Props = {
  code: string;
  codeJs?: string;
  label?: string;
};

export function DocCodeBlock({ code, codeJs, label }: Props) {
  const { isAlternative } = useSyntax();
  const activeCode = isAlternative && codeJs !== undefined ? codeJs : code;

  const { html, isLoading } = useHighlighted(activeCode);

  return (
    <div className={styles.block}>
      <CodeBlockHeader
        title={label ? <span className={styles.block__label}>{label}</span> : undefined}
        code={activeCode}
        hasJsVariant={codeJs !== undefined}
        className={styles.block__header}
      />

      <div className={styles.block__body}>
        <CodePane html={html} isLoading={isLoading} />
      </div>
    </div>
  );
}
