import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ROUTE_INVENTORY } from './route-inventory';
import { collectRoutePaths } from '../routes';

/**
 * /dev/routes - frontend equivalent of the BFF /api-docs.
 *
 * Renders the declarative ROUTE_INVENTORY and cross-checks against the
 * actual router tree to surface drift.
 */
export function RoutesPage(): JSX.Element {
  const { t } = useTranslation();

  const { inventoryPaths, routerPaths, missingInInventory, missingInRouter } =
    useMemo(() => {
      const invPaths = new Set(ROUTE_INVENTORY.map((e) => e.path));
      const rtrPaths = new Set(collectRoutePaths());
      const missingInv: string[] = [];
      const missingRtr: string[] = [];
      for (const p of rtrPaths) {
        if (!invPaths.has(p)) missingInv.push(p);
      }
      for (const p of invPaths) {
        if (!rtrPaths.has(p)) missingRtr.push(p);
      }
      return {
        inventoryPaths: invPaths,
        routerPaths: rtrPaths,
        missingInInventory: missingInv,
        missingInRouter: missingRtr,
      };
    }, []);

  return (
    <section>
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        {t('routes.title')}
      </h1>
      <p className="text-sm text-text-secondary mb-4">{t('routes.intro')}</p>
      <p className="text-xs text-text-secondary mb-4">
        Inventory entries: {inventoryPaths.size} | Router routes: {routerPaths.size}
      </p>

      <table className="data-grid" role="grid">
        <thead>
          <tr>
            <th scope="col">{t('routes.columns.path')}</th>
            <th scope="col">{t('routes.columns.component')}</th>
            <th scope="col">{t('routes.columns.auth')}</th>
            <th scope="col">{t('routes.columns.status')}</th>
            <th scope="col">{t('routes.columns.consumes')}</th>
          </tr>
        </thead>
        <tbody>
          {ROUTE_INVENTORY.map((entry) => (
            <tr key={entry.path}>
              <td className="cell-account-code">{entry.path}</td>
              <td>{entry.component}</td>
              <td>{entry.auth}</td>
              <td>{entry.status}</td>
              <td>
                {entry.consumes.length === 0 ? (
                  <span className="text-text-secondary">—</span>
                ) : (
                  <ul className="list-none p-0 m-0">
                    {entry.consumes.map((c) => (
                      <li
                        key={`${entry.path}-${c.method}-${c.path}-${c.via}`}
                        className="cell-account-code"
                      >
                        <strong>{c.method}</strong> {c.path}{' '}
                        <em className="text-text-secondary">({c.via})</em>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-6 mb-2">{t('routes.drift.title')}</h2>
      {missingInInventory.length === 0 && missingInRouter.length === 0 ? (
        <p className="text-semantic-success" data-testid="drift-ok">
          {t('routes.drift.none')}
        </p>
      ) : (
        <div data-testid="drift-warn">
          {missingInInventory.length > 0 ? (
            <p>
              <strong>{t('routes.drift.missingInInventory')}</strong>
              <code className="ml-2">{missingInInventory.join(', ')}</code>
            </p>
          ) : null}
          {missingInRouter.length > 0 ? (
            <p>
              <strong>{t('routes.drift.missingInRouter')}</strong>
              <code className="ml-2">{missingInRouter.join(', ')}</code>
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
