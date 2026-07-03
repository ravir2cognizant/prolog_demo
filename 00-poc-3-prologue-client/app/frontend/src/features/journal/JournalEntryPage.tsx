import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import Button from '../../components/Button.js';
import Field from '../../components/Field.js';
import Modal from '../../components/Modal.js';
import PageHeader from '../../components/PageHeader.js';
import StatusBadge from '../../components/StatusBadge.js';
import type {
  Company,
  Currency,
  RefItem,
  AllocMethod,
  RoutingRule,
  Account,
  JournalEntry,
} from '../../api/schema.js';

const lineSchema = z.object({
  accountId: z.string().min(1, 'Required'),
  currencyId: z.string().default('USD'),
  debit: z.string().default('0'),
  credit: z.string().default('0'),
  description: z.string().default(''),
  referenceNo: z.string().default(''),
});

const jeSchema = z.object({
  companyId: z.string().min(1, 'Required'),
  entryType: z.string().min(1, 'Required'),
  transactionDate: z.string().min(1, 'Required'),
  autoReversalDate: z.string().default(''),
  description: z.string().min(1, 'Required'),
  sourceDocument: z.string().default(''),
  routingRuleId: z.string().default(''),
  allocationMethodId: z.string().default(''),
  lines: z.array(lineSchema).min(2, 'At least 2 lines required'),
});

type JEFormValues = z.infer<typeof jeSchema>;

const emptyLine = (): z.infer<typeof lineSchema> => ({
  accountId: '',
  currencyId: 'USD',
  debit: '0',
  credit: '0',
  description: '',
  referenceNo: '',
});

const today = () => new Date().toISOString().slice(0, 10);

export default function JournalEntryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [entryTypes, setEntryTypes] = useState<RefItem[]>([]);
  const [sourceDocs, setSourceDocs] = useState<RefItem[]>([]);
  const [allocMethods, setAllocMethods] = useState<AllocMethod[]>([]);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refLoaded, setRefLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [reverseOpen, setReverseOpen] = useState(false);
  const [reversalDate, setReversalDate] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<JEFormValues>({
    resolver: zodResolver(jeSchema),
    defaultValues: {
      companyId: '',
      entryType: '',
      transactionDate: today(),
      autoReversalDate: '',
      description: '',
      sourceDocument: '',
      routingRuleId: '',
      allocationMethodId: '',
      lines: [emptyLine(), emptyLine()],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const watchedLines = watch('lines');
  const watchedCompanyId = watch('companyId');

  const totalDebit = (watchedLines ?? []).reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = (watchedLines ?? []).reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.005;

  // Load reference data once
  useEffect(() => {
    Promise.all([
      apiClient.GET('/companies'),
      apiClient.GET('/currencies'),
      apiClient.GET('/journal-entry-types'),
      apiClient.GET('/source-documents'),
      apiClient.GET('/allocation-methods'),
      apiClient.GET('/routing-rules'),
    ]).then(([co, cu, jet, sd, am, rr]) => {
      setCompanies(co.data?.items ?? []);
      setCurrencies(cu.data?.items ?? []);
      setEntryTypes(jet.data?.items ?? []);
      setSourceDocs(sd.data?.items ?? []);
      setAllocMethods(am.data?.items ?? []);
      setRoutingRules(rr.data?.items ?? []);
      setRefLoaded(true);
    });
  }, []);

  // Load entry for edit
  useEffect(() => {
    if (!id || !refLoaded) return;
    apiClient.GET('/journal-entries/{id}', { params: { path: { id } } }).then(({ data }) => {
      if (!data) return;
      setSavedEntry(data);
      reset({
        companyId: data.companyId,
        entryType: data.entryType,
        transactionDate: data.transactionDate,
        autoReversalDate: data.autoReversalDate ?? '',
        description: data.description,
        sourceDocument: data.sourceDocument ?? '',
        routingRuleId: data.routingRuleId ?? '',
        allocationMethodId: data.allocationMethodId ?? '',
        lines: data.lines.map((l) => ({
          accountId: l.accountId,
          currencyId: l.currencyId,
          debit: String(l.debit),
          credit: String(l.credit),
          description: l.description,
          referenceNo: l.referenceNo,
        })),
      });
    });
  }, [id, refLoaded, reset]);

  // Load accounts when company changes
  const loadAccounts = useCallback(async (cid: string) => {
    if (!cid) return;
    const { data } = await apiClient.GET('/accounts', {
      params: { query: { companyId: cid, activeOnly: true } },
    });
    setAccounts(data?.items ?? []);
  }, []);

  useEffect(() => { loadAccounts(watchedCompanyId); }, [watchedCompanyId, loadAccounts]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const refreshEntry = async (entryId: string) => {
    const { data } = await apiClient.GET('/journal-entries/{id}', {
      params: { path: { id: entryId } },
    });
    if (data) setSavedEntry(data);
  };

  const onSubmit = async (values: JEFormValues) => {
    setSaving(true);
    try {
      const lines = values.lines.map((l) => ({
        accountId: l.accountId,
        currencyId: l.currencyId,
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0,
        description: l.description,
        referenceNo: l.referenceNo,
      }));
      const body = {
        companyId: values.companyId,
        entryType: values.entryType,
        transactionDate: values.transactionDate,
        autoReversalDate: values.autoReversalDate || undefined,
        description: values.description,
        sourceDocument: values.sourceDocument || undefined,
        routingRuleId: values.routingRuleId || undefined,
        allocationMethodId: values.allocationMethodId || undefined,
        lines,
      };
      if (isEdit && id) {
        const { data } = await apiClient.PUT('/journal-entries/{id}', {
          params: { path: { id } },
          body: body as never,
        });
        if (data) { setSavedEntry(data); notify(t('je.savedSuccess')); }
      } else {
        const { data } = await apiClient.POST('/journal-entries', { body: body as never });
        if (data) navigate(`/journal-entries/${(data as JournalEntry).id}`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const doPost = async () => {
    if (!id) return;
    const { data } = await apiClient.POST('/journal-entries/{id}/post', { params: { path: { id } } });
    if (data) { setSavedEntry(data); notify(t('je.postedSuccess')); }
  };

  const doUnpost = async () => {
    if (!id) return;
    const { data } = await apiClient.POST('/journal-entries/{id}/unpost', { params: { path: { id } } });
    if (data) { setSavedEntry(data); notify(t('je.unpostedSuccess')); }
  };

  const doReverse = async () => {
    if (!id) return;
    const { data } = await apiClient.POST('/journal-entries/{id}/reverse', {
      params: { path: { id } },
      body: { reversalDate: reversalDate || undefined },
    });
    if (data) {
      setSavedEntry(data);
      setReverseOpen(false);
      notify(t('je.reversedSuccess'));
    }
  };

  const doSubmitForApproval = async () => {
    if (!id) return;
    const { data } = await apiClient.POST('/journal-entries/{id}/submit-for-approval', {
      params: { path: { id } },
    });
    if (data) { await refreshEntry(id); notify(t('je.submittedSuccess')); }
  };

  const status = savedEntry?.status;

  if (!refLoaded) {
    return (
      <div className="py-16 text-center text-text-secondary text-sm">{t('common.loading')}</div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? t('je.editTitle') : t('je.createTitle')}
        breadcrumbs={[{ label: t('je.title') }, { label: isEdit && id ? id : t('je.createTitle') }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {status && <StatusBadge status={status} />}
            {status === 'Unposted' && (
              <>
                <Button variant="secondary" size="sm" onClick={doPost}>{t('je.post')}</Button>
                <Button variant="secondary" size="sm" onClick={doSubmitForApproval}>{t('je.submitForApproval')}</Button>
              </>
            )}
            {status === 'Posted' && (
              <>
                <Button variant="ghost" size="sm" onClick={doUnpost}>{t('je.unpost')}</Button>
                <Button variant="secondary" size="sm" onClick={() => { setReversalDate(today()); setReverseOpen(true); }}>
                  {t('je.reverse')}
                </Button>
              </>
            )}
          </div>
        }
      />

      {toast && (
        <div role="status" className="mb-4 px-4 py-2 rounded-md bg-state-successLight text-state-success text-sm">
          {toast}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Header fields */}
        <div className="bg-surface-white rounded-md border border-border-default p-5 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <Field id="je-company" label={t('common.company')} error={errors.companyId?.message} required>
              <select
                id="je-company"
                {...register('companyId')}
                className={`input-base${errors.companyId ? ' input-error' : ''}`}
              >
                <option value="">{t('common.selectCompany')}</option>
                {companies.map((co) => (
                  <option key={co.id} value={co.id}>{co.name}</option>
                ))}
              </select>
            </Field>

            <Field id="je-type" label={t('je.type')} error={errors.entryType?.message} required>
              <select
                id="je-type"
                {...register('entryType')}
                className={`input-base${errors.entryType ? ' input-error' : ''}`}
              >
                <option value="">{t('je.selectType')}</option>
                {entryTypes.map((et) => (
                  <option key={et.code} value={et.code}>{et.name}</option>
                ))}
              </select>
            </Field>

            <Field id="je-date" label={t('je.date')} error={errors.transactionDate?.message} required>
              <input
                id="je-date"
                type="date"
                {...register('transactionDate')}
                className={`input-base${errors.transactionDate ? ' input-error' : ''}`}
              />
            </Field>

            <Field id="je-rev-date" label={t('je.autoReversalDate')}>
              <input
                id="je-rev-date"
                type="date"
                {...register('autoReversalDate')}
                className="input-base"
              />
            </Field>

            <Field
              id="je-desc"
              label={t('je.description')}
              error={errors.description?.message}
              required
              className="col-span-2"
            >
              <input
                id="je-desc"
                type="text"
                {...register('description')}
                className={`input-base${errors.description ? ' input-error' : ''}`}
              />
            </Field>

            <Field id="je-src" label={t('je.sourceDocument')}>
              <select id="je-src" {...register('sourceDocument')} className="input-base">
                <option value="">{t('je.selectSource')}</option>
                {sourceDocs.map((sd) => (
                  <option key={sd.code} value={sd.code}>{sd.name}</option>
                ))}
              </select>
            </Field>

            <Field id="je-routing" label={t('je.routingRule')}>
              <select id="je-routing" {...register('routingRuleId')} className="input-base">
                <option value="">{t('je.selectRouting')}</option>
                {routingRules.map((rr) => (
                  <option key={rr.id} value={rr.id}>{rr.name}</option>
                ))}
              </select>
            </Field>

            <Field id="je-alloc" label={t('je.allocationMethod')}>
              <select id="je-alloc" {...register('allocationMethodId')} className="input-base">
                <option value="">{t('je.selectAllocation')}</option>
                {allocMethods.map((am) => (
                  <option key={am.id} value={am.id}>{am.name}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Journal lines */}
        <div className="bg-surface-white rounded-md border border-border-default p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-text-primary">{t('je.lines')}</h2>
            <Button type="button" variant="secondary" size="sm" onClick={() => append(emptyLine())}>
              {t('je.addLine')}
            </Button>
          </div>

          {(errors.lines as { message?: string })?.message && (
            <p role="alert" className="text-xs text-state-error mb-2">
              {(errors.lines as { message?: string }).message}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-border-default">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary w-8">{t('je.lineNo')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary min-w-48">{t('je.account')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary w-20">{t('je.currency')}</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-text-secondary w-28">{t('je.debit')}</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-text-secondary w-28">{t('je.credit')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary min-w-32">{t('je.lineDescription')}</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary w-28">{t('je.referenceNo')}</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-b border-border-default last:border-0">
                    <td className="px-3 py-2 text-center text-text-secondary text-xs">{index + 1}</td>
                    <td className="px-3 py-2">
                      <select
                        {...register(`lines.${index}.accountId`)}
                        className={`input-base py-1 text-xs${errors.lines?.[index]?.accountId ? ' input-error' : ''}`}
                      >
                        <option value="">—</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>{a.code} — {a.description}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select {...register(`lines.${index}.currencyId`)} className="input-base py-1 text-xs w-20">
                        {currencies.map((c) => (
                          <option key={c.code} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`lines.${index}.debit`)}
                        className="input-base py-1 text-xs text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`lines.${index}.credit`)}
                        className="input-base py-1 text-xs text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        {...register(`lines.${index}.description`)}
                        className="input-base py-1 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        {...register(`lines.${index}.referenceNo`)}
                        className="input-base py-1 text-xs"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      {fields.length > 2 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          aria-label={t('je.removeLine')}
                          className="text-state-error hover:text-red-700 text-base leading-none"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border-default bg-neutral-50">
                  <td colSpan={3} className="px-3 py-2 text-right text-xs font-semibold text-text-secondary">
                    {t('je.totals')}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-semibold">
                    {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-semibold">
                    {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan={3} className="px-3 py-2">
                    {isBalanced ? (
                      <span className="text-xs font-medium text-state-success">{t('je.balanced')}</span>
                    ) : (
                      <span className="text-xs font-medium text-state-error">
                        {t('je.difference')}: {difference.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Submit bar */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/journal-entries')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </form>

      {/* Reverse modal */}
      <Modal
        open={reverseOpen}
        onOpenChange={setReverseOpen}
        title={t('je.reverseTitle')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setReverseOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={doReverse}>{t('je.reverseConfirm')}</Button>
          </>
        }
      >
        <Field id="reversal-date" label={t('je.reversalDate')}>
          <input
            id="reversal-date"
            type="date"
            value={reversalDate}
            onChange={(e) => setReversalDate(e.target.value)}
            className="input-base"
          />
        </Field>
      </Modal>
    </div>
  );
}
