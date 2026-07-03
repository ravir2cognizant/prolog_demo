import { setupWorker } from 'msw/browser';
import { handlers } from './msw-handlers.js';

export const worker = setupWorker(...handlers);
