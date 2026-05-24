import { getTabCode, useHighlighted, useSyntax } from '@/shared/lib';
import { type CodeTab } from '@/shared/lib/snippetUtils';

import { CodeBlockHeader } from '../CodeBlockHeader';
import { CodePane } from '../CodePane';

import styles from './DocCodeBlock.module.scss';

type Props = {
  tab: CodeTab;
  label?: string;
};

export function DocCodeBlock({ tab, label }: Props) {
  const { syntax } = useSyntax();
  const code = getTabCode(tab, syntax);

  const { html, isLoading } = useHighlighted(code, tab.lang);

  return (
    <div className={styles.block}>
      <CodeBlockHeader
        title={label ? <span className={styles.block__label}>{label}</span> : undefined}
        code={code}
        jsVariant={tab.jsVariant}
        className={styles.block__header}
      />

      <div className={styles.block__body}>
        <CodePane html={html} isLoading={isLoading} />
      </div>
    </div>
  );
}
