import { useLang } from '@/shared/i18n';
import { PATHS } from '@/shared/router';
import { DemoCard } from '@/shared/ui/DemoCard';
import { useMaskCards } from '@/widgets/demo-cards';
import { ExamplesPage } from '@/widgets/docs-layout';
import { ExamplesPlayground } from '@/widgets/playground';

import exStyles from '@/shared/ui/doc/examples.module.scss';

export function UseMaskExamplesView() {
  const { t } = useLang();
  const cards = useMaskCards();

  return (
    <ExamplesPage docsPath={PATHS.useMask} title="useMask" lead={t.demo.examples.useMask}>
      <ExamplesPlayground initialHook="useMask" initialProp="mask" />

      {cards.map(({ id, component, ...card }) => (
        <section key={id} id={id} className={exStyles.card}>
          <DemoCard {...card}>{component}</DemoCard>
        </section>
      ))}
    </ExamplesPage>
  );
}
