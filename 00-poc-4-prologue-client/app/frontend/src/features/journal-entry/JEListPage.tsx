import { useLoaderData, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';

interface JEListLoaderData {
  ids: number[];
  totalCount: number;
}

export async function jeListLoader(): Promise<JEListLoaderData> {
  const first = await apiClient.getNavigationContext(1);
  const collected: number[] = [first.currentJournalId];
  let cursor = first;
  while (cursor.nextJournalId != null && collected.length < 50) {
    cursor = await apiClient.getNavigationContext(cursor.nextJournalId);
    collected.push(cursor.currentJournalId);
  }
  return { ids: collected, totalCount: first.totalCount };
}

export function JEListPage(): JSX.Element {
  const { t } = useTranslation();
  const { ids, totalCount } = useLoaderData() as JEListLoaderData;

  return (
    <section>
      <PageHeader
        title={t('je.headerTitle')}
        actions={
          <Link to="/gl/journal-entries/new">
            <Button>{t('je.formTitleCreate')}</Button>
          </Link>
        }
      />
      <p className="text-sm text-text-secondary mb-2">
        {t('je.list.totalCount', { count: totalCount })}
      </p>
      <ul className="list-none p-0">
        {ids.map((id) => (
          <li key={id} className="py-1">
            <Link
              to={`/gl/journal-entries/${id}`}
              className="text-brand-blue underline focus-ring"
            >
              Journal Entry #{id}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
