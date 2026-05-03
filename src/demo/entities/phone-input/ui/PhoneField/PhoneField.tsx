import { useState } from 'react';
import cx from 'clsx';
import { type ParsedValues, usePhoneMask } from 'use-digit-mask';

import { CountrySelect } from '@/entities/phone-input/ui/CountrySelect/CountrySelect';
import { CountrySelectRadix } from '@/entities/phone-input/ui/CountrySelect/CountrySelectRadix';
import { FieldParsedValues } from '@/shared/ui/FieldParsedValues';
import { Input } from '@/shared/ui/Input';

import styles from './PhoneField.module.scss';

type PhoneFieldProps = {
  showCountrySelect?: boolean;
  showCandidates?: boolean;
  priorityIds?: string[];
  stickyPins?: boolean;
  radixSelect?: boolean;
};

export function PhoneField({
  showCountrySelect = false,
  showCandidates = false,
  priorityIds,
  stickyPins,
  radixSelect = false,
}: PhoneFieldProps) {
  const [value, setValue] = useState('');
  const [parsed, setParsed] = useState<ParsedValues | null>(null);

  const { props, mask, id, prefix, candidates, selectCandidate, selectPlan, allPlans } = usePhoneMask({
    value,
    onChange: (next, p) => {
      setValue(next);
      setParsed(p);
    },
    trimMaskTail: true,
  });

  return (
    <div className={styles.root}>
      <div className={cx(styles.input__row, showCountrySelect && styles['input__row--select'])}>
        {showCountrySelect && !radixSelect && (
          <CountrySelect
            allPlans={allPlans}
            currentId={id}
            candidates={candidates}
            priorityIds={priorityIds}
            stickyPins={stickyPins}
            inputRef={props.ref}
            onSelect={selectPlan}
          />
        )}
        {showCountrySelect && radixSelect && (
          <CountrySelectRadix
            allPlans={allPlans}
            currentId={id}
            candidates={candidates}
            priorityIds={priorityIds}
            stickyPins={stickyPins}
            inputRef={props.ref}
            onSelect={selectPlan}
          />
        )}
        <Input
          {...props}
          className={cx(showCountrySelect && styles['input--attached'])}
          type="text"
          inputMode="numeric"
          placeholder="Start typing a number..."
        />
      </div>

      {showCandidates && candidates.length > 1 && (
        <div className={styles.candidates}>
          {candidates.map((c) => (
            <button
              key={`${c.id}-${c.prefixDigits}`}
              type="button"
              className={cx(styles.candidate, c.id === id && c.prefix === prefix && styles.active)}
              onClick={() => {
                selectCandidate(c);
              }}
            >
              {c.label ?? c.cc} <span className={styles.candidate__prefix}>{c.prefix}</span>
            </button>
          ))}
        </div>
      )}

      <FieldParsedValues
        parsed={parsed}
        showCase={['mask', 'id', 'prefix', 'rawWithoutPrefix', 'isMaskCompleted']}
        mask={mask}
        id={id}
      />
    </div>
  );
}
