import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface PromptOptions {
  title: string;
  message?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  required?: boolean;
}

interface PromptContextType {
  prompt: (options: PromptOptions) => Promise<string | null>;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export function PromptProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<PromptOptions | null>(null);
  const [resolver, setResolver] = useState<((value: string | null) => void) | null>(null);
  const [value, setValue] = useState('');

  const promptFn = useCallback((opts: PromptOptions): Promise<string | null> => {
    setOptions(opts);
    setValue('');
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  function handleClose(result: string | null) {
    resolver?.(result);
    setOptions(null);
    setResolver(null);
    setValue('');
  }

  function handleConfirm() {
    if (options?.required && !value.trim()) return;
    handleClose(value.trim() || null);
  }

  return (
    <PromptContext.Provider value={{ prompt: promptFn }}>
      {children}

      {options && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-5 bg-black/50">
          <div className="neu-flat rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full neu-pressed flex items-center justify-center shrink-0 text-primary">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">{options.title}</h3>
                {options.message && <p className="text-sm text-text-secondary mt-1">{options.message}</p>}
              </div>
            </div>

            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={options.placeholder}
              rows={3}
              autoFocus
              className="neu-pressed w-full px-4 py-3 rounded-xl border-none text-text-primary placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <div className="flex gap-2 justify-end mt-6">
              <Button variant="secondary" onClick={() => handleClose(null)}>
                {options.cancelLabel || 'Batal'}
              </Button>
              <Button onClick={handleConfirm} disabled={options.required && !value.trim()}>
                {options.confirmLabel || 'Kirim'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PromptContext.Provider>
  );
}

export function usePrompt() {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompt harus dipakai di dalam PromptProvider');
  }
  return context.prompt;
}