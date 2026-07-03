import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client.js';
import DataTable, { Column } from '../../components/DataTable.js';
import PageHeader from '../../components/PageHeader.js';
import StatusBadge from '../../components/StatusBadge.js';
import Button from '../../components/Button.js';
import type { Company, JournalEntry } from '../../api/schema.js';

export default function JournalEntriesListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    apiClient.GET('/companies').then(({ data }) => {
      const items = data?.items ?? [];
      setCompanies(items);
      if (items[0]) setCompanyId(items[0].id);
    });
  }, []);

  const loadEntries = useCallback(async (cid: string) => {
    if (!cid) return;
    setLoading(true);
    try {
      const { data } = await apiClient.GET('/journal-entries', {
        params: { query: { companyId: cid } },
      });
      setEntries(data?.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEntries(companyId); }, [companyId, loadEntries]);

  const visibleEntries = statusFilter
    ? entries.filter((e) => e.status === statusFilter)
    : entries;

  const columns: Column<JournalEntry>[] = [
    { key: 'id', header: t('je.id') },
    { key: 'transactionDate', header: t('je.date') },
    { key: 'entryType', header: t('je.type') },
    { key: 'description', header: t('je.description') },
    {
      key: 'status',
      header: t('je.status'),
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'totalDebit',
      header: t('je.totalDebit'),
      className: 'text-right',
      render: (row) =>
        row.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      key: 'totalCredit',
      header: t('je.totalCredit'),
      className: 'text-right',
      render: (row) =>
        row.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
  ];

  const STATUS_OPTIONS = ['', 'Unposted', 'Posted', 'PendingApproval', 'Approved'];

  return (
    <div>
      <PageHeader
        title={t('je.title')}
        actions={
          <Button onClick={() => navigate('/journal-entries/new')}>
            {t('je.newEntry')}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="je-company" className="text-sm font-medium text-text-primary whitespace-nowrap">
            {t('common.company')}
          </label>
          <select
            id="je-company"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="input-base w-64"
          >
            {companies.map((co) => (
              <option key={co.id} value={co.id}>{co.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="je-status" className="text-sm font-medium text-text-primary whitespace-nowrap">
            {t('je.filterStatus')}
          </label>
          <select
            id="je-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base w-44"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s || t('common.all')}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={visibleEntries}
        keyField="id"
        loading={loading}
        onRowClick={(row) => navigate(`/journal-entries/${row.id}`)}
        emptyMessage={t('common.noResults')}
      />
    </div>
  );
}
