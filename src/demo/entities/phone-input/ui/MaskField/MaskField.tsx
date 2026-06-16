import { type NamedBlock, type ParsedValues, useMask } from 'use-digit-mask';

import { ConditionalWrap, useControlled } from '@/shared/lib';
import { FieldInputWrapper, FieldLayout, MaskHint } from '@/shared/ui/FieldLayout';
import { Input } from '@/shared/ui/Input';

import styles from './MaskField.module.scss';

type MaskFieldProps = {
  mask: string;
  value?: string;
  onChange?: (v: string) => void;
  prefixAliases?: string[];
  placeholderChar?: string;
  trimMaskTail?: boolean;
  activateOnFocus?: boolean;
  deactivateOnEmptyBlur?: boolean;
  normalize?: (digits: string) => string;
  ghost?: boolean;
  hideGhostOnInput?: boolean;
  ghostChar?: string;
  alwaysActive?: boolean;
  overwrite?: boolean;
  blocks?: Record<string, NamedBlock>;
  onComplete?: (parsed: ParsedValues) => void;
  bypassMask?: boolean | ((value: string) => boolean);
};

export function MaskField({
  mask,
  value: controlledValue,
  onChange: controlledOnChange,
  prefixAliases,
  placeholderChar = '_',
  trimMaskTail,
  activateOnFocus,
  deactivateOnEmptyBlur,
  normalize,
  ghost,
  hideGhostOnInput,
  ghostChar,
  alwaysActive,
  overwrite,
  blocks,
  onComplete,
  bypassMask,
}: MaskFieldProps) {
  const [value, setValue] = useControlled(controlledValue, '');

  const { props, ghostValue, api } = useMask({
    value,
    onChange: (next) => {
      setValue(next);
      controlledOnChange?.(next);
    },
    mask,
    prefixAliases,
    placeholderChar,
    trimMaskTail,
    activateOnFocus,
    deactivateOnEmptyBlur,
    normalize,
    ghostChar,
    alwaysActive,
    overwrite,
    blocks,
    onComplete,
    bypassMask,
  });

  const showGhost = ghost && (!hideGhostOnInput || props.value.length === 0);
  const ghostFilled = ghostValue.slice(0, props.value.length);
  const ghostEmpty = ghostValue.slice(props.value.length);

  const parsed = api.getParsedValues();

  return (
    <FieldLayout parsed={parsed} showCase={['formattedWithPrefix', 'rawWithoutPrefix', 'prefix', 'isMaskCompleted']}>
      <FieldInputWrapper>
        <ConditionalWrap condition={ghost} wrapIn={<div className={styles.ghost__wrapper} />}>
          <Input {...props} type="text" />
          {showGhost && (
            <span className={styles.ghost__overlay} aria-hidden="true">
              <span className={styles.ghost__filled}>{ghostFilled}</span>
              <span className={styles.ghost__empty}>{ghostEmpty}</span>
            </span>
          )}
        </ConditionalWrap>
        <MaskHint>{mask}</MaskHint>
      </FieldInputWrapper>
    </FieldLayout>
  );
}
