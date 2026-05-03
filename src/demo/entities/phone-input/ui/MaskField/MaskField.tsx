import { useState } from 'react';
import { type ParsedValues, useMask } from 'use-digit-mask';

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
};

export function MaskField({
  mask,
  allowedPrefixes,
  placeholderChar = '_',
  trimMaskTail,
  activateOnFocus,
  deactivateOnEmptyBlur,
  normalize,
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
    normalize,
  });

  return (
    <div className={styles.root}>
      <div className={styles.input__wrapper}>
        <Input {...props} type="text" inputMode="numeric" />
        <span className={styles.mask__hint}>{mask}</span>
      </div>

      <FieldParsedValues
        parsed={parsed}
        showCase={['formattedWithPrefix', 'rawWithoutPrefix', 'prefix', 'isMaskCompleted']}
      />
    </div>
  );
}
