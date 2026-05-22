import { memo, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'clsx';

import { useLang } from '@/shared/i18n';
import { useHighlightedAll, usePreviewCollapse, useSyntax } from '@/shared/lib';
import { VariantSelect } from '@/shared/ui/VariantSelect';

import { CodeBlockHeader } from '../CodeBlockHeader';
import { CodePane } from '../CodePane';
import { CodeTabBar } from '../CodeTabBar';
import { ExpandButton } from '../ExpandButton/ExpandButton';
import { Modal } from '../Modal';

import styles from './CodeModal.module.scss';

export type CodeTab = {
  label: string;
  code: string;
  codeJs?: string;
  lang?: string;
};

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

  const [activeTabLabel, setActiveTabLabel] = useState(() => tabs[0]?.label ?? '');
  const { previewRef, isFullscreen, handleFullscreen } = usePreviewCollapse();

  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  useEffect(() => {
    setActiveTabLabel((current) => {
      const stillExists = tabsRef.current.some((tab) => tab.label === current);
      return stillExists ? current : (tabsRef.current[0]?.label ?? '');
    });
  }, [activeVariantIdx]);

  const activeTab = Math.max(
    0,
    tabs.findIndex((tab) => tab.label === activeTabLabel),
  );

  const tabsForHighlight = useMemo(
    () =>
      tabs.map((tab) => ({
        code: syntax === 'js' && tab.codeJs !== undefined ? tab.codeJs : tab.code,
        lang: tab.lang,
      })),
    [tabs, syntax],
  );

  const { htmls: allHighlighted, isLoading } = useHighlightedAll(tabsForHighlight);

  const currentTab = tabs[activeTab];
  const hasJsVariant = currentTab?.codeJs !== undefined;
  const isJs = syntax === 'js' && hasJsVariant;
  const currentCode = isJs ? (currentTab?.codeJs ?? '') : (currentTab?.code ?? '');
  const currentLang = currentTab?.lang ?? 'tsx';
  const currentHighlighted = allHighlighted[activeTab] ?? '';
  const lineCount = currentCode.split('\n').length;

  const hasVariants = (variants?.length ?? 0) > 1;

  return (
    <Modal onClose={onClose}>
      <CodeBlockHeader
        title={<span className={styles.title}>{title}</span>}
        code={currentCode}
        lang={currentLang}
        hasJsVariant={hasJsVariant}
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
            activeTab={activeTab}
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
            <MemoizedCodePane html={currentHighlighted} isLoading={isLoading} lineCount={lineCount} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export const CodeModal = memo(CodeModalComponent);
