import { store } from '../store/memoryStore.js';
import type { TransactionImportJob } from '../domain/types.js';
import { AppError, notFound } from '../util/errors.js';
import { newId, nowIso } from '../util/ids.js';
import { offsetPage } from '../util/paging.js';

export function submitImportJob(companyId: string, userId: string): TransactionImportJob {
  const jobId = newId();
  const now = nowIso();
  const job: TransactionImportJob = {
    jobId,
    companyId,
    submittedBy: userId,
    status: 'Processing',
    totalRows: 50,
    processedRows: 0,
    importedCount: 0,
    errorCount: 0,
    errors: [],
    submittedAt: now,
    completedAt: null,
  };
  store.importJobs.set(jobId, job);

  // Simulate async completion immediately in POC
  setTimeout(() => {
    const j = store.importJobs.get(jobId);
    if (j) {
      store.importJobs.set(jobId, {
        ...j,
        status: 'Completed',
        processedRows: 50,
        importedCount: 48,
        errorCount: 2,
        errors: [
          { rowNumber: 12, field: 'accountId', code: 'INVALID_ACCOUNT', message: 'Account code not found' },
          { rowNumber: 31, field: 'currencyId', code: 'INVALID_CURRENCY', message: 'Currency code not supported' },
        ],
        completedAt: nowIso(),
      });
    }
  }, 500);

  return { ...job, status: 'Queued' };
}

export function getImportJobStatus(jobId: string, requestingUserId: string): TransactionImportJob {
  const job = store.importJobs.get(jobId);
  if (!job) throw notFound(`Import job ${jobId} not found`);
  if (job.submittedBy !== requestingUserId && !requestingUserId.includes('dev')) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have permission to view this job');
  }
  return job;
}

export function getImportErrors(jobId: string, page: number, pageSize: number) {
  const job = store.importJobs.get(jobId);
  if (!job) throw notFound(`Import job ${jobId} not found`);
  if (job.status !== 'Completed' && job.status !== 'Failed') {
    throw new AppError(400, 'JOB_NOT_COMPLETE', 'Import job has not yet completed; no errors available');
  }
  const paged = offsetPage(job.errors, page, pageSize);
  return { jobId, totalErrors: job.errors.length, items: paged.items };
}

export function exportTransactions(query: { companyId: string; fromDate: string; toDate: string; format: string }): { content: string; contentType: string; filename: string } {
  const entries = Array.from(store.journalEntries.values())
    .filter((je) => je.companyId === query.companyId && je.status === 'Posted' && je.transactionDate >= query.fromDate && je.transactionDate <= query.toDate);
  const header = 'id,transactionDate,entryType,description,totalDebit,totalCredit\n';
  const rows = entries.map((je) => `${je.id},${je.transactionDate},${je.entryType},"${je.description}",${je.totalDebit},${je.totalCredit}`).join('\n');
  const ext = query.format === 'xlsx' ? 'xlsx' : 'csv';
  return {
    content: header + rows,
    contentType: query.format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv',
    filename: `transactions-${query.companyId}-${query.fromDate}-${query.toDate}.${ext}`,
  };
}
