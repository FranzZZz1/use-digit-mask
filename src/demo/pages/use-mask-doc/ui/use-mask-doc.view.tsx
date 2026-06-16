import { useState } from 'react';

import { buildRows, USE_MASK_PARAMS, USE_MASK_PARSED_VALUES, USE_MASK_RETURN_PROPS } from '@/entities/prop-def';
import { useLang } from '@/shared/i18n';
import { PATHS, SECTION_IDS, TYPE_LINKS } from '@/shared/router';
import { DocPage } from '@/shared/ui/DocPage';
import { buildRecipeBlocks, buildRecipeOnComplete } from '@/widgets/demo-cards';
import { PlaygroundSwitchModal } from '@/widgets/playground';

export function UseMaskDocView() {
  const { t } = useLang();
  const d = t.docs.useMask;
  const s = t.sections;
  const c = t.demo.codeComments;

  const [playgroundProp, setPlaygroundProp] = useState<string | null>(null);

  return (
    <>
      <DocPage
        title="useMask"
        lead={d.lead}
        overview={d.overview}
        examplesPath={PATHS.useMaskExamples}
        sections={[
          {
            id: SECTION_IDS.parameters,
            heading: s.parameters,
            rows: buildRows(USE_MASK_PARAMS, d.params),
            typeLinks: TYPE_LINKS,
            onPropClick: setPlaygroundProp,
          },
          {
            id: SECTION_IDS.returnValue,
            heading: s.returnValue,
            rows: buildRows(USE_MASK_RETURN_PROPS, d.returnProps),
            typeLinks: TYPE_LINKS,
          },
          {
            id: SECTION_IDS.recipes,
            heading: d.recipes.heading,
            intro: d.recipes.intro,
            snippets: [
              { tabs: [buildRecipeOnComplete(c)], label: d.recipes.onComplete },
              { tabs: buildRecipeBlocks(c), label: d.recipes.blocks },
            ],
          },
          {
            id: SECTION_IDS.parsedValues,
            heading: s.parsedValues,
            intro: d.parsedValues.p,
            rows: buildRows(USE_MASK_PARSED_VALUES, d.parsedValuesProps),
          },
        ]}
      />

      {playgroundProp && (
        <PlaygroundSwitchModal
          initialHook="useMask"
          initialProp={playgroundProp}
          onClose={() => {
            setPlaygroundProp(null);
          }}
        />
      )}
    </>
  );
}
