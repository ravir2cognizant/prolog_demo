import { z } from 'zod';

/**
 * Zod request schemas -- one per endpoint that accepts a body / query / path.
 * Used both by controllers (validation) and by /api-docs (zod-to-json-schema).
 *
 * Naming: <Verb><Noun>Body / Query / Params. Exported types use the same name + "Body" suffix.
 */

// ---- Path param schemas ---------------------------------------------------

const PositiveInt = z.coerce
  .number({ invalid_type_error: 'must be a positive integer' })
  .int('must be a positive integer')
  .positive('must be a positive integer');

export const JournalIdParam = z.object({ journalId: PositiveInt });
export const JournalIdLineIdParam = z.object({
  journalId: PositiveInt,
  lineId: PositiveInt,
});
export const AccountCodeParam = z.object({
  // Accept the literal account code in the URL; format validation happens in the controller.
  accountCode: z.string().min(1),
});

// ---- ED-003: Create / Update JE -------------------------------------------

export const CreateJournalEntryBody = z.object({
  companyId: z.string().min(1, 'companyId is required'),
  journalEntryType: z.string().min(1, 'journalEntryType is required'),
  transactionDate: z.string().min(1, 'transactionDate is required'),
  description: z
    .string()
    .min(1, 'description is required')
    .max(500, 'description must be 500 characters or fewer'),
  autoReversalDate: z.string().nullable().optional(),
  allocationMethodId: z.string().nullable().optional(),
});
export type CreateJournalEntryBodyT = z.infer<typeof CreateJournalEntryBody>;

// Update schema is lenient: it accepts (and ignores) companyId so TC-BFF-013
// can send a "try to change company" request without 4xx. The service drops
// every field except the whitelisted ones below, so the lock is enforced by
// behaviour, not by schema rejection.
export const UpdateJournalEntryBodyLenient = z.object({
  // companyId is intentionally accepted-then-ignored.
  companyId: z.string().optional(),
  journalEntryType: z.string().min(1).optional(),
  transactionDate: z.string().min(1).optional(),
  description: z
    .string()
    .min(1)
    .max(500, 'description must be 500 characters or fewer')
    .optional(),
  autoReversalDate: z.string().nullable().optional(),
  allocationMethodId: z.string().nullable().optional(),
});
export type UpdateJournalEntryBodyLenientT = z.infer<typeof UpdateJournalEntryBodyLenient>;

// ---- ED-004: Line items ---------------------------------------------------

export const CreateLineItemBody = z
  .object({
    accountCode: z.string().min(1, 'accountCode is required'),
    currencyId: z.string().min(1, 'currencyId is required'),
    debitAmount: z.number().nonnegative().optional(),
    creditAmount: z.number().nonnegative().optional(),
    description: z.string().max(500).optional(),
    referenceNumber: z.string().max(100).optional(),
  })
  .refine(
    (v) => (v.debitAmount ?? 0) > 0 || (v.creditAmount ?? 0) > 0,
    { message: 'either debitAmount or creditAmount must be greater than 0', path: ['debitAmount'] },
  )
  .refine(
    (v) => !((v.debitAmount ?? 0) > 0 && (v.creditAmount ?? 0) > 0),
    { message: 'debitAmount and creditAmount are mutually exclusive', path: ['debitAmount'] },
  );
export type CreateLineItemBodyT = z.infer<typeof CreateLineItemBody>;

export const UpdateLineItemBody = z
  .object({
    accountCode: z.string().min(1).optional(),
    currencyId: z.string().min(1).optional(),
    debitAmount: z.number().nonnegative().optional(),
    creditAmount: z.number().nonnegative().optional(),
    description: z.string().max(500).optional(),
    referenceNumber: z.string().max(100).optional(),
  })
  .refine(
    (v) => !((v.debitAmount ?? 0) > 0 && (v.creditAmount ?? 0) > 0),
    { message: 'debitAmount and creditAmount are mutually exclusive', path: ['debitAmount'] },
  );
export type UpdateLineItemBodyT = z.infer<typeof UpdateLineItemBody>;

// ---- ED-007: Navigation query --------------------------------------------

export const NavigationQuery = z.object({
  sortField: z
    .enum(['journalNumber', 'transactionDate', 'editDateTime'])
    .default('journalNumber'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  companyId: z.string().optional(),
});
export type NavigationQueryT = z.infer<typeof NavigationQuery>;
