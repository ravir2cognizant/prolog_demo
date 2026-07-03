import { z } from 'zod';

export const ProblemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string().optional(),
  field: z.string().optional(),
  issues: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  references: z.array(z.object({ type: z.string(), id: z.string() })).optional(),
}).describe('RFC 7807 problem+json');

export const validationFailure = { description: 'Validation failure', schema: ProblemSchema };
export const unauthorised      = { description: 'Unauthorised',       schema: ProblemSchema };
export const forbidden         = { description: 'Forbidden',          schema: ProblemSchema };
export const notFound          = { description: 'Not found',          schema: ProblemSchema };
export const conflict          = { description: 'Conflict',           schema: ProblemSchema };
export const serverError       = { description: 'Internal server error', schema: ProblemSchema };
export const unprocessable     = { description: 'Unprocessable entity', schema: ProblemSchema };
