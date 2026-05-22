import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'clsx';

import { useLang } from '@/shared/i18n';
import { PlaygroundHint, PlaygroundTooltip, usePlaygroundLayout } from '@/shared/ui/Playground';
import { Switch } from '@/shared/ui/Switch';

import { PlaygroundParsedValuesContext } from '../model/PlaygroundParsedValuesContext';
import { type OptionSchema, type OptionsState, type StrOptionState } from '../model/types';

import styles from './PlaygroundControls.module.scss';

type BoolFieldProps = {
  pgKey: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  sub?: boolean;
  tooltip?: string;
};

function BoolField({ pgKey, enabled, disabled, sub, tooltip, onToggle }: BoolFieldProps) {
  return (
    <div className={cx(styles.field, sub && styles['field--sub'], disabled && styles['field--disabled'])}>
      <Switch id={`pg-bool-${pgKey}`} checked={enabled} disabled={disabled} onChange={onToggle} />
      <label htmlFor={`pg-bool-${pgKey}`} className={styles.field__name}>
        {pgKey}
      </label>
      {tooltip && <PlaygroundHint tooltip={tooltip} />}
    </div>
  );
}

type StrFieldProps = {
  pgKey: string;
  enabled: boolean;
  value: string;
  onToggle: () => void;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  defaultValue?: string;
  tooltip?: string;
};

function StrField({
  pgKey,
  enabled,
  value,
  placeholder,
  maxLength,
  defaultValue,
  tooltip,
  onToggle,
  onChange,
}: StrFieldProps) {
  return (
    <div className={styles.field}>
      <Switch id={`pg-str-${pgKey}`} checked={enabled} onChange={onToggle} />
      <label htmlFor={`pg-str-${pgKey}`} className={styles.field__name}>
        {pgKey}
      </label>
      {tooltip && <PlaygroundHint tooltip={tooltip} />}
      {enabled && (
        <input
          spellCheck={false}
          className={styles.field__input}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onBlur={() => {
            if (!value && defaultValue) onChange(defaultValue);
          }}
        />
      )}
    </div>
  );
}

type Props = {
  schema: OptionSchema;
  state: OptionsState;
  onToggle: (key: string) => void;
  onStrChange: (key: string, value: string) => void;
  tooltips?: Record<string, string>;
  /** Slot: live preview rendered at the top of the controls panel */
  preview?: ReactNode;
  /** Slot: primary fields rendered above the schema-driven options */
  primaryFields?: ReactNode;
};

export function PlaygroundControls({ schema, state, onToggle, onStrChange, tooltips, preview, primaryFields }: Props) {
  const { isAnimating, isFullscreen } = usePlaygroundLayout();
  const { t } = useLang();
  const [showParsedValues, setShowParsedValues] = useState(true);
  const parsedValuesCtx = useMemo(() => ({ show: showParsedValues }), [showParsedValues]);

  const boolSectionRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<HTMLDivElement>(null);
  const boolSectionWidthRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);
  isAnimatingRef.current = isAnimating;

  useEffect(() => {
    const el = boolSectionRef.current;
    if (!el) return undefined;

    const ro = new ResizeObserver(() => {
      if (isAnimatingRef.current) return;
      const w = el.getBoundingClientRect().width;
      if (w > 0) boolSectionWidthRef.current = w;
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const boolSection = boolSectionRef.current;
    const fields = fieldsRef.current;
    if (!boolSection || !fields) return;

    if (isAnimating) {
      if (boolSectionWidthRef.current > 0) {
        boolSection.style.width = `${boolSectionWidthRef.current}px`;
      }
      fields.style.overflowY = 'hidden';
    } else if (!isFullscreen) {
      boolSection.style.removeProperty('width');
      fields.style.removeProperty('overflow-y');
    }
  }, [isAnimating, isFullscreen]);

  const topLevelBoolDefs = schema.filter((d) => d.type === 'bool' && !d.requiresParent);

  return (
    <div className={styles.inner}>
      {preview && (
        <PlaygroundParsedValuesContext.Provider value={parsedValuesCtx}>
          <div className={styles.preview}>
            <div className={styles.preview__content}>{preview}</div>
            <button
              type="button"
              className={styles.preview__toggle}
              onClick={() => {
                setShowParsedValues((v) => !v);
              }}
            >
              {showParsedValues ? t.demo.playground.parsedValues.hide : t.demo.playground.parsedValues.show}
            </button>
          </div>
        </PlaygroundParsedValuesContext.Provider>
      )}

      <div ref={fieldsRef} className={styles.fields}>
        {primaryFields && (
          <>
            {primaryFields}
            <div className={styles.divider} />
          </>
        )}

        <div ref={boolSectionRef}>
          {topLevelBoolDefs.map((parentDef) => {
            if (parentDef.type !== 'bool') return null;
            const parentKey = parentDef.key;
            const parentEnabled = state[parentKey]?.enabled ?? false;
            const children = schema.filter((d) => d.type === 'bool' && d.requiresParent === parentKey);

            return (
              <Fragment key={parentKey}>
                <BoolField
                  pgKey={parentKey}
                  enabled={parentEnabled}
                  tooltip={tooltips?.[parentKey]}
                  onToggle={() => {
                    onToggle(parentKey);
                  }}
                />

                {children.map((childDef) => {
                  if (childDef.type !== 'bool') return null;
                  const childKey = childDef.key;

                  return (
                    <BoolField
                      key={childKey}
                      sub
                      pgKey={childKey}
                      enabled={state[childKey]?.enabled ?? false}
                      disabled={!parentEnabled}
                      tooltip={tooltips?.[childKey]}
                      onToggle={() => {
                        onToggle(childKey);
                      }}
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </div>

        {(() => {
          let seenStr = false;
          return schema.map((def, i) => {
            if (def.type === 'divider') {
              if (!seenStr) return null;
              // eslint-disable-next-line react/no-array-index-key
              return <div key={`divider-${i}`} className={styles.divider} />;
            }
            if (def.type !== 'str') return null;
            seenStr = true;
            const { key, placeholder, maxLength, defaultValue } = def;
            const opt = state[key] as StrOptionState | undefined;
            const strEnabled = opt?.enabled ?? false;
            const boolChildren = schema.filter((d) => d.type === 'bool' && d.requiresParent === key);

            return (
              <Fragment key={key}>
                <StrField
                  pgKey={key}
                  enabled={strEnabled}
                  value={opt?.value ?? ''}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  defaultValue={defaultValue}
                  tooltip={tooltips?.[key]}
                  onToggle={() => {
                    onToggle(key);
                  }}
                  onChange={(v) => {
                    onStrChange(key, v);
                  }}
                />
                {boolChildren.map((childDef) => {
                  if (childDef.type !== 'bool') return null;
                  const childKey = childDef.key;
                  return (
                    <BoolField
                      key={childKey}
                      sub
                      pgKey={childKey}
                      enabled={state[childKey]?.enabled ?? false}
                      disabled={!strEnabled}
                      tooltip={tooltips?.[childKey]}
                      onToggle={() => {
                        onToggle(childKey);
                      }}
                    />
                  );
                })}
              </Fragment>
            );
          });
        })()}
      </div>

      <PlaygroundTooltip />
    </div>
  );
}
