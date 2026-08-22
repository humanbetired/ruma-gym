import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`neu-pressed h-12 px-4 rounded-xl border-none text-text-primary placeholder:text-neutral focus:outline-none focus:ring-2 ${
          error ? 'focus:ring-error' : 'focus:ring-primary/50'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-error">{error}</span>}
    </div>
  );
}