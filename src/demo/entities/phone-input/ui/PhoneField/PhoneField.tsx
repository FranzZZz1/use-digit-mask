import { useState } from 'react';
import cx from 'clsx';
import { E164_MASK, usePhoneMask } from 'use-digit-mask';

import { CountrySelect } from '@/entities/phone-input/ui/CountrySelect/CountrySelect';
import { CountrySelectRadix } from '@/entities/phone-input/ui/CountrySelect/CountrySelectRadix';
import { ConditionalWrap } from '@/shared/lib';
import { FieldLayout } from '@/shared/ui/FieldLayout';
import { Input } from '@/shared/ui/Input';

import styles from './PhoneField.module.scss';

type PhoneFieldProps = {
  showCountrySelect?: boolean;
  showCandidates?: boolean;
  priorityIds?: string[];
  stickyPins?: boolean;
  disableSort?: boolean;
  radixSelect?: boolean;
  trimMaskTail?: boolean;
  placeholderChar?: string;
  ghost?: boolean;
  ghostChar?: string;
  ghostOnlyWhenResolved?: boolean;
};

export function PhoneField({
  showCountrySelect = false,
  showCandidates = false,
  priorityIds,
  stickyPins,
  disableSort,
  radixSelect = false,
  trimMaskTail = true,
  placeholderChar,
  ghost,
  ghostChar,
  ghostOnlyWhenResolved,
}: PhoneFieldProps) {
  const [value, setValue] = useState('');

  const { props, mask, id, prefix, candidates, selectCandidate, selectPlan, allPlans, ghostValue, api } = usePhoneMask({
    value,
    onChange: (next) => {
      setValue(next);
    },
    trimMaskTail,
    placeholderChar,
    ghostChar,
  });

  const showGhost = ghost && (!ghostOnlyWhenResolved || mask !== E164_MASK);
  const ghostFilled = ghostValue.slice(0, value.length);
  const ghostEmpty = ghostValue.slice(value.length);

  const parsed = api.getParsedValues();

  return (
    <FieldLayout
      parsed={parsed}
      showCase={['mask', 'id', 'prefix', 'parentPrefix', 'rawWithoutPrefix', 'isMaskCompleted']}
      mask={mask}
      id={id}
    >
      <div className={cx(styles.input__row, showCountrySelect && styles['input__row--select'])}>
        {showCountrySelect && !radixSelect && (
          <CountrySelect
            allPlans={allPlans}
            currentId={id}
            candidates={candidates}
            priorityIds={priorityIds}
            stickyPins={stickyPins}
            disableSort={disableSort}
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
        <ConditionalWrap condition={ghost} wrapIn={<div className={styles.ghost__wrapper} />}>
          <Input
            {...props}
            className={cx(showCountrySelect && styles['input--attached'], ghost && styles['input--ghost'])}
            type="text"
            inputMode="numeric"
            placeholder={showGhost ? undefined : 'Start typing a number...'}
          />
          {showGhost && (
            <span className={styles.ghost__overlay} aria-hidden="true">
              <span className={styles.ghost__filled}>{ghostFilled}</span>
              <span className={styles.ghost__empty}>{ghostEmpty}</span>
            </span>
          )}
        </ConditionalWrap>
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
    </FieldLayout>
  );
}
