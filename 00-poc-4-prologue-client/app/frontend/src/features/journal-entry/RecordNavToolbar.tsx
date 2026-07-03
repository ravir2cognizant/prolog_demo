import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';
import type { NavigationContext } from '../../api/types';
import { Button } from '../../components/Button';

export interface RecordNavToolbarProps {
  journalId: number;
}

/**
 * CI-007 - Record navigation toolbar. First/Prev disabled when isFirst;
 * Next/Last disabled when isLast.
 */
export function RecordNavToolbar({
  journalId,
}: RecordNavToolbarProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ctx, setCtx] = useState<NavigationContext | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getNavigationContext(journalId)
      .then((res) => {
        if (!cancelled) setCtx(res);
      })
      .catch(() => {
        if (!cancelled) setCtx(null);
      });
    return () => {
      cancelled = true;
    };
  }, [journalId]);

  const go = (id: number | null | undefined): void => {
    if (id == null) return;
    navigate(`/gl/journal-entries/${id}`);
  };

  const isFirst = ctx?.isFirst ?? true;
  const isLast = ctx?.isLast ?? true;

  return (
    <nav
      aria-label="Record navigation"
      aria-busy={ctx == null || undefined}
      className="flex items-center gap-1"
    >
      <Button
        variant="ghost"
        aria-label={t('je.nav.first')}
        disabled={isFirst}
        onClick={() => go(ctx?.firstJournalId ?? null)}
      >
        {t('je.nav.firstShort')}
      </Button>
      <Button
        variant="ghost"
        aria-label={t('je.nav.previous')}
        disabled={isFirst}
        onClick={() => go(ctx?.previousJournalId ?? null)}
      >
        {t('je.nav.previousShort')}
      </Button>
      <Button
        variant="ghost"
        aria-label={t('je.nav.next')}
        disabled={isLast}
        onClick={() => go(ctx?.nextJournalId ?? null)}
      >
        {t('je.nav.nextShort')}
      </Button>
      <Button
        variant="ghost"
        aria-label={t('je.nav.last')}
        disabled={isLast}
        onClick={() => go(ctx?.lastJournalId ?? null)}
      >
        {t('je.nav.lastShort')}
      </Button>
    </nav>
  );
}
