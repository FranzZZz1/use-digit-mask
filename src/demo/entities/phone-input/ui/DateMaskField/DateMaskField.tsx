import { useState } from 'react';
import { useDateMask } from 'use-digit-mask';

import { FieldInputWrapper, FieldLayout, MaskHint } from '@/shared/ui/FieldLayout';
import { Input } from '@/shared/ui/Input';

type DateMaskFieldProps = {
  format: string;
  overwrite?: boolean;
  min?: Date | string;
  max?: Date | string;
};

export function DateMaskField({ format, overwrite, min = undefined, max = undefined }: DateMaskFieldProps) {
  const [value, setValue] = useState('');

  const { props, api } = useDateMask({
    format,
    value,
    onChange: setValue,
    overwrite,
    min,
    max,
  });

  const parsed = api.getParsedValues();

  return (
    <FieldLayout parsed={parsed} showCase={['formattedWithPrefix', 'rawWithoutPrefix', 'isMaskCompleted']}>
      <FieldInputWrapper>
        <Input {...props} type="text" />
        <MaskHint>{format}</MaskHint>
      </FieldInputWrapper>
    </FieldLayout>
  );
}
