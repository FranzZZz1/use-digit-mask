import { buildRows, USE_COUNTRY_SELECT_PARAMS, USE_COUNTRY_SELECT_RETURN_VALUES } from '@/entities/prop-def';
import { useLang } from '@/shared/i18n';
import { SECTION_IDS, TYPE_LINKS } from '@/shared/router';
import { DocPage } from '@/widgets/docs-layout';

export function UseCountrySelectDocView() {
  const { t } = useLang();
  const d = t.docs.useCountrySelect;
  const s = t.sections;

  return (
    <DocPage
      title="useCountrySelect"
      lead={d.lead}
      overview={d.overview}
      sections={[
        {
          id: SECTION_IDS.parameters,
          heading: s.parameters,
          rows: buildRows(USE_COUNTRY_SELECT_PARAMS, d.params),
          typeLinks: TYPE_LINKS,
        },
        {
          id: SECTION_IDS.returnValue,
          heading: s.returnValue,
          rows: buildRows(USE_COUNTRY_SELECT_RETURN_VALUES, d.returnValues),
          typeLinks: TYPE_LINKS,
        },
      ]}
    />
  );
}
