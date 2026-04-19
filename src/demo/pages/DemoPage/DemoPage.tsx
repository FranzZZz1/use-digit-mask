import { DemoCard } from '../../components/DemoCard';
import { Header } from '../../components/Header';
import { MaskField } from '../../components/MaskField';
import { PhoneField } from '../../components/PhoneField';

import {
  CODE_CREDIT_CARD,
  CODE_DATE,
  CODE_PHONE_AUTO,
  CODE_PHONE_COUNTRY_SELECT,
  CODE_PHONE_RU,
  CODE_PIN,
} from './demoCode';
import styles from './DemoPage.module.scss';

export function DemoPage() {
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.hero__title}>use-digit-mask</h1>
          <p className={styles.hero__desc}>
            Headless React hooks for digit-only masked inputs —<br />
            phones, cards, dates, PINs and more.
          </p>
          <code className={styles.install}>npm install use-digit-mask</code>
        </section>

        <section className={styles.section}>
          <h2 className={styles.section__title}>useMask</h2>
          <p className={styles.section__desc}>Generic hook for any digit-only mask pattern.</p>
          <div className={styles.grid}>
            <DemoCard title="Phone (Russia)" description='mask: "+7 (###) ###-##-##"' code={CODE_PHONE_RU}>
              <MaskField
                activateOnFocus
                deactivateOnEmptyBlur
                mask="+7 (###) ###-##-##"
                allowedPrefixes={['+7', '8']}
              />
            </DemoCard>

            <DemoCard title="Credit card" description='mask: "#### #### #### ####"' code={CODE_CREDIT_CARD}>
              <MaskField mask="#### #### #### ####" />
            </DemoCard>

            <DemoCard title="Date" description='mask: "##/##/####"' code={CODE_DATE}>
              <MaskField mask="##/##/####" />
            </DemoCard>

            <DemoCard title="PIN" description='mask: "####"' code={CODE_PIN}>
              <MaskField trimMaskTail mask="####" />
            </DemoCard>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.section__title}>usePhoneMask</h2>
          <p className={styles.section__desc}>
            Auto-detects mask from dial plans. Handles ambiguous country prefixes (e.g. +7 Russia / +7 Kazakhstan).
          </p>
          <div className={styles.grid}>
            <DemoCard
              title="Auto-detecting"
              description="Type a number — mask and country are detected automatically"
              code={CODE_PHONE_AUTO}
            >
              <PhoneField showCandidates />
            </DemoCard>

            <DemoCard
              title="Country selector"
              description="Pinned: US · GB · RU — type a prefix to sort by closest match"
              code={CODE_PHONE_COUNTRY_SELECT}
            >
              <PhoneField showCountrySelect priorityIds={['US', 'GB', 'RU']} />
            </DemoCard>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          ISC License ·{' '}
          <a href="https://github.com/FranzZZz1/use-digit-mask" target="_blank" rel="noreferrer">
            GitHub
          </a>{' '}
          ·{' '}
          <a href="https://www.npmjs.com/package/use-digit-mask" target="_blank" rel="noreferrer">
            npm
          </a>
        </p>
      </footer>
    </div>
  );
}
