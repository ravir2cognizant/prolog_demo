import { store } from '../store/memoryStore.js';
import type { AccrualSchedule, ScheduleType } from '../domain/types.js';
import { notFound, conflict } from '../util/errors.js';
import { newId, nowIso } from '../util/ids.js';

export function listAccrualSchedules(query: { companyId?: string; status?: string }): AccrualSchedule[] {
  let all = Array.from(store.accrualSchedules.values());
  if (query.companyId) all = all.filter((s) => s.companyId === query.companyId);
  if (query.status) all = all.filter((s) => s.status === query.status);
  return all;
}

export function createAccrualSchedule(
  body: { companyId: string; description: string; scheduleType: ScheduleType; startDate: string; endDate?: string; baseEntry: Record<string, unknown>; reversalOffset?: number },
  _userId: string,
): AccrualSchedule {
  const now = nowIso();
  const id = newId();
  const schedule: AccrualSchedule = {
    id,
    companyId: body.companyId,
    description: body.description,
    scheduleType: body.scheduleType,
    startDate: body.startDate,
    endDate: body.endDate ?? null,
    status: 'Active',
    baseEntry: body.baseEntry,
    reversalOffset: body.reversalOffset ?? 1,
    entryCount: 0,
    entries: [],
    createdAt: now,
    updatedAt: now,
  };
  store.accrualSchedules.set(id, schedule);
  return schedule;
}

export function updateAccrualSchedule(id: string, body: { description?: string; endDate?: string }, _userId: string): AccrualSchedule {
  const s = store.accrualSchedules.get(id);
  if (!s) throw notFound(`Accrual schedule ${id} not found`);
  if (s.status === 'Cancelled') throw conflict('SCHEDULE_CANCELLED', 'Cannot update a cancelled schedule');
  const now = nowIso();
  const updated: AccrualSchedule = {
    ...s,
    description: body.description ?? s.description,
    endDate: body.endDate ?? s.endDate,
    updatedAt: now,
  };
  store.accrualSchedules.set(id, updated);
  return updated;
}

export function cancelAccrualSchedule(id: string): { id: string; status: string; cancelledAt: string } {
  const s = store.accrualSchedules.get(id);
  if (!s) throw notFound(`Accrual schedule ${id} not found`);
  if (s.status === 'Cancelled') throw conflict('ALREADY_CANCELLED', 'Schedule is already cancelled');
  const cancelledAt = nowIso();
  store.accrualSchedules.set(id, { ...s, status: 'Cancelled', updatedAt: cancelledAt });
  return { id, status: 'Cancelled', cancelledAt };
}

export function listScheduleEntries(id: string) {
  const s = store.accrualSchedules.get(id);
  if (!s) throw notFound(`Accrual schedule ${id} not found`);
  return { scheduleId: id, items: s.entries };
}
