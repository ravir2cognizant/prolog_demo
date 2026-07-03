import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import type { NavItem } from '../../api/types';
import { PageHeader } from '../../components/PageHeader';

/**
 * CI-001 - Navigation Menu page. The AppSidebar is rendered by AdminShell;
 * this page provides a content view that also lists navigation routes so
 * the menu is reachable by direct URL.
 */
export function NavMenuPage(): JSX.Element {
  const { t } = useTranslation();
  const [items, setItems] = useState<NavItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getNavigationMenu()
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Failed to load menu');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <PageHeader
        title={t('navMenuPage.title')}
        subtitle={t('navMenuPage.intro')}
      />
      {error ? (
        <p role="alert" className="text-semantic-error">
          {error}
        </p>
      ) : null}
      <ul className="list-none p-0">
        {items.map((item) => (
          <li key={item.id} className="py-1">
            {item.enabled ? (
              <Link to={item.route} className="text-brand-blue underline focus-ring">
                {item.label}
              </Link>
            ) : (
              <span className="text-text-placeholder">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
