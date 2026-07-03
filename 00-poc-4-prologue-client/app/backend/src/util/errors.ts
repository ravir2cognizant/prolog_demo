/**
 * AppError -- typed errors thrown from services/controllers and converted to
 * a stable JSON shape by the central error handler. The shape matches the
 * ED-### "error responses" contracts ({ error, field? }) and is a strict
 * subset of RFC 7807 problem+json (problem-type fields can be added later).
 */
export class AppError extends Error {
  public readonly status: number;
  public readonly field: string | undefined;

  constructor(status: number, message: string, field?: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.field = field;
  }
}

export const unauthorised = (msg = 'Unauthorised'): AppError => new AppError(401, msg);
export const forbidden = (msg = 'Forbidden'): AppError => new AppError(403, msg);
export const notFound = (msg: string): AppError => new AppError(404, msg);
export const conflict = (msg: string): AppError => new AppError(409, msg);
export const badRequest = (msg: string, field?: string): AppError =>
  new AppError(400, msg, field);
