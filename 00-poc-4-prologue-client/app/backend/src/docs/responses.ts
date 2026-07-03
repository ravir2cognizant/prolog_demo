import { z } from 'zod';

export const ProblemSchema = z
  .object({
    error: z.string(),
    field: z.string().optional(),
  })
  .describe('Error envelope -- {error, field?}');

export const validationFailure = { description: 'Validation failure', schema: ProblemSchema };
export const unauthorised = { description: 'Unauthorised', schema: ProblemSchema };
export const forbidden = { description: 'Forbidden', schema: ProblemSchema };
export const notFound = { description: 'Not found', schema: ProblemSchema };
export const conflict = { description: 'Conflict', schema: ProblemSchema };
export const serverError = { description: 'Internal server error', schema: ProblemSchema };
