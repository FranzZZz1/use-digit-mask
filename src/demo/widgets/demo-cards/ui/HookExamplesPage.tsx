import { DemoCard } from '@/shared/ui/DemoCard';
import { ExamplesPage } from '@/shared/ui/ExamplesPage';
import { ExamplesPlayground, type PlaygroundId } from '@/widgets/playground';

import { type DemoCardConfig } from '../types';

import styles from './HookExamplesPage.module.scss';

type PlaygroundConfig = {
  hook: PlaygroundId;
  prop: string;
};

type Props = {
  docsPath: string;
  title: string;
  lead: string;
  cards: DemoCardConfig[];
  playground?: PlaygroundConfig;
};

export function HookExamplesPage({ docsPath, title, lead, cards, playground }: Props) {
  return (
    <ExamplesPage docsPath={docsPath} title={title} lead={lead}>
      {playground && <ExamplesPlayground initialHook={playground.hook} initialProp={playground.prop} />}

      {cards.map(({ id, component, ...card }) => (
        <section key={id} id={id} className={styles.card}>
          <DemoCard {...card}>{component}</DemoCard>
        </section>
      ))}
    </ExamplesPage>
  );
}
