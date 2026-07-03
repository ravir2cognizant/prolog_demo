import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './i18n';
import './styles/globals.css';
import { router } from './routes';

async function bootstrap(): Promise<void> {
  // Optional MSW boot. With VITE_USE_MSW=1 the SPA runs fully offline.
  if (import.meta.env.VITE_USE_MSW === '1') {
    try {
      const { setupWorker } = await import('msw/browser');
      const { handlers } = await import('./api/msw-handlers');
      const worker = setupWorker(...handlers);
      await worker.start({
        onUnhandledRequest: 'bypass',
        // The mockServiceWorker.js file is created at install time via the
        // postinstall hook in package.json. If it is missing, the SPA falls
        // back to direct BFF calls and logs a hint instead of crashing.
        quiet: false,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        'MSW worker failed to start. Run `npx msw init public/ --save`. Falling back to direct BFF.',
        err,
      );
    }
  }

  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('#root not found');

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}

void bootstrap();
