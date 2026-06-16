import { buildRows, USE_DATE_MASK_PARAMS } from '@/entities/prop-def';
import { useLang } from '@/shared/i18n';
import { PATHS, SECTION_IDS, TYPE_LINKS } from '@/shared/router';
import { DocPage } from '@/shared/ui/DocPage';
import { buildRecipeDateMax, buildRecipeTimeRange } from '@/widgets/demo-cards';

export function UseDateMaskDocView() {
  const { t } = useLang();
  const d = t.docs.useDateMask;
  const s = t.sections;
  const c = t.demo.codeComments;

  return (
    <DocPage
      title="useDateMask"
      lead={d.lead}
      overview={d.overview}
      examplesPath={PATHS.useDateMaskExamples}
      sections={[
        {
          id: SECTION_IDS.parameters,
          heading: s.parameters,
          rows: buildRows(USE_DATE_MASK_PARAMS, d.params),
          typeLinks: TYPE_LINKS,
        },
        {
          id: SECTION_IDS.recipes,
          heading: d.recipes.heading,
          intro: d.recipes.intro,
          snippets: [
            { tabs: [buildRecipeDateMax(c)], label: d.recipes.dateMax },
            { tabs: [buildRecipeTimeRange(c)], label: d.recipes.timeRange },
          ],
        },
      ]}
    />
  );
}
