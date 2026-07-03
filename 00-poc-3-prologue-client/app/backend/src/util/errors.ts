export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly detail?: string,
    public readonly field?: string,
    public readonly issues?: Array<{ path: string; message: string }>,
    public readonly extra?: Record<string, unknown>,
  ) {
    super(detail ?? code);
    this.name = 'AppError';
  }
}

export function notFound(detail?: string): AppError {
  return new AppError(404, 'NOT_FOUND', detail ?? 'Resource not found');
}

export function conflict(code: string, detail: string, extra?: Record<string, unknown>): AppError {
  return new AppError(409, code, detail, undefined, undefined, extra);
}

export function unprocessable(code: string, detail: string, extra?: Record<string, unknown>): AppError {
  return new AppError(422, code, detail, undefined, undefined, extra);
}

export function forbidden(detail?: string): AppError {
  return new AppError(403, 'FORBIDDEN', detail ?? 'Insufficient permissions');
}

export function validationError(detail: string, issues?: Array<{ path: string; message: string }>): AppError {
  return new AppError(400, 'VALIDATION_ERROR', detail, undefined, issues);
}
