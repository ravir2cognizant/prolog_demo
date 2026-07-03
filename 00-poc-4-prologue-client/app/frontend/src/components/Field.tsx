import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  helperText?: string;
  inputId?: string;
  /** Render a readonly visual instead of a writable input. */
  readOnlyDisplay?: boolean;
  /** Slot for custom controls (Select, DatePicker). Overrides default <input>. */
  children?: ReactNode;
}

/**
 * Reusable form field. Wraps a label, input, optional helper, and an
 * error message slot with role="alert".
 *
 * The component is wrapped in forwardRef so consumers can pass the ref
 * supplied by react-hook-form's `register('name')` -> the ref flows onto
 * the internal <input>.
 */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  props,
  ref,
): JSX.Element {
  const {
    label,
    error,
    helperText,
    inputId,
    readOnlyDisplay = false,
    children,
    className,
    required,
    ...rest
  } = props;
  const autoId = useId();
  const id = inputId ?? rest.id ?? autoId;
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const describedBy =
    [rest['aria-describedby'], errorId, helperId].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-semantic-error">
            {' *'}
          </span>
        ) : null}
      </label>
      {children ?? (
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={clsx(
            'form-input',
            readOnlyDisplay && 'form-input--readonly',
            error && 'form-input--error',
            className,
          )}
          readOnly={readOnlyDisplay || rest.readOnly}
          {...rest}
        />
      )}
      {helperText ? (
        <span id={helperId} className="text-xs text-text-secondary">
          {helperText}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} role="alert" className="form-error">
          {error}
        </span>
      ) : null}
    </div>
  );
});
