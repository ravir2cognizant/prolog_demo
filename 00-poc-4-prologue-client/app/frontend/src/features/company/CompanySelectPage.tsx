import { useEffect, useState, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import type { Company } from '../../api/types';
import { PageHeader } from '../../components/PageHeader';

export interface CompanySelectProps {
  value: string;
  onChange: (companyId: string) => void;
  disabled?: boolean;
  error?: string | null;
  /** Override the externally-loaded companies (used when the parent already has them). */
  companies?: Company[];
}

/**
 * CI-008 - Company select dropdown. Standalone embeddable component.
 * Also exported as a route page that lists accessible companies.
 */
export function CompanySelect({
  value,
  onChange,
  disabled = false,
  error = null,
  companies: companiesProp,
}: CompanySelectProps): JSX.Element {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>(companiesProp ?? []);
  const [loading, setLoading] = useState(false);
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  useEffect(() => {
    if (companiesProp) {
      setCompanies(companiesProp);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    apiClient
      .getCompanies()
      .then((res) => {
        if (!cancelled) setCompanies(res.companies);
      })
      .catch(() => {
        if (!cancelled) setCompanies([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companiesProp]);

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {t('company.ariaLabel')}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading || undefined}
        aria-required="true"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        aria-busy={loading || undefined}
        className="form-input"
      >
        <option value="">{t('company.placeholder')}</option>
        {companies.map((c) => (
          <option key={c.companyId} value={c.companyId}>
            {`${c.companyId} - ${c.companyName}`}
          </option>
        ))}
      </select>
      {error ? (
        <span id={errorId} role="alert" className="form-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Standalone route page that lists companies (CI-008 demonstration).
 */
export function CompanySelectPage(): JSX.Element {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  return (
    <section>
      <PageHeader title={t('company.selectTitle')} />
      <CompanySelect value={value} onChange={setValue} />
      {value ? (
        <p className="mt-2 text-sm text-text-secondary">
          {t('company.ariaLabel')}: {value}
        </p>
      ) : null}
    </section>
  );
}
