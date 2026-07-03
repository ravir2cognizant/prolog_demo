import type { ZodTypeAny } from 'zod';

export type AuthMode = 'public' | 'bearer';
export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'get' | 'post' | 'patch' | 'put' | 'delete';

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
  auth?: AuthMode;
  requestBody?: ZodTypeAny;
  query?: ZodTypeAny;
  pathParams?: Record<string, { description?: string }>;
  responses: Record<number | string, ResponseDoc>;
}

export interface NormalisedEndpointDoc extends Omit<EndpointDoc, 'auth' | 'method'> {
  method: string;
  auth: AuthMode;
}

const registry: NormalisedEndpointDoc[] = [];

export function documented(doc: EndpointDoc): void {
  registry.push({
    ...doc,
    method: doc.method.toUpperCase(),
    auth: doc.auth ?? 'bearer',
  });
}

export function listEndpoints(): NormalisedEndpointDoc[] {
  return registry;
}
