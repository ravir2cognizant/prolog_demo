import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, type = 'button', ...rest }, ref) => {
    const variantClass =
      variant === 'primary'
        ? 'btn-primary'
        : variant === 'secondary'
          ? 'btn-secondary'
          : variant === 'ghost'
            ? 'btn-ghost'
            : 'btn-danger';
    return (
      <button
        ref={ref}
        type={type}
        className={clsx('btn', variantClass, className)}
        {...rest}
      />
    );
  },
);
Button.displayName = 'Button';
