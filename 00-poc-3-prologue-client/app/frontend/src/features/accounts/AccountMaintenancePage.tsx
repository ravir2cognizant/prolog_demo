import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import Button from '../../components/Button.js';
import Field from '../../components/Field.js';
import PageHeader from '../../components/PageHeader.js';
import StatusBadge from '../../components/StatusBadge.js';
import type { Company, Account, AccountBalance } from '../../api/schema.js';

const accountSchema = z.object({
  companyId: z.string().min(1, 'Required'),
  code: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  active: z.boolean(),
});
type AccountFormValues = z.infer<typeof accountSchema>;

const ACCOUNT_TYPES: AccountFormValues['type'][] = ['asset', 'liability', 'equity', 'revenue', 'expense'];

export default function AccountMaintenancePage() {
  const { t } = useTranslation();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { companyId: '', code: '', description: '', type: 'asset', active: true },
  });

  useEffect(() => {
    apiClient.GET('/companies').then(({ data }) => {
      const items = data?.items ?? [];
      setCompanies(items);
      if (items[0]) setCompanyId(items[0].id);
    });
  }, []);

  const loadAccounts = useCallback(async (cid: string, q: string) => {
    if (!cid) return;
    setLoadingList(true);
    try {
      const { data } = await apiClient.GET('/accounts', {
        params: { query: { companyId: cid, search: q || undefined } },
      });
      setAccounts(data?.items ?? []);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { loadAccounts(companyId, search); }, [companyId, search, loadAccounts]);

  const selectAccount = async (acct: Account) => {
    setIsNew(false);
    setSelectedId(acct.id);
    reset({
      companyId: acct.companyId,
      code: acct.code,
      description: acct.description,
      type: acct.type,
      active: acct.active,
    });
    const { data: balData } = await apiClient.GET('/accounts/{id}/balances', {
      params: { path: { id: acct.id }, query: { fiscalYearId: 'fy-2026' } },
    });
    setBalances(balData?.balances ?? []);
  };

  const startNew = () => {
    setIsNew(true);
    setSelectedId(null);
    setBalances([]);
    reset({ companyId, code: '', description: '', type: 'asset', active: true });
  };

  const notify = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const onSubmit = async (values: AccountFormValues) => {
    setSaving(true);
    try {
      if (isNew) {
        const { data } = await apiClient.POST('/accounts', { body: values as never });
        if (data) {
          await loadAccounts(companyId, search);
          setIsNew(false);
          setSelectedId((data as Account).id);
          notify(t('account.savedSuccess'));
        }
      } else if (selectedId) {
        const { data } = await apiClient.PUT('/accounts/{id}', {
          params: { path: { id: selectedId } },
          body: { description: values.description, type: values.type, active: values.active },
        });
        if (data) {
          await loadAccounts(companyId, search);
          notify(t('account.savedSuccess'));
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('account.title')}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="acct-company" className="text-sm font-medium text-text-primary whitespace-nowrap">
                {t('common.company')}
              </label>
              <select
                id="acct-company"
                value={companyId}
                onChange={(e) => { setCompanyId(e.target.value); setSelectedId(null); setIsNew(false); }}
                className="input-base w-48"
              >
                {companies.map((co) => <option key={co.id} value={co.id}>{co.name}</option>)}
              </select>
            </div>
            <Button size="sm" onClick={startNew}>{t('account.newAccount')}</Button>
          </div>
        }
      />

      <div className="flex gap-4" style={{ minHeight: 480 }}>
        {/* Left: list */}
        <div className="flex flex-col gap-3" style={{ width: 380, flexShrink: 0 }}>
          <input
            type="search"
            placeholder={t('account.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base"
            aria-label={t('common.search')}
          />

          <div className="overflow-y-auto rounded-md border border-border-default bg-surface-white flex-1">
            {loadingList ? (
              <p className="px-4 py-6 text-sm text-text-placeholder text-center">{t('common.loading')}</p>
            ) : accounts.length === 0 ? (
              <p className="px-4 py-6 text-sm text-text-placeholder text-center">{t('common.noResults')}</p>
            ) : (
              <ul className="divide-y divide-border-default">
                {accounts.map((acct) => (
                  <li key={acct.id}>
                    <button
                      type="button"
                      onClick={() => selectAccount(acct)}
                      className={`w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors duration-75 ${
                        selectedId === acct.id ? 'bg-primary-50 border-l-2 border-primary-500' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-text-primary font-mono">{acct.code}</div>
                      <div className="text-xs text-text-secondary mt-0.5">{acct.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-placeholder capitalize">{t(`account.types.${acct.type}`)}</span>
                        <StatusBadge status={acct.active ? 'active' : 'inactive'} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: form */}
        <div className="flex-1">
          {!selectedId && !isNew ? (
            <div className="flex flex-col items-center justify-center h-full text-text-placeholder text-sm">
              {t('common.noResults')}
            </div>
          ) : (
            <div className="bg-surface-white rounded-md border border-border-default p-5">
              <h2 className="text-base font-semibold text-text-primary mb-4">
                {isNew ? t('account.newTitle') : t('account.detailTitle')}
              </h2>

              {msg && (
                <div className="mb-4 px-3 py-2 rounded-md bg-state-successLight text-state-success text-sm">
                  {msg}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <Field id="acct-code" label={t('account.code')} error={errors.code?.message} required>
                    <input
                      id="acct-code"
                      type="text"
                      {...register('code')}
                      readOnly={!isNew}
                      className={`input-base${!isNew ? ' field-readonly' : ''}${errors.code ? ' input-error' : ''}`}
                    />
                  </Field>

                  <Field id="acct-type" label={t('account.type')} error={errors.type?.message} required>
                    <select id="acct-type" {...register('type')} className={`input-base${errors.type ? ' input-error' : ''}`}>
                      {ACCOUNT_TYPES.map((t_) => (
                        <option key={t_} value={t_}>{t(`account.types.${t_}`)}</option>
                      ))}
                    </select>
                  </Field>

                  <Field id="acct-desc" label={t('account.description')} error={errors.description?.message} required className="col-span-2">
                    <input
                      id="acct-desc"
                      type="text"
                      {...register('description')}
                      className={`input-base${errors.description ? ' input-error' : ''}`}
                    />
                  </Field>

                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      id="acct-active"
                      type="checkbox"
                      {...register('active')}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <label htmlFor="acct-active" className="text-sm font-medium text-text-primary">
                      {t('account.active')}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setSelectedId(null); setIsNew(false); }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? t('common.loading') : t('common.save')}
                  </Button>
                </div>
              </form>

              {/* Balances (edit mode only) */}
              {!isNew && balances.length > 0 && (
                <div className="mt-6 border-t border-border-default pt-4">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">{t('account.balances')}</h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-border-default">
                        <th className="px-3 py-2 text-left font-semibold text-text-secondary">{t('account.period')}</th>
                        <th className="px-3 py-2 text-right font-semibold text-text-secondary">{t('account.openingBalance')}</th>
                        <th className="px-3 py-2 text-right font-semibold text-text-secondary">{t('account.debit')}</th>
                        <th className="px-3 py-2 text-right font-semibold text-text-secondary">{t('account.credit')}</th>
                        <th className="px-3 py-2 text-right font-semibold text-text-secondary">{t('account.closingBalance')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balances.map((b) => (
                        <tr key={b.periodId} className="border-b border-border-default last:border-0">
                          <td className="px-3 py-2 text-text-primary">{b.periodName}</td>
                          <td className="px-3 py-2 text-right">{b.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 text-right">{b.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 text-right">{b.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2 text-right font-medium">{b.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
