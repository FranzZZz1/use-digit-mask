import { useState } from 'react';
import cx from 'clsx';
import { type ParsedValues, usePhoneMask } from 'use-digit-mask';

import { CountrySelect } from '../CountrySelect';
import { FieldParsedValues } from '../ParsedValues';

import styles from './PhoneField.module.scss';

type PhoneFieldProps = {
  showCountrySelect?: boolean;
  showCandidates?: boolean;
  priorityIds?: string[];
  stickyPins?: boolean;
};

export function PhoneField({
  showCountrySelect = false,
  showCandidates = false,
  priorityIds,
  stickyPins,
}: PhoneFieldProps) {
  const [value, setValue] = useState('');
  const [parsed, setParsed] = useState<ParsedValues | null>(null);

  const { props, mask, cc, id, candidates, selectCandidate, selectPlan, allPlans } = usePhoneMask({
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
        {showCountrySelect && (
          <CountrySelect
            allPlans={allPlans}
            currentId={id}
            candidates={candidates}
            priorityIds={priorityIds}
            stickyPins={stickyPins}
            onSelect={selectPlan}
          />
        )}
        <input
          {...props}
          className={cx(styles.input, showCountrySelect && styles['input--attached'])}
          type="text"
          inputMode="numeric"
          placeholder="Start typing a number…"
        />
      </div>

      {showCandidates && candidates.length > 1 && (
        <div className={styles.candidates}>
          {candidates.map((c) => (
            <button
              key={`${c.id}-${c.prefixDigits}`}
              type="button"
              className={cx(styles.candidate, c.id === id && c.prefixDigits === (cc ?? '') && styles.active)}
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
