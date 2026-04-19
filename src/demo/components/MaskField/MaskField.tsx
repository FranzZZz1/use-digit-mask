import { useState } from 'react';
import { type ParsedValues, useMask } from 'use-digit-mask';

import { FieldParsedValues } from '../ParsedValues';

import styles from './MaskField.module.scss';

type MaskFieldProps = {
  mask: string;
  allowedPrefixes?: string[];
  placeholderChar?: string;
  trimMaskTail?: boolean;
  activateOnFocus?: boolean;
  deactivateOnEmptyBlur?: boolean;
};

export function MaskField({
  mask,
  allowedPrefixes,
  placeholderChar = '_',
  trimMaskTail,
  activateOnFocus,
  deactivateOnEmptyBlur,
}: MaskFieldProps) {
  const [value, setValue] = useState('');
  const [parsed, setParsed] = useState<ParsedValues | null>(null);

  const { props } = useMask({
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
  });

  return (
    <div className={styles.root}>
      <div className={styles.input__wrapper}>
        <input {...props} className={styles.input} type="text" inputMode="numeric" />
        <span className={styles.mask__hint}>{mask}</span>
      </div>

      <FieldParsedValues
        parsed={parsed}
        showCase={['formattedWithPrefix', 'rawWithoutPrefix', 'prefix', 'isMaskCompleted']}
      />
    </div>
  );
}
