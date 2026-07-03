import { useTranslation } from 'react-i18next';
import { ROUTE_INVENTORY } from './route-inventory.js';

export default function RoutesPage() {
  const { t } = useTranslation();
  const real = ROUTE_INVENTORY.filter((r) => r.status === 'real').length;
  const stub = ROUTE_INVENTORY.filter((r) => r.status === 'stub').length;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-text-primary mb-1">{t('dev.routesTitle')}</h1>
      <p className="text-sm text-text-secondary mb-4">
        {real} real &nbsp;·&nbsp; {stub} stubs &nbsp;·&nbsp; {ROUTE_INVENTORY.length} total
      </p>

      <div className="overflow-x-auto rounded-md border border-border-default bg-surface-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-border-default">
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Path</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Component</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">CI Card</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Description</th>
              <th className="px-4 py-3 text-left font-semibold text-text-secondary">Status</th>
            </tr>
          </thead>
          <tbody>
            {ROUTE_INVENTORY.map((entry) => (
              <tr key={entry.path} className="border-b border-border-default last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-text-primary">{entry.path}</td>
                <td className="px-4 py-3 text-text-primary">{entry.component}</td>
                <td className="px-4 py-3 text-text-secondary">{entry.ciCard}</td>
                <td className="px-4 py-3 text-text-secondary">{entry.description}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      entry.status === 'real'
                        ? 'bg-state-successLight text-state-success'
                        : 'bg-neutral-100 text-text-secondary'
                    }`}
                  >
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
