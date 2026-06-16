import { useState } from 'react';
import { DEFAULT_DIAL_PLANS_MAP, type DialPlan } from 'use-digit-mask';

import { PhoneField } from '@/entities/phone-input/ui/PhoneField/PhoneField';
import { useLang } from '@/shared/i18n';
import { DEFAULT_PLACEHOLDER_CHAR } from '@/shared/lib';
import { withGhostScssTab } from '@/shared/lib/snippetUtils';
import { PlaygroundField, type PlaygroundSlot, serializeSchemaState, usePlaygroundState } from '@/shared/ui/Playground';
import { VariantSelect, type VariantSelectOption } from '@/shared/ui/VariantSelect';

import { buildUsePhoneMaskTab } from './buildCode';
import { USEPHONE_SCHEMA, type UsePhoneMaskOptions } from './schema';

import controlStyles from '@/shared/ui/Playground/PlaygroundControls/PlaygroundControls.module.scss';

const POPULAR_COUNTRY_IDS: (keyof typeof DEFAULT_DIAL_PLANS_MAP)[] = [
  'RU',
  'US',
  'GB',
  'DE',
  'FR',
  'UA',
  'BY',
  'KZ',
  'CN',
  'IN',
  'BR',
  'AU',
  'CA',
  'TR',
  'JP',
];

export function usePhoneMaskPlaygroundSlot(initialProp: string, tooltips: Record<string, string>): PlaygroundSlot {
  const [placeholderChar, setPlaceholderChar] = useState(DEFAULT_PLACEHOLDER_CHAR);
  const [country, setCountry] = useState(() => (initialProp === 'country' ? POPULAR_COUNTRY_IDS[0] : ''));
  const { lang } = useLang();
  const pg = usePlaygroundState(USEPHONE_SCHEMA, initialProp);

  const options: UsePhoneMaskOptions = {
    ...(placeholderChar !== DEFAULT_PLACEHOLDER_CHAR ? { placeholderChar } : {}),
    ...serializeSchemaState<UsePhoneMaskOptions>(USEPHONE_SCHEMA, pg.state),
  };

  const countryOptions: VariantSelectOption<string>[] = [
    { label: '—', value: '' },
    ...POPULAR_COUNTRY_IDS.map((id) => {
      const plan = DEFAULT_DIAL_PLANS_MAP[id] as DialPlan;
      const prefix = (plan.hasPlus !== false ? '+' : '') + plan.cc;
      const label = plan.label?.[lang] ?? id;
      return { label: `${label} (${prefix})`, value: id };
    }),
  ];

  return {
    pg,
    schema: USEPHONE_SCHEMA,
    tabs: withGhostScssTab(
      [buildUsePhoneMaskTab(placeholderChar, pg.state, country || undefined)],
      !!options.ghostChar,
    ),
    preview: (
      <PhoneField
        showCandidates
        ghost={!!options.ghostChar}
        overwrite={options.overwrite}
        country={country || undefined}
        {...options}
      />
    ),
    primaryFields: (
      <>
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
        <PlaygroundField name="country" tooltip={tooltips.country}>
          <VariantSelect<string>
            options={countryOptions}
            value={country}
            triggerClassName={controlStyles.field__input}
            onChange={setCountry}
          />
        </PlaygroundField>
      </>
    ),
  };
}
