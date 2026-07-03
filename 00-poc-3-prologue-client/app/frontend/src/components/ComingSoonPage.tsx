import { useTranslation } from 'react-i18next';
import PageHeader from './PageHeader.js';

interface ComingSoonPageProps {
  title: string;
  titleKey?: string;
}

export default function ComingSoonPage({ title, titleKey }: ComingSoonPageProps) {
  const { t } = useTranslation();
  const displayTitle = titleKey ? t(titleKey) : title;
  return (
    <div>
      <PageHeader title={displayTitle} />
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <span className="text-2xl text-primary-500" aria-hidden="true">&#9999;</span>
        </div>
        <p className="text-text-secondary text-sm">{t('comingSoon.message')}</p>
      </div>
    </div>
  );
}
