import { useLoaderData, useRevalidator, Link } from 'react-router-dom';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import type { JournalEntryFull } from '../../api/types';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { RecordNavToolbar } from './RecordNavToolbar';
import { StatusAuditPanel } from './StatusAuditPanel';
import { LineItemsGrid } from './LineItemsGrid';
import { BalanceFooter } from './BalanceFooter';
import i18n from '../../i18n';

function fmt(value: string | null, dash = '—'): string {
  return value && value.length > 0 ? value : dash;
}

export async function jeHeaderLoader({ params }: LoaderFunctionArgs): Promise<JournalEntryFull> {
  const id = Number(params.journalId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new Response(i18n.t('errors.invalidJournalId'), { status: 400 });
  }
  return apiClient.getJournalEntry(id);
}

export async function jeHeaderAction({
  params,
  request,
}: ActionFunctionArgs): Promise<{ error: string } | null> {
  const formData = await request.formData();
  const intent = formData.get('intent');
  if (intent === 'post-entry') {
    const journalId = Number(params.journalId);
    try {
      await apiClient.postJournalEntry(journalId);
      return null;
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : i18n.t('errors.postFailed') };
    }
  }
  return null;
}

export function JEHeaderPage(): JSX.Element {
  const { t } = useTranslation();
  const entry = useLoaderData() as JournalEntryFull;
  const revalidator = useRevalidator();

  const f = t;

  return (
    <section aria-labelledby="je-header-title">
      <PageHeader
        title={t('je.headerTitle')}
        subtitle={`#${entry.journalNumber}`}
        actions={
          <>
            <Link to={`/gl/journal-entries/${entry.journalId}/edit`}>
              <Button variant="secondary">{f('common.edit')}</Button>
            </Link>
            <RecordNavToolbar journalId={entry.journalId} />
          </>
        }
      />

      <div className="mb-4">
        <StatusBadge status={entry.status} />
      </div>

      <dl className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
        <HeaderField label={f('je.fields.journalNumber')} value={String(entry.journalNumber)} />
        <HeaderField
          label={f('je.fields.companyId')}
          value={`${entry.companyId} - ${entry.companyName}`}
        />
        <HeaderField label={f('je.fields.journalEntryType')} value={entry.journalEntryType} />
        <HeaderField label={f('je.fields.status')} value={entry.status} />
        <HeaderField label={f('je.fields.transactionDate')} value={entry.transactionDate} />
        <HeaderField label={f('je.fields.editDateTime')} value={entry.editDateTime} />
        <HeaderField label={f('je.fields.editUserId')} value={entry.editUserId} />
        <HeaderField label={f('je.fields.autoReversalDate')} value={fmt(entry.autoReversalDate)} />
        <HeaderField label={f('je.fields.description')} value={entry.description} />
        <HeaderField label={f('je.fields.postingSession')} value={fmt(entry.postingSession)} />
        <HeaderField label={f('je.fields.sourceDocument')} value={fmt(entry.sourceDocument)} />
        <HeaderField label={f('je.fields.glImport')} value={fmt(entry.glImport)} />
        <HeaderField
          label={f('je.fields.allocationMethodId')}
          value={fmt(entry.allocationMethodId)}
        />
        <HeaderField
          label={f('je.fields.balanced')}
          value={entry.balanced ? f('je.balance.balanced') : f('je.balance.unbalanced')}
        />
        <HeaderField label={f('je.fields.postedDateTime')} value={fmt(entry.postedDateTime)} />
        <HeaderField label={f('je.fields.posterUserId')} value={fmt(entry.posterUserId)} />
      </dl>

      <hr className="my-6 border-border-subtle" />

      <h2 className="text-xl font-semibold mb-4">{f('je.lines.title')}</h2>
      <LineItemsGrid
        journalId={entry.journalId}
        initialLines={entry.lines}
        isEditable={entry.status === 'Unposted'}
        onLinesChanged={revalidator.revalidate}
        renderFooter={(lines) => (
          <BalanceFooter lines={lines} initialServerTotals={entry.totals} />
        )}
      />

      <hr className="my-6 border-border-subtle" />

      <StatusAuditPanel entry={entry} />
    </section>
  );
}

function HeaderField({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div>
      <dt className="text-xs text-text-secondary">{label}</dt>
      <dd className="form-input form-input--readonly !p-2 mt-1" aria-label={label}>
        {value}
      </dd>
    </div>
  );
}
