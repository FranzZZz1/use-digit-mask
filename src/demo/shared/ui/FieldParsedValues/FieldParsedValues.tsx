import { type ParsedValues } from 'use-digit-mask';

import { usePlaygroundParsedValues } from '@/shared/ui/Playground/model/PlaygroundParsedValuesContext';

import styles from './FieldParsedValues.module.scss';

type ParsedKey = keyof ParsedValues;
type ExtraKey = 'mask' | 'id';
type ConfigKey = ParsedKey | ExtraKey;

const CONFIG: Partial<Record<ConfigKey, { label: string }>> = {
  formattedWithPrefix: {
    label: 'formatted',
  },
  rawWithoutPrefix: {
    label: 'raw',
  },
  prefix: {
    label: 'prefix',
  },
  parentPrefix: {
    label: 'parentPrefix',
  },
  isMaskCompleted: {
    label: 'completed',
  },
  mask: {
    label: 'mask',
  },
  id: {
    label: 'country',
  },
};

const getValue = (item: ConfigKey, parsed: ParsedValues | null, mask?: string, id?: string | null) => {
  switch (item) {
    case 'mask':
      return mask;
    case 'id':
      return id || '—';
    case 'isMaskCompleted':
      return parsed ? String(parsed.isMaskCompleted) : '—';
    default: {
      const v = parsed?.[item as ParsedKey];
      if (v == null) return undefined;
      if (typeof v === 'string') return v;
      return JSON.stringify(v);
    }
  }
};

export function FieldParsedValues({
  parsed,
  showCase,
  mask,
  id,
}: {
  parsed: ParsedValues | null;
  showCase: Partial<ConfigKey>[];
  mask?: string;
  id?: string | null;
}) {
  const { show } = usePlaygroundParsedValues();
  if (!show) return null;

  return (
    <dl className={styles.parsed}>
      {showCase.map((item) => {
        const itemConfig = CONFIG[item];

        return (
          <div key={item} className={styles.row}>
            <dt>{itemConfig?.label}</dt>
            <dd className={styles.mono}>{getValue(item, parsed, mask, id) || '—'}</dd>
          </div>
        );
      })}
    </dl>
  );
}
