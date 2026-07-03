import { ReactNode } from 'react';
import * as Label from '@radix-ui/react-label';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children?: ReactNode;
  className?: string;
}

export default function Field({ id, label, error, required, children, className = '' }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Label.Root htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-state-error ml-0.5" aria-hidden="true">*</span>}
      </Label.Root>
      {children}
      {error && (
        <span role="alert" className="text-xs text-state-error mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
