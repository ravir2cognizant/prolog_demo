import type { ZodTypeAny } from 'zod';

export type AuthMode = 'public' | 'bearer';
export type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'delete';

export interface ResponseDoc {
  description: string;
  schema?: ZodTypeAny;
  example?: unknown;
}

export interface EndpointDoc {
  method: HttpMethod;
  path: string;
  tag: string;
  summary: string;
  auth: AuthMode;
  requestBody?: ZodTypeAny;
  query?: ZodTypeAny;
  pathParams?: Record<string, { description?: string }>;
  responses: Record<number, ResponseDoc>;
}

const registry: EndpointDoc[] = [];

export function documented(doc: EndpointDoc): void {
  registry.push(doc);
}

export function listEndpoints(): EndpointDoc[] {
  return registry;
}

export function clearEndpoints(): void {
  registry.length = 0;
}
