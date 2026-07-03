import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { apiClient } from '../api/client';
import type { NavItem } from '../api/types';

interface NavTreeNode {
  item: NavItem;
  children: NavItem[];
}

function buildTree(items: NavItem[]): NavTreeNode[] {
  const tops = items.filter((i) => i.level === 0);
  return tops.map((top) => ({
    item: top,
    children: items.filter((c) => c.parentId === top.id),
  }));
}

export function AdminShell(): JSX.Element {
  const { t } = useTranslation();
  const location = useLocation();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getNavigationMenu()
      .then((res) => {
        if (cancelled) return;
        setNavItems(res.items);
        // Auto-expand any section whose child matches the current route
        const init: Record<string, boolean> = {};
        for (const it of res.items) {
          if (it.level === 0) {
            const hasActive = res.items.some(
              (c) =>
                c.parentId === it.id &&
                location.pathname.startsWith(c.route),
            );
            init[it.id] = hasActive;
          }
        }
        setExpanded(init);
      })
      .catch(() => {
        if (!cancelled) setNavItems([]);
      });
    return () => {
      cancelled = true;
    };
    // location.pathname intentionally omitted: nav fetched once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tree = buildTree(navItems);

  return (
    <div className="app-layout">
      <aside
        className="app-sidebar flex flex-col"
        aria-label={t('nav.headerTitle')}
      >
        <header className="app-header" aria-label={t('app.title')}>
          <Link
            to="/"
            className="text-text-on-dark text-base font-semibold focus-ring"
          >
            {t('app.title')}
          </Link>
        </header>
        <div className="px-4 py-3">
          <label className="sr-only" htmlFor="nav-search">
            {t('nav.search')}
          </label>
          <input
            id="nav-search"
            type="search"
            placeholder={t('nav.search')}
            className="form-input rounded-full"
          />
        </div>
        <nav aria-label={t('nav.headerTitle')} className="flex-1">
          <ul className="list-none p-0 m-0">
            {tree.map(({ item, children }) => {
              const isExpanded = expanded[item.id] ?? false;
              const hasActiveChild = children.some(
                (c) => c.route === location.pathname,
              );
              const sectionActive =
                hasActiveChild || location.pathname === item.route;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={clsx(
                      'nav-item w-full justify-between',
                      sectionActive && 'nav-item--active',
                      !item.enabled && 'opacity-50 cursor-not-allowed',
                    )}
                    aria-expanded={isExpanded}
                    aria-disabled={!item.enabled || undefined}
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id],
                      }))
                    }
                  >
                    <span className="flex items-center gap-2">
                      {item.label}
                      {item.alertState ? (
                        <span
                          className="nav-alert-dot"
                          aria-label="has notifications"
                        />
                      ) : null}
                    </span>
                    <span aria-hidden="true">{isExpanded ? '-' : '+'}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="list-none p-0 m-0 overflow-hidden"
                      >
                        {children.map((child) => (
                          <li key={child.id}>
                            {child.enabled ? (
                              <NavLink
                                to={child.route}
                                className={({ isActive }) =>
                                  clsx(
                                    'nav-sub-item',
                                    isActive && 'nav-sub-item--active',
                                  )
                                }
                                aria-current={
                                  location.pathname === child.route
                                    ? 'page'
                                    : undefined
                                }
                              >
                                {child.label}
                              </NavLink>
                            ) : (
                              <span
                                className="nav-sub-item opacity-50 cursor-not-allowed"
                                aria-disabled="true"
                              >
                                {child.label}
                              </span>
                            )}
                          </li>
                        ))}
                      </motion.ul>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className="app-content" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
