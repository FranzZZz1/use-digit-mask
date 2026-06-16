import { useLang } from '@/shared/i18n';
import { PATHS } from '@/shared/router';
import {
  HookExamplesPage,
  useCountrySelectCards,
  useDateMaskCards,
  useMaskCards,
  usePhoneMaskCards,
} from '@/widgets/demo-cards';

export function UseMaskExamplesView() {
  const { t } = useLang();
  return (
    <HookExamplesPage
      docsPath={PATHS.useMask}
      title="useMask"
      lead={t.demo.examples.useMask}
      cards={useMaskCards()}
      playground={{ hook: 'useMask', prop: 'mask' }}
    />
  );
}

export function UseDateMaskExamplesView() {
  const { t } = useLang();
  return (
    <HookExamplesPage
      docsPath={PATHS.useDateMask}
      title="useDateMask"
      lead={t.demo.examples.useDateMask}
      cards={useDateMaskCards()}
    />
  );
}

export function UsePhoneMaskExamplesView() {
  const { t } = useLang();
  return (
    <HookExamplesPage
      docsPath={PATHS.usePhoneMask}
      title="usePhoneMask"
      lead={t.demo.examples.usePhoneMask}
      cards={usePhoneMaskCards()}
      playground={{ hook: 'usePhoneMask', prop: 'trimMaskTail' }}
    />
  );
}

export function UseCountrySelectExamplesView() {
  const { t } = useLang();
  return (
    <HookExamplesPage
      docsPath={PATHS.useCountrySelect}
      title="useCountrySelect"
      lead={t.demo.examples.useCountrySelect}
      cards={useCountrySelectCards()}
      playground={{ hook: 'useCountrySelect', prop: 'priorityIds' }}
    />
  );
}
