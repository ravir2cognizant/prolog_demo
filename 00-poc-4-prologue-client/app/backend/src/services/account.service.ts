import { memoryStore } from '../store/memoryStore.js';
import type { Account } from '../domain/types.js';
import { badRequest, notFound } from '../util/errors.js';

const ACCOUNT_CODE_REGEX = /^[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Za-z0-9]+$/;

export function isAccountCodeFormatValid(code: string): boolean {
  return ACCOUNT_CODE_REGEX.test(code);
}

export function lookupAccount(rawCode: string): Account {
  const code = decodeURIComponent(rawCode);
  if (!isAccountCodeFormatValid(code)) {
    throw badRequest('Invalid account code format', 'accountCode');
  }
  const acct = memoryStore.get().accounts.get(code);
  if (!acct) throw notFound('Account not found');
  return acct;
}

export function accountDescriptionFor(code: string): string {
  return memoryStore.get().accounts.get(code)?.accountDescription ?? '';
}
