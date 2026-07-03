import { useTranslation } from 'react-i18next';
import { PageHeader } from './PageHeader';

export function ComingSoonPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader title={t('comingSoon.title')} subtitle={t('comingSoon.message')} />
    </div>
  );
}
