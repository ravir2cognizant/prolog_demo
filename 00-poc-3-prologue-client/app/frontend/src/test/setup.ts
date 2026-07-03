import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../api/msw-handlers.js';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
