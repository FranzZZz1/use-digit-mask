import { NavLink } from 'react-router-dom';

import { MaskField, PhoneField } from '@/entities/phone-input';
import { buildCodeCountrySelectRadix, buildCodePhoneCountrySelect } from '@/pages/demo/const/useCountrySelectCode';
import {
  buildCodeNormalize,
  buildCodePhoneRu,
  buildCodePin,
  CODE_CREDIT_CARD,
  CODE_DATE,
} from '@/pages/demo/const/useMaskCode';
import { buildCodePhoneAuto } from '@/pages/demo/const/usePhoneMaskCode';
import { GITHUB_URL, NPM_URL } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { PATHS, SECTION_IDS } from '@/shared/router';
import { DemoCard } from '@/shared/ui/DemoCard';
import { PageWithBanner } from '@/shared/ui/PageWithBanner';
import { Header } from '@/widgets/header';

import styles from './demo.module.scss';

function normalizeTime(digits: string): string {
  let result = digits;

  if (result.length >= 2) {
    const hh = Math.min(parseInt(result.slice(0, 2), 10), 23);
    result = String(hh).padStart(2, '0') + result.slice(2);
  }

  if (result.length >= 4) {
    const mm = Math.min(parseInt(result.slice(2, 4), 10), 59);
    result = result.slice(0, 2) + String(mm).padStart(2, '0');
  }

  return result;
}

export function DemoView() {
  const { t } = useLang();
  const c = t.demo.cards;
  const sec = t.demo.sections;
  const cc = t.demo.codeComments;

  return (
    <PageWithBanner className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.hero__title}>use-digit-mask</h1>
          <p className={styles.hero__desc}>{t.demo.hero.desc}</p>
          <code className={styles.install}>npm install use-digit-mask</code>
        </section>

        <section id={SECTION_IDS.home.useMask} className={styles.section}>
          <div className={styles.section__header}>
            <h2 className={styles.section__title}>{sec.useMask.title}</h2>
            <NavLink to={PATHS.useMask} className={styles.section__docs}>
              {t.nav.docs} →
            </NavLink>
          </div>
          <p className={styles.section__desc}>{sec.useMask.desc}</p>
          <div className={styles.grid}>
            <DemoCard title={c.phoneRu.title} description={c.phoneRu.desc} code={buildCodePhoneRu(cc)}>
              <MaskField
                activateOnFocus
                deactivateOnEmptyBlur
                mask="+7 (###) ###-##-##"
                allowedPrefixes={['+7', '8']}
              />
            </DemoCard>

            <DemoCard title={c.creditCard.title} description={c.creditCard.desc} code={CODE_CREDIT_CARD}>
              <MaskField mask="#### #### #### ####" />
            </DemoCard>

            <DemoCard title={c.date.title} description={c.date.desc} code={CODE_DATE}>
              <MaskField mask="##/##/####" />
            </DemoCard>

            <DemoCard title={c.pin.title} description={c.pin.desc} code={buildCodePin(cc)}>
              <MaskField trimMaskTail mask="####" />
            </DemoCard>

            <DemoCard title={c.normalize.title} description={c.normalize.desc} code={buildCodeNormalize(cc)}>
              <MaskField mask="##:##" normalize={normalizeTime} />
            </DemoCard>
          </div>
        </section>

        <section id={SECTION_IDS.home.usePhoneMask} className={styles.section}>
          <div className={styles.section__header}>
            <h2 className={styles.section__title}>{sec.usePhoneMask.title}</h2>
            <NavLink to={PATHS.usePhoneMask} className={styles.section__docs}>
              {t.nav.docs} →
            </NavLink>
          </div>
          <p className={styles.section__desc}>{sec.usePhoneMask.desc}</p>
          <div className={styles.grid}>
            <DemoCard title={c.phoneAuto.title} description={c.phoneAuto.desc} code={buildCodePhoneAuto(cc)}>
              <PhoneField showCandidates />
            </DemoCard>
          </div>
        </section>

        <section id={SECTION_IDS.home.useCountrySelect} className={styles.section}>
          <div className={styles.section__header}>
            <h2 className={styles.section__title}>{sec.useCountrySelect.title}</h2>
            <NavLink to={PATHS.useCountrySelect} className={styles.section__docs}>
              {t.nav.docs} →
            </NavLink>
          </div>
          <p className={styles.section__desc}>{sec.useCountrySelect.desc}</p>
          <div className={styles.grid}>
            <DemoCard
              title={c.countrySelect.title}
              description={c.countrySelect.desc}
              variants={[
                {
                  label: 'Custom',
                  component: <PhoneField showCountrySelect priorityIds={['US', 'GB', 'RU']} />,
                  code: buildCodePhoneCountrySelect(cc),
                },
                {
                  label: 'Radix UI',
                  badge: '@radix-ui/react-popover',
                  component: <PhoneField showCountrySelect radixSelect priorityIds={['US', 'GB', 'RU']} />,
                  code: buildCodeCountrySelectRadix(cc),
                },
              ]}
            />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          ISC License ·{' '}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>{' '}
          ·{' '}
          <a href={NPM_URL} target="_blank" rel="noreferrer">
            npm
          </a>
        </p>
      </footer>
    </PageWithBanner>
  );
}
