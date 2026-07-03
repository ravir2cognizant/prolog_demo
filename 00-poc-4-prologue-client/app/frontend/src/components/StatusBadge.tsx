import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { JEStatus } from '../api/types';

export interface StatusBadgeProps {
  status: JEStatus;
}

export function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  const { t } = useTranslation();
  const label =
    status === 'Posted' ? t('je.status.posted') : t('je.status.unposted');
  return (
    <span
      role="status"
      aria-live="polite"
      className={clsx(
        'badge',
        status === 'Posted' ? 'badge-posted' : 'badge-unposted',
      )}
    >
      {label}
    </span>
  );
}
