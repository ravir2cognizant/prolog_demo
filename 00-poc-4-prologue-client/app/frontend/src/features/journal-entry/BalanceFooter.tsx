import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import type { JournalTotals, LineItem } from '../../api/types';

export interface BalanceFooterProps {
  lines: Pick<LineItem, 'debitAmount' | 'creditAmount'>[];
  initialServerTotals?: JournalTotals | null;
}

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

/**
 * CI-005 - Balance footer. Calculates client-side from local line state.
 * Recalculation must complete in <=100ms (RC-005 NFR).
 *
 * NOTE: This component is intentionally pure / memo-driven. The parent
 * passes `lines` and React re-renders synchronously, well within 100ms
 * even for ~1000 lines.
 */
export function BalanceFooter({
  lines,
}: BalanceFooterProps): JSX.Element {
  const { t } = useTranslation();

  const { totalDebits, totalCredits, difference, isUnbalanced } = useMemo(() => {
    let d = 0;
    let c = 0;
    for (const ln of lines) {
      d += Number(ln.debitAmount ?? 0);
      c += Number(ln.creditAmount ?? 0);
    }
    const diff = d - c;
    return {
      totalDebits: d,
      totalCredits: c,
      difference: diff,
      isUnbalanced: Math.abs(diff) >= 1e-9,
    };
  }, [lines]);

  return (
    <>
      <tr data-testid="totals-row" className="data-grid-totals-row">
        <td colSpan={3} className="font-semibold">
          {t('je.balance.total')}
        </td>
        <td className="cell-numeric" data-testid="total-debit">
          {fmtMoney(totalDebits)}
        </td>
        <td className="cell-numeric" data-testid="total-credit">
          {fmtMoney(totalCredits)}
        </td>
        <td colSpan={3} />
      </tr>
      <tr
        data-testid="difference-row"
        aria-live="polite"
        className={clsx(
          'data-grid-totals-row',
          isUnbalanced && 'data-grid-difference-row--unbalanced',
        )}
      >
        <td colSpan={3} className="font-semibold">
          {t('je.balance.difference')}
        </td>
        <td className="cell-numeric" colSpan={2}>
          {fmtMoney(Math.abs(difference))}
          {isUnbalanced ? (
            <span className="sr-only"> {t('je.balance.unbalanced')}</span>
          ) : null}
        </td>
        <td colSpan={3} />
      </tr>
    </>
  );
}
