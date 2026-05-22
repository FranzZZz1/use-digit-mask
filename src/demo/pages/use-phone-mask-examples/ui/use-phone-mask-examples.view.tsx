import { useLang } from '@/shared/i18n';
import { PATHS } from '@/shared/router';
import { DemoCard } from '@/shared/ui/DemoCard';
import { usePhoneMaskCards } from '@/widgets/demo-cards';
import { ExamplesPage } from '@/widgets/docs-layout';
import { ExamplesPlayground } from '@/widgets/playground';

import exStyles from '@/shared/ui/doc/examples.module.scss';

export function UsePhoneMaskExamplesView() {
  const { t } = useLang();
  const cards = usePhoneMaskCards();

  return (
    <ExamplesPage docsPath={PATHS.usePhoneMask} title="usePhoneMask" lead={t.demo.examples.usePhoneMask}>
      <ExamplesPlayground initialHook="usePhoneMask" initialProp="trimMaskTail" />
      {cards.map(({ id, component, ...card }) => (
        <section key={id} id={id} className={exStyles.card}>
          <DemoCard {...card}>{component}</DemoCard>
        </section>
      ))}
    </ExamplesPage>
  );
}
