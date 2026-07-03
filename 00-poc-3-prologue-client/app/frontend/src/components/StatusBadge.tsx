interface StatusBadgeProps {
  status: string;
  className?: string;
}

const CONFIG: Record<string, { bg: string; text: string }> = {
  Posted: { bg: 'bg-state-successLight', text: 'text-state-success' },
  Unposted: { bg: 'bg-neutral-100', text: 'text-text-secondary' },
  PendingApproval: { bg: 'bg-state-warningLight', text: 'text-state-warning' },
  Approved: { bg: 'bg-state-successLight', text: 'text-state-success' },
  Rejected: { bg: 'bg-state-errorLight', text: 'text-state-error' },
  active: { bg: 'bg-state-successLight', text: 'text-state-success' },
  inactive: { bg: 'bg-neutral-100', text: 'text-text-disabled' },
};

const FALLBACK = { bg: 'bg-neutral-100', text: 'text-text-secondary' };

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { bg, text } = CONFIG[status] ?? FALLBACK;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text} ${className}`}
    >
      {status}
    </span>
  );
}
