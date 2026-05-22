import { useState } from 'react';

import { DemoSection } from '@/pages/demo';
import { useLang } from '@/shared/i18n';
import { PATHS, SECTION_IDS } from '@/shared/router';
import { DemoCard } from '@/shared/ui/DemoCard';
import { PageWithBanner } from '@/shared/ui/PageWithBanner';
import { PlaygroundCard } from '@/shared/ui/PlaygroundCard';
import { useCountrySelectCards, useMaskCards, usePhoneMaskCards } from '@/widgets/demo-cards';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';
import { PlaygroundSwitchModal } from '@/widgets/playground';

import styles from './demo.module.scss';

const PREVIEW_COUNT = 3;

export function DemoView() {
  const { t } = useLang();
  const sec = t.demo.sections;

  const maskCards = useMaskCards();
  const phoneMaskCards = usePhoneMaskCards();
  const countrySelectCards = useCountrySelectCards();

  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  return (
    <PageWithBanner className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.hero__title}>use-digit-mask</h1>
          <p className={styles.hero__desc}>{t.demo.hero.desc}</p>
          <code className={styles.install}>npm install use-digit-mask</code>
        </section>

        <DemoSection
          id={SECTION_IDS.home.useMask}
          title={sec.useMask.title}
          desc={sec.useMask.desc}
          docTo={PATHS.useMask}
          moreTo={maskCards.length > PREVIEW_COUNT ? PATHS.useMaskExamples : undefined}
        >
          {maskCards.slice(0, PREVIEW_COUNT - 1).map(({ id, component, ...card }) => (
            <DemoCard key={id} {...card}>
              {component}
            </DemoCard>
          ))}
          <PlaygroundCard
            onOpen={() => {
              setIsPlaygroundOpen(true);
            }}
          />
        </DemoSection>

        <DemoSection
          id={SECTION_IDS.home.usePhoneMask}
          title={sec.usePhoneMask.title}
          desc={sec.usePhoneMask.desc}
          docTo={PATHS.usePhoneMask}
          moreTo={phoneMaskCards.length > PREVIEW_COUNT ? PATHS.usePhoneMaskExamples : undefined}
        >
          {phoneMaskCards.slice(0, PREVIEW_COUNT).map(({ id, component, ...card }) => (
            <DemoCard key={id} {...card}>
              {component}
            </DemoCard>
          ))}
        </DemoSection>

        <DemoSection
          id={SECTION_IDS.home.useCountrySelect}
          title={sec.useCountrySelect.title}
          desc={sec.useCountrySelect.desc}
          docTo={PATHS.useCountrySelect}
          moreTo={countrySelectCards.length > PREVIEW_COUNT ? PATHS.useCountrySelectExamples : undefined}
        >
          {countrySelectCards.slice(0, PREVIEW_COUNT).map(({ id, component, ...card }) => (
            <DemoCard key={id} {...card}>
              {component}
            </DemoCard>
          ))}
        </DemoSection>
      </main>

      {isPlaygroundOpen && (
        <PlaygroundSwitchModal
          initialHook="useMask"
          initialProp="mask"
          onClose={() => {
            setIsPlaygroundOpen(false);
          }}
        />
      )}

      <Footer />
    </PageWithBanner>
  );
}
