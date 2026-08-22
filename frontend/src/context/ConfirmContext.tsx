import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  function handleClose(result: boolean) {
    resolver?.(result);
    setOptions(null);
    setResolver(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {options && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-5 bg-black/50">
          <div className="neu-flat rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full neu-pressed flex items-center justify-center shrink-0 ${
                  options.variant === 'danger' ? 'text-error' : 'text-primary'
                }`}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">{options.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{options.message}</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button variant="secondary" onClick={() => handleClose(false)}>
                {options.cancelLabel || 'Batal'}
              </Button>
              <Button
                variant={options.variant === 'danger' ? 'cta' : 'primary'}
                onClick={() => handleClose(true)}
              >
                {options.confirmLabel || 'Ya, lanjutkan'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm harus dipakai di dalam ConfirmProvider');
  }
  return context.confirm;
}