import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AdminShell } from './layouts/AdminShell';
import { NavMenuPage } from './features/navigation/NavMenuPage';
import {
  JEHeaderPage,
  jeHeaderLoader,
  jeHeaderAction,
} from './features/journal-entry/JEHeaderPage';
import {
  JEFormPage,
  jeFormLoader,
  jeFormAction,
} from './features/journal-entry/JEFormPage';
import { JEListPage, jeListLoader } from './features/journal-entry/JEListPage';
import { CompanySelectPage } from './features/company/CompanySelectPage';
import { ComingSoonPage } from './components/ComingSoonPage';
import { RoutesPage } from './dev/RoutesPage';

/**
 * Route tree - every entry MUST also be listed in src/dev/route-inventory.ts.
 * RoutesPage cross-checks at render time.
 */
const routeObjects: RouteObject[] = [
  {
    path: '/',
    element: <AdminShell />,
    children: [
      { index: true, element: <NavMenuPage /> },
      { path: 'gl', element: <NavMenuPage /> },
      {
        path: 'gl/journal-entries',
        element: <JEListPage />,
        loader: jeListLoader,
      },
      {
        path: 'gl/journal-entries/new',
        element: <JEFormPage mode="create" />,
        loader: jeFormLoader,
        action: jeFormAction,
      },
      {
        path: 'gl/journal-entries/:journalId',
        element: <JEHeaderPage />,
        loader: jeHeaderLoader,
        action: jeHeaderAction,
      },
      {
        path: 'gl/journal-entries/:journalId/edit',
        element: <JEFormPage mode="edit" />,
        loader: jeFormLoader,
        action: jeFormAction,
      },
      { path: 'gl/reports', element: <ComingSoonPage /> },
      { path: 'gl/trial-balance', element: <ComingSoonPage /> },
      { path: 'ap', element: <ComingSoonPage /> },
      { path: 'companies', element: <CompanySelectPage /> },
      { path: 'dev/routes', element: <RoutesPage /> },
    ],
  },
];

export const router = createBrowserRouter(routeObjects);

/**
 * Flatten the route objects into the full set of paths the browser router
 * exposes. Used by RoutesPage for drift checks.
 */
export function collectRoutePaths(): string[] {
  const out: string[] = [];
  function walk(routes: RouteObject[], prefix: string): void {
    for (const r of routes) {
      let full: string;
      if (r.index) {
        full = prefix === '' ? '/' : prefix;
      } else if (r.path?.startsWith('/')) {
        full = r.path;
      } else {
        const p = r.path ?? '';
        full =
          prefix === ''
            ? `/${p}`
            : prefix === '/'
              ? `/${p}`
              : `${prefix}/${p}`;
      }
      full = full.replace(/\/+/g, '/');
      if (full !== '/' && full.endsWith('/')) full = full.slice(0, -1);
      if (r.element) out.push(full);
      if (r.children?.length) walk(r.children, full === '/' ? '' : full);
    }
  }
  walk(routeObjects, '');
  return Array.from(new Set(out));
}
