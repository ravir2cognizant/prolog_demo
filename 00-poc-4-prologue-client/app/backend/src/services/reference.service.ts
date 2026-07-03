import { memoryStore } from '../store/memoryStore.js';
import type { Company, JournalEntryType } from '../domain/types.js';

export function listCompanies(): Company[] {
  return [...memoryStore.get().companies.values()].sort((a, b) =>
    a.companyId.localeCompare(b.companyId),
  );
}

export function listJournalEntryTypes(): JournalEntryType[] {
  return [...memoryStore.get().journalEntryTypes.values()].sort((a, b) =>
    a.typeCode.localeCompare(b.typeCode),
  );
}
