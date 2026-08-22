import type { InputHTMLAttributes, ReactNode } from 'react';

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode;
  error?: string;
}

export function IconInput({ icon, error, className = '', id, ...props }: IconInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          className={`neu-pressed h-12 pl-12 pr-4 rounded-xl border-none w-full text-text-primary placeholder:text-neutral focus:outline-none focus:ring-2 ${
            error ? 'focus:ring-error' : 'focus:ring-primary/50'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}