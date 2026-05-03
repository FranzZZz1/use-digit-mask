import { buildRows, USE_MASK_PARAMS, USE_MASK_PARSED_VALUES, USE_MASK_RETURN_PROPS } from '@/entities/prop-def';
import { useLang } from '@/shared/i18n';
import { SECTION_IDS, TYPE_LINKS } from '@/shared/router';
import { DocPage } from '@/widgets/docs-layout';

export function UseMaskDocView() {
  const { t } = useLang();
  const d = t.docs.useMask;
  const s = t.sections;

  return (
    <DocPage
      title="useMask"
      lead={d.lead}
      overview={d.overview}
      sections={[
        {
          id: SECTION_IDS.parameters,
          heading: s.parameters,
          rows: buildRows(USE_MASK_PARAMS, d.params),
          typeLinks: TYPE_LINKS,
        },
        {
          id: SECTION_IDS.returnValue,
          heading: s.returnValue,
          rows: buildRows(USE_MASK_RETURN_PROPS, d.returnProps),
          typeLinks: TYPE_LINKS,
        },
        {
          id: SECTION_IDS.parsedValues,
          heading: s.parsedValues,
          intro: d.parsedValues.p,
          rows: buildRows(USE_MASK_PARSED_VALUES, d.parsedValuesProps),
        },
      ]}
    />
  );
}
