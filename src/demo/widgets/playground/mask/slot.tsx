import { useState } from 'react';

import { MaskField } from '@/entities/phone-input/ui/MaskField/MaskField';
import { DEFAULT_MASK, DEFAULT_PLACEHOLDER_CHAR } from '@/shared/lib';
import { withGhostScssTab } from '@/shared/lib/snippetUtils';
import { PlaygroundField, type PlaygroundSlot, serializeSchemaState, usePlaygroundState } from '@/shared/ui/Playground';

import { BlocksControl } from './ui/BlocksControl';
import { type BlockConstraintRecord, buildUseMaskTab } from './buildCode';
import { USEMASK_SCHEMA, type UseMaskOptions } from './schema';
import { useMaskGroups } from './useMaskGroups';

import controlStyles from '@/shared/ui/Playground/PlaygroundControls/PlaygroundControls.module.scss';

const BLOCKS_DEMO_MASK = 'DD/MM/YYYY';

export function useMaskPlaygroundSlot(initialProp: string, tooltips: Record<string, string>): PlaygroundSlot {
  const [mask, setMask] = useState(() => (initialProp === 'blocks' ? BLOCKS_DEMO_MASK : DEFAULT_MASK));
  const [placeholderChar, setPlaceholderChar] = useState(DEFAULT_PLACEHOLDER_CHAR);
  const [blocks, setBlocks] = useState<BlockConstraintRecord>({});

  const pg = usePlaygroundState(USEMASK_SCHEMA, initialProp);

  const options: UseMaskOptions = {
    placeholderChar: placeholderChar || DEFAULT_PLACEHOLDER_CHAR,
    ...serializeSchemaState<UseMaskOptions>(USEMASK_SCHEMA, pg.state),
  };

  const { letterGroups, effectiveBlocks, debouncedBlocks, maskValue, setMaskValue } = useMaskGroups(mask, blocks);

  return {
    pg,
    schema: USEMASK_SCHEMA,
    tabs: withGhostScssTab([buildUseMaskTab(mask, placeholderChar, pg.state, debouncedBlocks)], !!options.ghostChar),
    preview: (
      <MaskField
        mask={mask}
        {...options}
        ghost={!!options.ghostChar}
        blocks={effectiveBlocks}
        value={maskValue}
        onChange={setMaskValue}
      />
    ),
    primaryFields: (
      <>
        <PlaygroundField name="mask" tooltip={tooltips.mask}>
          <input
            spellCheck={false}
            className={controlStyles.field__input}
            value={mask}
            placeholder={DEFAULT_MASK}
            onChange={(e) => {
              setMask(e.target.value);
            }}
          />
        </PlaygroundField>
        <PlaygroundField name="placeholderChar" tooltip={tooltips.placeholderChar}>
          <input
            spellCheck={false}
            className={controlStyles.field__input}
            value={placeholderChar}
            placeholder={DEFAULT_PLACEHOLDER_CHAR}
            maxLength={1}
            onChange={(e) => {
              setPlaceholderChar(e.target.value);
            }}
          />
        </PlaygroundField>
        {letterGroups.length > 0 && (
          <>
            <div className={controlStyles.divider} />
            <BlocksControl groups={letterGroups} onChange={setBlocks} />
          </>
        )}
      </>
    ),
  };
}
