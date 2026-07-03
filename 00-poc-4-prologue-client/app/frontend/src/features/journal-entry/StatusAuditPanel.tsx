import { useFetcher } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { JournalEntryFull } from '../../api/types';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';

export interface StatusAuditPanelProps {
  entry: JournalEntryFull;
}

type PostActionResult = { error: string } | null;

export function StatusAuditPanel({ entry }: StatusAuditPanelProps): JSX.Element {
  const { t } = useTranslation();
  const fetcher = useFetcher<PostActionResult>();
  const isPosting = fetcher.state !== 'idle';
  const error = fetcher.data != null ? (fetcher.data as { error?: string }).error ?? null : null;

  const handlePost = (): void => {
    fetcher.submit({ intent: 'post-entry' }, { method: 'post' });
  };

  return (
    <section aria-labelledby="audit-title">
      <header className="mb-3 flex items-center gap-3">
        <h2 id="audit-title" className="text-xl font-semibold">
          {t('je.audit.title')}
        </h2>
        <StatusBadge status={entry.status} />
      </header>

      <dl className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3 mb-4">
        <AuditRow label={t('je.fields.editDateTime')} value={entry.editDateTime} />
        <AuditRow label={t('je.fields.editUserId')} value={entry.editUserId} />
        <AuditRow
          label={t('je.fields.postedDateTime')}
          value={entry.postedDateTime ?? '—'}
        />
        <AuditRow
          label={t('je.fields.posterUserId')}
          value={entry.posterUserId ?? '—'}
        />
      </dl>

      {entry.status !== 'Posted' ? (
        <Button
          aria-label={t('je.post.ariaLabel')}
          disabled={!entry.balanced || isPosting}
          title={!entry.balanced ? t('je.post.disabledTooltip') : undefined}
          onClick={handlePost}
        >
          {isPosting ? t('je.post.posting') : t('je.post.button')}
        </Button>
      ) : null}
      {error ? (
        <p role="alert" className="form-error mt-2">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function AuditRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div>
      <dt className="text-xs text-text-secondary">{label}</dt>
      <dd>
        <input
          aria-label={label}
          readOnly
          value={value}
          className="form-input form-input--readonly"
        />
      </dd>
    </div>
  );
}
