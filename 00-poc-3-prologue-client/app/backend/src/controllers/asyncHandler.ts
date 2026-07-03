import type { Request, Response, NextFunction } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function ah(fn: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).then((result) => {
      if (result !== undefined && !res.headersSent) {
        res.json(result);
      }
    }).catch(next);
  };
}
