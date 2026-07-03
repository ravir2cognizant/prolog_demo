import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { apiClient } from '../../api/client';
import type { LineItem } from '../../api/types';
import { Button } from '../../components/Button';

export interface LineItemsGridProps {
  journalId: number;
  initialLines: LineItem[];
  isEditable: boolean;
  /** Optional callback fired after a line is added / updated / deleted. */
  onLinesChanged?: () => void;
  /**
   * Renders the footer rows (totals + difference). Receives the current line
   * state so the BalanceFooter can recalculate without a re-fetch.
   */
  renderFooter?: (lines: LineItem[]) => ReactNode;
}

interface DraftLine {
  // Local-only draft line not yet persisted (no lineId from server)
  tempId: string;
  accountCode: string;
  accountDescription: string;
  currencyId: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
  referenceNumber: string;
  lookupError?: string;
}

/**
 * CI-004 - Line Items Grid with CRUD, debit/credit mutual exclusion,
 * account lookup autopopulate.
 */
export function LineItemsGrid({
  journalId,
  initialLines,
  isEditable,
  onLinesChanged,
  renderFooter,
}: LineItemsGridProps): JSX.Element {
  const { t } = useTranslation();
  const [lines, setLines] = useState<LineItem[]>(initialLines);
  const [drafts, setDrafts] = useState<DraftLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const res = await apiClient.listLines(journalId);
      setLines(res.lines);
      onLinesChanged?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.loadLinesFailed'));
    }
  }, [journalId, onLinesChanged]);

  const addDraft = (): void => {
    setDrafts((prev) => [
      ...prev,
      {
        tempId: `draft-${Date.now()}-${prev.length}`,
        accountCode: '',
        accountDescription: '',
        currencyId: 'USD',
        debitAmount: 0,
        creditAmount: 0,
        description: '',
        referenceNumber: '',
      },
    ]);
  };

  const updateDraft = (tempId: string, patch: Partial<DraftLine>): void => {
    setDrafts((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, ...patch } : d)),
    );
  };

  const removeDraft = (tempId: string): void => {
    setDrafts((prev) => prev.filter((d) => d.tempId !== tempId));
  };

  const lookupAccount = async (
    tempId: string,
    accountCode: string,
  ): Promise<void> => {
    if (!accountCode) return;
    try {
      const acct = await apiClient.getAccount(accountCode);
      updateDraft(tempId, {
        accountDescription: acct.accountDescription,
        lookupError: undefined,
      });
    } catch (e: unknown) {
      updateDraft(tempId, {
        accountDescription: '',
        lookupError: e instanceof Error ? e.message : t('errors.lookupFailed'),
      });
    }
  };

  const saveDraft = async (draft: DraftLine): Promise<void> => {
    try {
      const newLine = await apiClient.createLine(journalId, {
        accountCode: draft.accountCode,
        currencyId: draft.currencyId,
        debitAmount: draft.debitAmount || undefined,
        creditAmount: draft.creditAmount || undefined,
        description: draft.description || undefined,
        referenceNumber: draft.referenceNumber || undefined,
      });
      setLines((prev) => [...prev, newLine]);
      removeDraft(draft.tempId);
      onLinesChanged?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.saveLineFailed'));
    }
  };

  const updateLine = async (
    line: LineItem,
    patch: Partial<LineItem>,
  ): Promise<void> => {
    try {
      const updated = await apiClient.updateLine(journalId, line.lineId, patch);
      setLines((prev) => prev.map((l) => (l.lineId === line.lineId ? updated : l)));
      onLinesChanged?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.updateLineFailed'));
    }
  };

  const deleteLine = async (line: LineItem): Promise<void> => {
    try {
      await apiClient.deleteLine(journalId, line.lineId);
      setLines((prev) => prev.filter((l) => l.lineId !== line.lineId));
      onLinesChanged?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.deleteLineFailed'));
      // Re-sync in case of partial failure
      void refresh();
    }
  };

  return (
    <div>
      {error ? (
        <p role="alert" className="form-error mb-2">
          {error}
        </p>
      ) : null}
      <table className="data-grid" role="grid">
        <thead>
          <tr>
            <th scope="col">{t('je.lines.lineNumber')}</th>
            <th scope="col">{t('je.lines.accountCode')}</th>
            <th scope="col">{t('je.lines.accountDescription')}</th>
            <th scope="col">{t('je.lines.currency')}</th>
            <th scope="col" className="cell-numeric">
              {t('je.lines.debit')}
            </th>
            <th scope="col" className="cell-numeric">
              {t('je.lines.credit')}
            </th>
            <th scope="col">{t('je.fields.description')}</th>
            <th scope="col">{t('je.lines.reference')}</th>
            {isEditable ? <th scope="col">{t('common.delete')}</th> : null}
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && drafts.length === 0 ? (
            <tr>
              <td
                colSpan={isEditable ? 9 : 8}
                className="text-center text-text-secondary"
              >
                {t('je.lines.noLines')}
              </td>
            </tr>
          ) : null}
          {lines.map((line) => (
            <LineItemRowView
              key={line.lineId}
              line={line}
              isEditable={isEditable}
              onChange={(patch) => updateLine(line, patch)}
              onDelete={() => deleteLine(line)}
            />
          ))}
          {drafts.map((draft) => (
            <DraftRowView
              key={draft.tempId}
              draft={draft}
              onChange={(patch) => updateDraft(draft.tempId, patch)}
              onSave={() => saveDraft(draft)}
              onCancel={() => removeDraft(draft.tempId)}
              onLookupAccount={(code) => lookupAccount(draft.tempId, code)}
            />
          ))}
        </tbody>
        {renderFooter ? <tfoot>{renderFooter(lines)}</tfoot> : null}
      </table>
      {isEditable ? (
        <div className="mt-3">
          <Button variant="secondary" onClick={addDraft}>
            {t('je.lines.addLine')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

interface LineRowViewProps {
  line: LineItem;
  isEditable: boolean;
  onChange: (patch: Partial<LineItem>) => void;
  onDelete: () => void;
}

function LineItemRowView({
  line,
  isEditable,
  onChange,
  onDelete,
}: LineRowViewProps): JSX.Element {
  const { t } = useTranslation();
  const creditDisabled = !isEditable || line.debitAmount > 0;
  const debitDisabled = !isEditable || line.creditAmount > 0;
  return (
    <tr>
      <td className="cell-numeric">{line.lineNumber}</td>
      <td className="cell-account-code">{line.accountCode}</td>
      <td>{line.accountDescription}</td>
      <td>{line.currencyId}</td>
      <td className="cell-numeric">
        <input
          aria-label={t('je.lines.debit')}
          type="number"
          step="0.01"
          min="0"
          className={clsx('form-input', debitDisabled && 'form-input--readonly')}
          value={line.debitAmount}
          disabled={debitDisabled}
          style={debitDisabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
          onChange={(e) =>
            onChange({ debitAmount: Number(e.target.value) || 0 })
          }
        />
      </td>
      <td className="cell-numeric">
        <input
          aria-label={t('je.lines.credit')}
          type="number"
          step="0.01"
          min="0"
          className={clsx('form-input', creditDisabled && 'form-input--readonly')}
          value={line.creditAmount}
          disabled={creditDisabled}
          style={creditDisabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
          onChange={(e) =>
            onChange({ creditAmount: Number(e.target.value) || 0 })
          }
        />
      </td>
      <td>{line.description}</td>
      <td>{line.referenceNumber}</td>
      {isEditable ? (
        <td>
          <Button
            variant="danger"
            aria-label={t('je.lines.deleteLine')}
            onClick={onDelete}
            className="!h-8 !px-3"
          >
            {t('common.delete')}
          </Button>
        </td>
      ) : null}
    </tr>
  );
}

interface DraftRowViewProps {
  draft: DraftLine;
  onChange: (patch: Partial<DraftLine>) => void;
  onSave: () => void;
  onCancel: () => void;
  onLookupAccount: (code: string) => void;
}

function DraftRowView({
  draft,
  onChange,
  onSave,
  onCancel,
  onLookupAccount,
}: DraftRowViewProps): JSX.Element {
  const { t } = useTranslation();
  const creditDisabled = draft.debitAmount > 0;
  const debitDisabled = draft.creditAmount > 0;
  return (
    <tr>
      <td className="cell-numeric">—</td>
      <td>
        <input
          aria-label={t('je.lines.accountCode')}
          className="form-input cell-account-code"
          value={draft.accountCode}
          onChange={(e) => onChange({ accountCode: e.target.value })}
          onBlur={() => onLookupAccount(draft.accountCode)}
        />
        {draft.lookupError ? (
          <span role="alert" className="form-error">
            {draft.lookupError}
          </span>
        ) : null}
      </td>
      <td>{draft.accountDescription}</td>
      <td>
        <input
          aria-label={t('je.lines.currency')}
          className="form-input"
          value={draft.currencyId}
          onChange={(e) => onChange({ currencyId: e.target.value })}
        />
      </td>
      <td className="cell-numeric">
        <input
          aria-label={t('je.lines.debit')}
          type="number"
          step="0.01"
          min="0"
          className={clsx('form-input', debitDisabled && 'form-input--readonly')}
          value={draft.debitAmount}
          disabled={debitDisabled}
          style={debitDisabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
          onChange={(e) =>
            onChange({ debitAmount: Number(e.target.value) || 0 })
          }
        />
      </td>
      <td className="cell-numeric">
        <input
          aria-label={t('je.lines.credit')}
          type="number"
          step="0.01"
          min="0"
          className={clsx('form-input', creditDisabled && 'form-input--readonly')}
          value={draft.creditAmount}
          disabled={creditDisabled}
          style={creditDisabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
          onChange={(e) =>
            onChange({ creditAmount: Number(e.target.value) || 0 })
          }
        />
      </td>
      <td>
        <input
          aria-label={t('je.fields.description')}
          className="form-input"
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </td>
      <td>
        <input
          aria-label={t('je.lines.reference')}
          className="form-input"
          value={draft.referenceNumber}
          onChange={(e) => onChange({ referenceNumber: e.target.value })}
        />
      </td>
      <td>
        <div className="flex gap-1">
          <Button onClick={onSave} className="!h-8 !px-3">
            {t('common.save')}
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="!h-8 !px-3"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </td>
    </tr>
  );
}
