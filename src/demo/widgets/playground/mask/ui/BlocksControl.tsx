import { useEffect, useRef, useState } from 'react';
import cx from 'clsx';

import { VariantSelect } from '@/shared/ui/VariantSelect';

import { type BlockConstraintRecord } from '../buildCode';

import styles from './BlocksControl.module.scss';
import controlStyles from '@/shared/ui/Playground/PlaygroundControls/PlaygroundControls.module.scss';

type BlockRow = { group: string; min: string; max: string };

type Props = {
  groups: string[];
  onChange: (blocks: BlockConstraintRecord) => void;
};

function toBlocks(rows: BlockRow[]): BlockConstraintRecord {
  return rows.reduce<BlockConstraintRecord>((acc, row) => {
    if (row.min || row.max) {
      const c: { min?: number; max?: number } = {};
      if (row.min) c.min = parseInt(row.min, 10);
      if (row.max) c.max = parseInt(row.max, 10);
      acc[row.group] = c;
    } else {
      acc[row.group] = null;
    }
    return acc;
  }, {});
}

export function BlocksControl({ groups, onChange }: Props) {
  const [rows, setRows] = useState<BlockRow[]>([]);
  const [phantomMin, setPhantomMin] = useState('');
  const [phantomMax, setPhantomMax] = useState('');
  const phantomRowRef = useRef<HTMLDivElement>(null);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    onChangeRef.current(toBlocks(rows));
  }, [rows]);

  useEffect(() => {
    const validGroups = new Set(groups);
    setRows((prev) => prev.filter((r) => validGroups.has(r.group)));
  }, [groups]);

  const usedGroups = new Set(rows.map((r) => r.group));
  const nextGroup = groups.find((g) => !usedGroups.has(g)) ?? null;

  useEffect(() => {
    setPhantomMin('');
    setPhantomMax('');
  }, [nextGroup]);

  if (groups.length === 0) return null;

  const lastHasValue = rows.length > 0 && !!(rows[rows.length - 1].min || rows[rows.length - 1].max);
  const showPhantom = nextGroup !== null && (rows.length === 0 || lastHasValue);

  const commitPhantom = (min: string, max: string, group = nextGroup!) => {
    setRows((prev) => [...prev, { group, min, max }]);
    setPhantomMin('');
    setPhantomMax('');
  };

  const handlePhantomBlur = (e: React.FocusEvent) => {
    if (phantomRowRef.current?.contains(e.relatedTarget as Node)) return;
    if (phantomMin || phantomMax) commitPhantom(phantomMin, phantomMax);
  };

  const handleRealChange = (idx: number, partial: Partial<BlockRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...partial } : r)));
  };

  type DisplayRow = BlockRow & { isPhantom: boolean };
  const displayRows: DisplayRow[] = [
    ...rows.map((r) => ({ ...r, isPhantom: false })),
    ...(showPhantom ? [{ group: nextGroup, min: phantomMin, max: phantomMax, isPhantom: true }] : []),
  ];

  return (
    <div className={styles.section}>
      <span className={controlStyles.field__name}>blocks</span>
      <div className={styles.rows}>
        {displayRows.map(({ isPhantom, ...row }, idx) => {
          const otherUsed = new Set(displayRows.filter((_, i) => i !== idx).map((r) => r.group));
          const available = groups.filter((g) => !otherUsed.has(g));
          const groupOptions = available.map((g, i) => ({ label: g, value: i }));
          const selectedIndex = Math.max(0, available.indexOf(row.group));

          if (isPhantom) {
            return (
              <div
                key={nextGroup}
                ref={phantomRowRef}
                className={cx(styles.row, styles['row--phantom'])}
                onBlur={handlePhantomBlur}
              >
                <VariantSelect
                  options={groupOptions}
                  value={selectedIndex}
                  triggerClassName={styles['group-trigger']}
                  onChange={(i) => {
                    commitPhantom(phantomMin, phantomMax, available[i] ?? available[0]);
                  }}
                />
                <span className={styles['range-label']}>min</span>
                <input
                  type="number"
                  className={styles['num-input']}
                  value={phantomMin}
                  placeholder="—"
                  min={0}
                  max={10 ** nextGroup!.length - 1}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      commitPhantom(val, phantomMax);
                    } else {
                      setPhantomMin(val);
                    }
                  }}
                />
                <span className={styles['range-label']}>max</span>
                <input
                  type="number"
                  className={styles['num-input']}
                  value={phantomMax}
                  placeholder="—"
                  min={0}
                  max={10 ** nextGroup!.length - 1}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      commitPhantom(phantomMin, val);
                    } else {
                      setPhantomMax(val);
                    }
                  }}
                />
              </div>
            );
          }

          return (
            <div key={row.group} className={styles.row}>
              <VariantSelect
                options={groupOptions}
                value={selectedIndex}
                triggerClassName={styles['group-trigger']}
                onChange={(i) => {
                  handleRealChange(idx, { group: available[i] ?? available[0] });
                }}
              />
              <span className={styles['range-label']}>min</span>
              <input
                type="number"
                className={styles['num-input']}
                value={row.min}
                placeholder="—"
                min={0}
                max={10 ** row.group.length - 1}
                onChange={(e) => {
                  handleRealChange(idx, { min: e.target.value });
                }}
              />
              <span className={styles['range-label']}>max</span>
              <input
                type="number"
                className={styles['num-input']}
                value={row.max}
                placeholder="—"
                min={0}
                max={10 ** row.group.length - 1}
                onChange={(e) => {
                  handleRealChange(idx, { max: e.target.value });
                }}
              />
              <button
                type="button"
                className={styles['remove-btn']}
                aria-label="Remove"
                onClick={() => {
                  setRows((prev) => prev.filter((_, i) => i !== idx));
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
