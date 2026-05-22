import { useState } from 'react';

import { MaskField } from '@/entities/phone-input/ui/MaskField/MaskField';
import { DEFAULT_MASK, DEFAULT_PLACEHOLDER_CHAR } from '@/shared/lib';
import { withGhostScssTab } from '@/shared/lib/snippetUtils';
import { PlaygroundField, type PlaygroundSlot, serializeSchemaState, usePlaygroundState } from '@/shared/ui/Playground';

import { buildUseMaskCode } from './buildCode';
import { USEMASK_SCHEMA, type UseMaskOptions } from './schema';

import controlStyles from '@/shared/ui/Playground/PlaygroundControls/PlaygroundControls.module.scss';

export function useMaskPlaygroundSlot(
  initialProp: string,
  isAlternative: boolean,
  tooltips: Record<string, string>,
): PlaygroundSlot {
  const [mask, setMask] = useState(DEFAULT_MASK);
  const [placeholderChar, setPlaceholderChar] = useState(DEFAULT_PLACEHOLDER_CHAR);
  const pg = usePlaygroundState(USEMASK_SCHEMA, initialProp);

  const options: UseMaskOptions = {
    placeholderChar: placeholderChar || DEFAULT_PLACEHOLDER_CHAR,
    ...serializeSchemaState<UseMaskOptions>(USEMASK_SCHEMA, pg.state),
  };

  return {
    pg,
    schema: USEMASK_SCHEMA,
    tabs: withGhostScssTab(
      [
        {
          label: 'tsx',
          code: buildUseMaskCode(mask, placeholderChar, pg.state, isAlternative),
          lang: 'tsx',
          hasJsVariant: true,
        },
      ],
      !!options.ghostChar,
    ),
    preview: <MaskField mask={mask} {...options} ghost={!!options.ghostChar} />,
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
      </>
    ),
  };
}
