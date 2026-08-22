import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cta';
  children: ReactNode;
}

export function Button({ variant = 'secondary', children, className = '', ...props }: ButtonProps) {
  const baseStyle =
    'h-12 px-6 rounded-xl font-semibold text-[15px] transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 border-b-2 border-yellow-400';

  const variantStyle = {
    primary: 'neu-flat text-primary hover:brightness-110 active:shadow-[inset_4px_4px_8px_var(--color-base-dark),inset_-4px_-4px_8px_var(--color-base-light)]',
    secondary: 'neu-pressed text-text-secondary hover:text-text-primary',
    cta: 'neu-flat text-secondary hover:brightness-110 active:shadow-[inset_4px_4px_8px_var(--color-base-dark),inset_-4px_-4px_8px_var(--color-base-light)]',
  };

  return (
    <button className={`${baseStyle} ${variantStyle[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}