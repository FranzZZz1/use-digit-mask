import { useState } from 'react';

import { PhoneField } from '@/entities/phone-input/ui/PhoneField/PhoneField';
import { DEFAULT_PLACEHOLDER_CHAR } from '@/shared/lib';
import { withGhostScssTab } from '@/shared/lib/snippetUtils';
import { PlaygroundField, type PlaygroundSlot, serializeSchemaState, usePlaygroundState } from '@/shared/ui/Playground';

import { buildUsePhoneMaskCode } from './buildCode';
import { USEPHONE_SCHEMA, type UsePhoneMaskOptions } from './schema';

import controlStyles from '@/shared/ui/Playground/PlaygroundControls/PlaygroundControls.module.scss';

export function usePhoneMaskPlaygroundSlot(
  initialProp: string,
  isAlternative: boolean,
  tooltips: Record<string, string>,
): PlaygroundSlot {
  const [placeholderChar, setPlaceholderChar] = useState(DEFAULT_PLACEHOLDER_CHAR);
  const pg = usePlaygroundState(USEPHONE_SCHEMA, initialProp);

  const options: UsePhoneMaskOptions = {
    ...(placeholderChar !== DEFAULT_PLACEHOLDER_CHAR ? { placeholderChar } : {}),
    ...serializeSchemaState<UsePhoneMaskOptions>(USEPHONE_SCHEMA, pg.state),
  };

  return {
    pg,
    schema: USEPHONE_SCHEMA,
    tabs: withGhostScssTab(
      [
        {
          label: 'tsx',
          code: buildUsePhoneMaskCode(placeholderChar, pg.state, isAlternative),
          lang: 'tsx',
          hasJsVariant: true,
        },
      ],
      !!options.ghostChar,
    ),
    preview: <PhoneField showCandidates ghost={!!options.ghostChar} {...options} />,
    primaryFields: (
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
    ),
  };
}
