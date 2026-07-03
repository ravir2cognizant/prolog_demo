import createClient from 'openapi-fetch';
import type { paths } from './schema.js';

const BASE_URL = import.meta.env['VITE_API_BASE_URL'] ?? 'http://localhost:4000';
const DEV_TOKEN = import.meta.env['VITE_DEV_TOKEN'] ?? 'dev-token';

export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DEV_TOKEN}`,
  },
});

export async function postMultipart(path: string, formData: FormData): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${DEV_TOKEN}` },
    body: formData,
  });
}
