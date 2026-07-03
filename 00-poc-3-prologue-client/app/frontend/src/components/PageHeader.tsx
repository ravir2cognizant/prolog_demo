import { ReactNode } from 'react';

interface Crumb { label: string; }

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}

export default function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="text-xs text-text-secondary mb-1">
            {breadcrumbs.map((crumb, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1 text-text-placeholder">/</span>}
                <span>{crumb.label}</span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-semibold text-text-primary m-0">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0 ml-4">{actions}</div>}
    </div>
  );
}
