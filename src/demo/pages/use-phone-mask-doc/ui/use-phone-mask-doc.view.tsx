import { useState } from 'react';

import {
  buildRows,
  DIAL_PLAN_FIELDS,
  PHONE_MASK_CANDIDATE_FIELDS,
  USE_PHONE_MASK_PARAMS,
  USE_PHONE_MASK_RETURN_VALUES,
} from '@/entities/prop-def';
import { buildSnippetAdd, buildSnippetOverride, buildSnippetRemove } from '@/pages/use-phone-mask-doc';
import { useLang } from '@/shared/i18n';
import { createCodeTab } from '@/shared/lib/snippetUtils';
import { PATHS, SECTION_IDS, TYPE_LINKS } from '@/shared/router';
import { DocPage } from '@/shared/ui/DocPage';
import { PlaygroundSwitchModal } from '@/widgets/playground';

export function UsePhoneMaskDocView() {
  const { t } = useLang();
  const d = t.docs.usePhoneMask;
  const s = t.sections;
  const c = t.demo.codeComments;

  const [playgroundProp, setPlaygroundProp] = useState<string | null>(null);

  return (
    <>
      <DocPage
        title="usePhoneMask"
        lead={d.lead}
        overview={d.overview}
        examplesPath={PATHS.usePhoneMaskExamples}
        sections={[
          {
            id: SECTION_IDS.parameters,
            heading: s.parameters,
            rows: buildRows(USE_PHONE_MASK_PARAMS, d.params),
            typeLinks: TYPE_LINKS,
            onPropClick: setPlaygroundProp,
          },
          {
            id: SECTION_IDS.returnValue,
            heading: s.returnValue,
            rows: buildRows(USE_PHONE_MASK_RETURN_VALUES, d.returnValues),
            typeLinks: TYPE_LINKS,
          },
          {
            id: SECTION_IDS.dialPlan,
            heading: s.dialPlan,
            rows: buildRows(DIAL_PLAN_FIELDS, d.dialPlan),
          },
          {
            id: SECTION_IDS.phoneMaskCandidate,
            heading: s.phoneMaskCandidate,
            rows: buildRows(PHONE_MASK_CANDIDATE_FIELDS, d.phoneMaskCandidate),
          },
          {
            id: SECTION_IDS.customization,
            heading: d.customization.heading,
            intro: d.customization.intro,
            snippets: [
              { tabs: [createCodeTab('', buildSnippetOverride(c))], label: d.customization.snippetOverride },
              { tabs: [createCodeTab('', buildSnippetRemove(c))], label: d.customization.snippetRemove },
              { tabs: [createCodeTab('', buildSnippetAdd(c))], label: d.customization.snippetAdd },
            ],
          },
        ]}
      />

      {playgroundProp && (
        <PlaygroundSwitchModal
          initialHook="usePhoneMask"
          initialProp={playgroundProp}
          onClose={() => {
            setPlaygroundProp(null);
          }}
        />
      )}
    </>
  );
}
