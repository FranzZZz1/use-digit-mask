import { useLang } from '@/shared/i18n';
import { PATHS } from '@/shared/router';
import { DemoCard } from '@/shared/ui/DemoCard';
import { useCountrySelectCards } from '@/widgets/demo-cards';
import { ExamplesPage } from '@/widgets/docs-layout';
import { ExamplesPlayground } from '@/widgets/playground';

import exStyles from '@/shared/ui/doc/examples.module.scss';

export function UseCountrySelectExamplesView() {
  const { t } = useLang();
  const cards = useCountrySelectCards();

  return (
    <ExamplesPage docsPath={PATHS.useCountrySelect} title="useCountrySelect" lead={t.demo.examples.useCountrySelect}>
      <ExamplesPlayground initialHook="useCountrySelect" initialProp="priorityIds" />

      {cards.map(({ id, component, ...card }) => (
        <section key={id} id={id} className={exStyles.card}>
          <DemoCard {...card}>{component}</DemoCard>
        </section>
      ))}
    </ExamplesPage>
  );
}
