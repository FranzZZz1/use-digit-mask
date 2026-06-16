import { memo, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'clsx';

import { useLang } from '@/shared/i18n';
import { getTabCode, useHighlightedAll, usePreviewCollapse, useSyntax } from '@/shared/lib';
import { type CodeTab } from '@/shared/lib/snippetUtils';
import { VariantSelect } from '@/shared/ui/VariantSelect';

import { CodeBlockHeader } from '../CodeBlockHeader';
import { CodePane } from '../CodePane';
import { CodeTabBar } from '../CodeTabBar';
import { ExpandButton } from '../ExpandButton/ExpandButton';
import { Modal } from '../Modal';

import styles from './CodeModal.module.scss';

export type CodeModalVariant = {
  label: string;
  code: CodeTab[];
};

type CodeModalProps = {
  title: string;
  tabs: CodeTab[];
  onClose: () => void;
  children?: ReactNode;
  variants?: CodeModalVariant[];
  activeVariantIdx?: number;
  onVariantChange?: (idx: number) => void;
};

const MemoizedCodePane = memo(CodePane);

function CodeModalComponent({
  title,
  tabs,
  onClose,
  children,
  variants,
  activeVariantIdx,
  onVariantChange,
}: CodeModalProps) {
  const { t } = useLang();
  const { syntax } = useSyntax();
  const { previewRef, isFullscreen, handleFullscreen } = usePreviewCollapse();

  const [activeTabLabel, setActiveTabLabel] = useState(() => tabs[0]?.label ?? '');

  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  useEffect(() => {
    setActiveTabLabel((current) => {
      const stillExists = tabsRef.current.some((tab) => tab.label === current);
      return stillExists ? current : (tabsRef.current[0]?.label ?? '');
    });
  }, [activeVariantIdx]);

  const activeTabIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.label === activeTabLabel),
  );

  const tabsForHighlight = useMemo(
    () => tabs.map((tab) => ({ code: getTabCode(tab, syntax), lang: tab.lang })),
    [tabs, syntax],
  );

  const { htmls: allHighlighted, isLoading } = useHighlightedAll(tabsForHighlight);

  const currentTab = tabs[activeTabIndex];
  const currentCode = currentTab ? getTabCode(currentTab, syntax) : '';
  const currentLang = currentTab?.lang ?? 'tsx';
  const currentHighlighted = allHighlighted[activeTabIndex] ?? '';
  const lineCount = currentCode.split('\n').length;

  const hasVariants = (variants?.length ?? 0) > 1;

  return (
    <Modal onClose={onClose}>
      <CodeBlockHeader
        title={<span className={styles.title}>{title}</span>}
        code={currentCode}
        lang={currentLang}
        jsVariant={currentTab?.jsVariant}
        className={styles.header}
        onClose={onClose}
      />

      <div className={cx(styles.body, isFullscreen && styles['body--fullscreen'])}>
        <div ref={previewRef} className={cx(styles.preview, isFullscreen && styles['preview--fullscreen'])}>
          <div className={styles.preview__header}>
            <p className={styles.preview__label}>{t.sections.preview}</p>

            {hasVariants && (
              <VariantSelect
                options={variants!.map((v, i) => ({ label: v.label, value: i }))}
                value={activeVariantIdx ?? 0}
                onChange={(idx) => {
                  onVariantChange?.(idx);
                }}
              />
            )}
          </div>

          <div className={styles.preview__content}>{children}</div>
        </div>

        <div className={styles.code__panel}>
          <CodeTabBar
            tabs={tabs.length > 1 ? tabs.map((tab) => tab.label) : []}
            activeTab={activeTabIndex}
            actions={
              <>
                {hasVariants && (
                  <VariantSelect
                    triggerClassName={cx(styles.tabs__variants, isFullscreen && styles['tabs__variants--visible'])}
                    options={variants!.map((v, i) => ({ label: v.label, value: i }))}
                    value={activeVariantIdx ?? 0}
                    onChange={(idx) => {
                      onVariantChange?.(idx);
                    }}
                  />
                )}
                <ExpandButton isFullscreen={isFullscreen} className={styles.tabs__expand} onClick={handleFullscreen} />
              </>
            }
            onTabChange={(index) => {
              setActiveTabLabel(tabs[index]?.label ?? '');
            }}
          />

          <div className={styles.code__scroll}>
            <MemoizedCodePane gutter html={currentHighlighted} isLoading={isLoading} lineCount={lineCount} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export const CodeModal = memo(CodeModalComponent);
