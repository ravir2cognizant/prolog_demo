import { useLoaderData, useNavigate, useFetcher, redirect } from 'react-router-dom';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../api/client';
import type { Company, JournalEntryFull, JournalEntryType } from '../../api/types';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import i18n from '../../i18n';

export interface JEFormPageProps {
  mode: 'create' | 'edit';
}

interface FormValues {
  companyId: string;
  journalEntryType: string;
  transactionDate: string;
  description: string;
  autoReversalDate: string;
  allocationMethodId: string;
}

interface JEFormLoaderData {
  companies: Company[];
  types: JournalEntryType[];
  entry: JournalEntryFull | null;
}

interface JEFormActionResult {
  error?: string;
}

export async function jeFormLoader({ params }: LoaderFunctionArgs): Promise<JEFormLoaderData> {
  const [companiesRes, typesRes] = await Promise.all([
    apiClient.getCompanies(),
    apiClient.getJournalEntryTypes(),
  ]);
  const journalId = params.journalId ? Number(params.journalId) : null;
  const entry =
    journalId != null && Number.isFinite(journalId)
      ? await apiClient.getJournalEntry(journalId)
      : null;
  return { companies: companiesRes.companies, types: typesRes.types, entry };
}

export async function jeFormAction({
  request,
  params,
}: ActionFunctionArgs): Promise<JEFormActionResult | Response> {
  try {
    const values = (await request.json()) as FormValues;
    const journalId = params.journalId ? Number(params.journalId) : null;

    if (journalId != null && Number.isFinite(journalId)) {
      await apiClient.updateJournalEntry(journalId, {
        journalEntryType: values.journalEntryType,
        transactionDate: values.transactionDate,
        description: values.description,
        autoReversalDate: values.autoReversalDate || null,
        allocationMethodId: values.allocationMethodId || null,
      });
      return redirect(`/gl/journal-entries/${journalId}`);
    }
    const res = await apiClient.createJournalEntry({
      companyId: values.companyId,
      journalEntryType: values.journalEntryType,
      transactionDate: values.transactionDate,
      description: values.description,
      autoReversalDate: values.autoReversalDate || null,
      allocationMethodId: values.allocationMethodId || null,
    });
    return redirect(`/gl/journal-entries/${res.journalId}`);
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : i18n.t('errors.saveFailed') };
  }
}

export function JEFormPage({ mode }: JEFormPageProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { companies, types, entry } = useLoaderData() as JEFormLoaderData;
  const fetcher = useFetcher<JEFormActionResult>();

  const schema = z.object({
    companyId: z.string().min(1, t('je.validation.companyRequired')),
    journalEntryType: z.string().min(1, t('je.validation.typeRequired')),
    transactionDate: z.string().min(1, t('je.validation.transactionDateRequired')),
    description: z
      .string()
      .min(1, t('je.validation.descriptionRequired'))
      .max(500, t('je.validation.descriptionTooLong')),
    autoReversalDate: z.string().optional().default(''),
    allocationMethodId: z.string().optional().default(''),
  });

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: entry
      ? {
          companyId: entry.companyId,
          journalEntryType: entry.journalEntryType,
          transactionDate: entry.transactionDate,
          description: entry.description,
          autoReversalDate: entry.autoReversalDate ?? '',
          allocationMethodId: entry.allocationMethodId ?? '',
        }
      : {
          companyId: '',
          journalEntryType: '',
          transactionDate: '',
          description: '',
          autoReversalDate: '',
          allocationMethodId: '',
        },
  });

  const isSubmitting = fetcher.state !== 'idle';
  const submitError = fetcher.data?.error ?? null;
  const isPosted = entry?.status === 'Posted';
  const isCompanyLocked = mode === 'edit';
  const titleKey = mode === 'create' ? 'je.formTitleCreate' : 'je.formTitleEdit';

  const onSubmit = handleSubmit(
    (values) => {
      const payload: Record<string, string> = { ...values };
      fetcher.submit(payload, { method: 'post', encType: 'application/json' });
    },
    (fieldErrors) => {
      const firstError = Object.keys(fieldErrors)[0] as keyof FormValues;
      if (firstError) setFocus(firstError);
    },
  );

  return (
    <section>
      <PageHeader title={t(titleKey)} />
      <form onSubmit={onSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          <Field
            label={t('je.fields.companyId')}
            error={errors.companyId?.message ?? null}
            required
          >
            <select
              {...register('companyId')}
              aria-label={t('je.fields.companyId')}
              aria-required="true"
              aria-invalid={errors.companyId ? 'true' : undefined}
              disabled={isCompanyLocked || isPosted}
              className="form-input"
            >
              <option value="">{t('company.placeholder')}</option>
              {companies.map((c) => (
                <option key={c.companyId} value={c.companyId}>
                  {`${c.companyId} - ${c.companyName}`}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={t('je.fields.journalEntryType')}
            error={errors.journalEntryType?.message ?? null}
            required
          >
            <select
              {...register('journalEntryType')}
              aria-label={t('je.fields.journalEntryType')}
              aria-required="true"
              aria-invalid={errors.journalEntryType ? 'true' : undefined}
              disabled={isPosted}
              className="form-input"
            >
              <option value="">--</option>
              {types.map((ty) => (
                <option key={ty.typeCode} value={ty.typeCode}>
                  {ty.typeLabel}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={t('je.fields.transactionDate')}
            required
            error={errors.transactionDate?.message ?? null}
          >
            <input
              type="date"
              aria-required="true"
              aria-invalid={errors.transactionDate ? 'true' : undefined}
              disabled={isPosted}
              className="form-input"
              {...register('transactionDate')}
            />
          </Field>

          <Field
            label={t('je.fields.description')}
            required
            error={errors.description?.message ?? null}
          >
            <input
              aria-required="true"
              aria-invalid={errors.description ? 'true' : undefined}
              disabled={isPosted}
              maxLength={500}
              className="form-input"
              {...register('description')}
            />
          </Field>

          <Field label={t('je.fields.autoReversalDate')}>
            <input
              type="date"
              disabled={isPosted}
              className="form-input"
              {...register('autoReversalDate')}
            />
          </Field>

          <Field label={t('je.fields.allocationMethodId')}>
            <input
              disabled={isPosted}
              className="form-input"
              {...register('allocationMethodId')}
            />
          </Field>
        </div>

        {submitError ? (
          <p role="alert" className="form-error mb-2">
            {submitError}
          </p>
        ) : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting || isPosted}>
            {t('common.save')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </section>
  );
}
