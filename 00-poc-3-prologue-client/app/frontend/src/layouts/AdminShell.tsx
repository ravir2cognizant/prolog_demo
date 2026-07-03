import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';

interface NavItem { to: string; labelKey: string; }

const NAV_ITEMS: NavItem[] = [
  { to: '/journal-entries', labelKey: 'nav.journalEntries' },
  { to: '/accounts', labelKey: 'nav.accounts' },
  { to: '/approval-queue', labelKey: 'nav.approvalQueue' },
  { to: '/financial-review', labelKey: 'nav.financialReview' },
  { to: '/accruals-prepaid', labelKey: 'nav.accruals' },
  { to: '/allocation', labelKey: 'nav.allocation' },
  { to: '/report-designer', labelKey: 'nav.reports' },
  { to: '/budget', labelKey: 'nav.budget' },
  { to: '/consolidation', labelKey: 'nav.consolidation' },
  { to: '/fiscal-year-control', labelKey: 'nav.fiscalYear' },
  { to: '/transaction-import', labelKey: 'nav.transactionImport' },
];

export default function AdminShell() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-screen bg-surface-background">
      <header className="h-14 bg-primary-500 flex items-center px-6 shrink-0 shadow-md z-10">
        <span className="text-text-inverse font-semibold text-lg tracking-wide">
          {t('app.title')}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav
          className="bg-surface-white border-r border-border-default flex flex-col overflow-y-auto shrink-0"
          style={{ width: 272 }}
          aria-label={t('nav.label')}
        >
          <ul className="py-2 list-none m-0 p-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block px-5 py-2.5 text-sm font-medium transition-colors duration-100 no-underline ${
                      isActive
                        ? 'bg-primary-50 text-primary-500 border-r-2 border-primary-500'
                        : 'text-text-secondary hover:bg-neutral-50 hover:text-text-primary'
                    }`
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
