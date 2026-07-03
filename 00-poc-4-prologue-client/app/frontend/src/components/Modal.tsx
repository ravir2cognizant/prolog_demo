import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: ModalProps): JSX.Element | null {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <Button
            variant="ghost"
            aria-label={t('common.close')}
            onClick={onClose}
            className="!h-8 !px-2"
          >
            <span aria-hidden="true">×</span>
          </Button>
        </header>
        <div className="mb-4 text-sm text-text-primary">{children}</div>
        {footer ? (
          <footer className="flex justify-end gap-2">{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}
