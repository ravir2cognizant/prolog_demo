import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wrap an async controller so thrown errors flow into Express's error pipeline.
 *
 * The wrapped function may return:
 *   - a value -> JSON-serialised with res.status() honoured if already set
 *   - undefined -> assumes the controller already responded (e.g. 204)
 */
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T> | T,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => fn(req, res, next))
      .then((result) => {
        if (res.headersSent) return;
        if (result === undefined) return;
        res.json(result);
      })
      .catch(next);
  };
}

export const ah = asyncHandler;
