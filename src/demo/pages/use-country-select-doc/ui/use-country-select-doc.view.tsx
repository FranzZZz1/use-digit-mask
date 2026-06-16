import { useState } from 'react';

import { buildRows, USE_COUNTRY_SELECT_PARAMS, USE_COUNTRY_SELECT_RETURN_VALUES } from '@/entities/prop-def';
import { useLang } from '@/shared/i18n';
import { PATHS, SECTION_IDS, TYPE_LINKS } from '@/shared/router';
import { DocPage } from '@/shared/ui/DocPage';
import { PlaygroundSwitchModal } from '@/widgets/playground';

export function UseCountrySelectDocView() {
  const { t } = useLang();
  const d = t.docs.useCountrySelect;
  const s = t.sections;

  const [playgroundProp, setPlaygroundProp] = useState<string | null>(null);

  return (
    <>
      <DocPage
        title="useCountrySelect"
        lead={d.lead}
        overview={d.overview}
        examplesPath={PATHS.useCountrySelectExamples}
        sections={[
          {
            id: SECTION_IDS.parameters,
            heading: s.parameters,
            rows: buildRows(USE_COUNTRY_SELECT_PARAMS, d.params),
            typeLinks: TYPE_LINKS,
            onPropClick: setPlaygroundProp,
          },
          {
            id: SECTION_IDS.returnValue,
            heading: s.returnValue,
            rows: buildRows(USE_COUNTRY_SELECT_RETURN_VALUES, d.returnValues),
            typeLinks: TYPE_LINKS,
          },
        ]}
      />

      {playgroundProp && (
        <PlaygroundSwitchModal
          initialHook="useCountrySelect"
          initialProp={playgroundProp}
          onClose={() => {
            setPlaygroundProp(null);
          }}
        />
      )}
    </>
  );
}
