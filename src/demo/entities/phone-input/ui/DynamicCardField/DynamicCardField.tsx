import { useState } from 'react';
import cx from 'clsx';
import { useMask } from 'use-digit-mask';

import { FieldInputWrapper, FieldLayout, MaskHint } from '@/shared/ui/FieldLayout';
import { Input } from '@/shared/ui/Input';

import styles from './DynamicCardField.module.scss';

const MASK_DEFAULT = '#### #### #### ####';
const MASK_AMEX = '#### ###### #####';

function getCardMask(digits: string): string {
  return digits.startsWith('34') || digits.startsWith('37') ? MASK_AMEX : MASK_DEFAULT;
}

export function DynamicCardField() {
  const [value, setValue] = useState('');

  const { props, api } = useMask({
    mask: getCardMask,
    value,
    onChange: setValue,
  });

  const parsedValues = api.getParsedValues();
  const currentMask = getCardMask(parsedValues.rawWithoutPrefix);

  const isAmex = currentMask === MASK_AMEX;

  return (
    <FieldLayout parsed={parsedValues} showCase={['formattedWithPrefix', 'rawWithoutPrefix', 'isMaskCompleted']}>
      <FieldInputWrapper>
        <Input {...props} type="text" />
        <div className={styles.hint__row}>
          <MaskHint>{currentMask}</MaskHint>
          {parsedValues.rawWithoutPrefix.length > 0 && (
            <span className={cx(styles.badge, isAmex && styles['badge--amex'])}>
              {isAmex ? 'Amex · 4-6-5' : 'Visa / MC · 4-4-4-4'}
            </span>
          )}
        </div>
      </FieldInputWrapper>
    </FieldLayout>
  );
}
