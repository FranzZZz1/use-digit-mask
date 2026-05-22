import { useState } from 'react';
import { type ParsedValues, useMask } from 'use-digit-mask';

import { ConditionalWrap } from '@/shared/lib';
import { FieldParsedValues } from '@/shared/ui/FieldParsedValues';
import { Input } from '@/shared/ui/Input';

import styles from './MaskField.module.scss';

type MaskFieldProps = {
  mask: string;
  allowedPrefixes?: string[];
  placeholderChar?: string;
  trimMaskTail?: boolean;
  activateOnFocus?: boolean;
  deactivateOnEmptyBlur?: boolean;
  normalize?: (digits: string) => string;
  ghost?: boolean;
  hideGhostOnInput?: boolean;
  ghostChar?: string;
  alwaysActive?: boolean;
};

export function MaskField({
  mask,
  allowedPrefixes,
  placeholderChar = '_',
  trimMaskTail,
  activateOnFocus,
  deactivateOnEmptyBlur,
  normalize,
  ghost,
  hideGhostOnInput,
  ghostChar,
  alwaysActive,
}: MaskFieldProps) {
  const [value, setValue] = useState('');
  const [parsed, setParsed] = useState<ParsedValues | null>(null);

  const { props, ghostValue } = useMask({
    value,
    onChange: (next, p) => {
      setValue(next);
      setParsed(p);
    },
    mask,
    allowedPrefixes,
    placeholderChar,
    trimMaskTail,
    activateOnFocus,
    deactivateOnEmptyBlur,
    normalize,
    ghostChar,
    alwaysActive,
  });

  const showGhost = ghost && (!hideGhostOnInput || props.value.length === 0);
  const ghostFilled = ghostValue.slice(0, props.value.length);
  const ghostEmpty = ghostValue.slice(props.value.length);

  return (
    <div className={styles.root}>
      <div className={styles.input__wrapper}>
        <ConditionalWrap condition={ghost} wrapIn={<div className={styles.ghost__wrapper} />}>
          <Input {...props} type="text" inputMode="numeric" />
          {showGhost && (
            <span className={styles.ghost__overlay} aria-hidden="true">
              <span className={styles.ghost__filled}>{ghostFilled}</span>
              <span className={styles.ghost__empty}>{ghostEmpty}</span>
            </span>
          )}
        </ConditionalWrap>
        <span className={styles.mask__hint}>{mask}</span>
      </div>

      <FieldParsedValues
        parsed={parsed}
        showCase={['formattedWithPrefix', 'rawWithoutPrefix', 'prefix', 'isMaskCompleted']}
      />
    </div>
  );
}
