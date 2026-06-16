import { useMemo, useState } from 'react';

import { getTabCode, useHighlightedAll, useSyntax } from '@/shared/lib';
import { type CodeTab } from '@/shared/lib/snippetUtils';

import { CodeBlockHeader } from '../CodeBlockHeader';
import { CodePane } from '../CodePane';
import { CodeTabBar } from '../CodeTabBar';

import styles from './DocCodeBlock.module.scss';

type Props = {
  tabs: CodeTab[];
  label?: string;
};

export function DocCodeBlock({ tabs, label }: Props) {
  const { syntax } = useSyntax();
  const [activeIndex, setActiveIndex] = useState(0);

  const tabsForHighlight = useMemo(
    () => tabs.map((tab) => ({ code: getTabCode(tab, syntax), lang: tab.lang })),
    [tabs, syntax],
  );
  const { htmls, isLoading } = useHighlightedAll(tabsForHighlight);

  const activeTab = tabs[activeIndex] ?? tabs[0];
  const code = getTabCode(activeTab, syntax);
  const lineCount = code.split('\n').length;

  return (
    <div className={styles.block}>
      <CodeBlockHeader
        title={label ? <span className={styles.block__label}>{label}</span> : undefined}
        code={code}
        lang={activeTab.lang}
        jsVariant={activeTab.jsVariant}
        className={styles.block__header}
      />

      {tabs.length > 1 && (
        <CodeTabBar tabs={tabs.map((tab) => tab.label)} activeTab={activeIndex} onTabChange={setActiveIndex} />
      )}

      <div className={styles.block__body}>
        <CodePane html={htmls[activeIndex] ?? ''} isLoading={isLoading} lineCount={lineCount} />
      </div>
    </div>
  );
}
