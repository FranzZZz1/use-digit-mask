import { type ReactNode, useState } from 'react';
import cx from 'clsx';

import { useHighlighted, usePreviewCollapse } from '@/shared/lib';
import { CodeBlockHeader } from '@/shared/ui/CodeBlockHeader';
import { CodePane } from '@/shared/ui/CodePane';
import { CodeTabBar } from '@/shared/ui/CodeTabBar';
import { ExpandButton } from '@/shared/ui/ExpandButton/ExpandButton';
import { Modal } from '@/shared/ui/Modal';
import { PlaygroundLayoutProvider, type PlaygroundTab } from '@/shared/ui/Playground';

import styles from './PlaygroundModal.module.scss';

export type { PlaygroundTab };

type Props = {
  title: ReactNode;
  tabs: PlaygroundTab[];
  onClose: () => void;
  children: ReactNode;
};

export function PlaygroundModal({ title, tabs, onClose, children }: Props) {
  const { previewRef, isFullscreen, isAnimating, handleFullscreen } = usePreviewCollapse({
    minCodeFraction: 1 / 3,
  });

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const safeIndex = activeTabIndex < tabs.length ? activeTabIndex : 0;
  const activeTab = tabs[safeIndex];

  const { html, isLoading } = useHighlighted(activeTab.code, activeTab.lang);
  const lineCount = activeTab.code.split('\n').length;

  return (
    <Modal onClose={onClose}>
      <CodeBlockHeader
        title={<span className={styles.title}>{title}</span>}
        code={activeTab.code}
        lang={activeTab.lang}
        hasJsVariant={activeTab.hasJsVariant}
        className={styles.header}
        onClose={onClose}
      />

      <div className={cx(styles.body, isFullscreen && styles['body--fullscreen'])}>
        <div ref={previewRef} className={cx(styles.controls, isFullscreen && styles['controls--fullscreen'])}>
          <PlaygroundLayoutProvider value={{ isAnimating, isFullscreen }}>{children}</PlaygroundLayoutProvider>
        </div>

        <div className={styles.code__panel}>
          <CodeTabBar
            tabs={tabs.map((tab) => tab.label)}
            activeTab={safeIndex}
            actions={<ExpandButton isFullscreen={isFullscreen} className={styles.expand} onClick={handleFullscreen} />}
            onTabChange={setActiveTabIndex}
          />

          <div className={styles.code__scroll}>
            <CodePane html={html} isLoading={isLoading} lineCount={lineCount} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
