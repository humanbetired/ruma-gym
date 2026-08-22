import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-5">
      <div className="hidden lg:block lg:w-1/2 max-w-xl">
        <div className="neu-flat rounded-2xl overflow-hidden aspect-3/4 mx-8">
          <img src="/auth-banner.jpeg" alt="Ganesha Gym" className="w-full h-full object-cover object-top" />
        </div>
      </div>

      <div className="w-full lg:w-1/2 max-w-md">
        <div className="neu-flat rounded-2xl p-8">{children}</div>
      </div>
    </div>
  );
}