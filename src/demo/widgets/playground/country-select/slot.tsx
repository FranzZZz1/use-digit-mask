import { withGhostScssTab } from '@/shared/lib/snippetUtils';
import { type PlaygroundSlot, serializeSchemaState, usePlaygroundState } from '@/shared/ui/Playground';

import { buildUseCountrySelectCode } from './buildCode';
import { USECOUNTRYSELECT_SCHEMA, type UseCountrySelectOptions } from './schema';
import { UseCountrySelectPreview } from './UseCountrySelectPreview';

export function useCountrySelectPlaygroundSlot(initialProp: string): PlaygroundSlot {
  const pg = usePlaygroundState(USECOUNTRYSELECT_SCHEMA, initialProp);

  const options: UseCountrySelectOptions = {
    ...serializeSchemaState<UseCountrySelectOptions>(USECOUNTRYSELECT_SCHEMA, pg.state),
    ghost: pg.state.ghostChar?.enabled ?? false,
  };

  return {
    pg,
    schema: USECOUNTRYSELECT_SCHEMA,
    tabs: withGhostScssTab(
      [{ label: 'tsx', code: buildUseCountrySelectCode(pg.state), lang: 'tsx', hasJsVariant: false }],
      !!options.ghost,
    ),
    preview: <UseCountrySelectPreview options={options} />,
    primaryFields: undefined,
  };
}
