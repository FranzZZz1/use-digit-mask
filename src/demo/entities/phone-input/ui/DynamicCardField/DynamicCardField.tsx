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
  const [mask, setMask] = useState(MASK_DEFAULT);

  const isAmex = mask === MASK_AMEX;

  const { props, api } = useMask({
    mask,
    value,
    onChange: (next, parsed) => {
      setValue(next);
      setMask(getCardMask(parsed.rawWithoutPrefix));
    },
  });

  const parsedValues = api.getParsedValues();

  return (
    <FieldLayout
      parsed={parsedValues}
      showCase={['formattedWithPrefix', 'rawWithoutPrefix', 'isMaskCompleted']}
    >
      <FieldInputWrapper>
        <Input {...props} type="text" inputMode="numeric" />
        <div className={styles.hint__row}>
          <MaskHint>{mask}</MaskHint>
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
