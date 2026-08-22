import { useState } from 'react';
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react';

interface PasswordStrengthInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

const rules = [
  { label: 'Minimal 8 karakter', test: (v: string) => v.length >= 8 },
  { label: 'Huruf besar (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Huruf kecil (a-z)', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Angka (0-9)', test: (v: string) => /\d/.test(v) },
  { label: 'Karakter spesial (!@#$%...)', test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

export function PasswordStrengthInput({ value, onChange, placeholder = 'Password', id }: PasswordStrengthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const passedRules = rules.filter((rule) => rule.test(value)).length;
  const strengthPercent = (passedRules / rules.length) * 100;

  const strengthColor = passedRules <= 2 ? 'bg-error' : passedRules <= 4 ? 'bg-warning' : 'bg-success';
  const strengthLabel = passedRules <= 2 ? 'Lemah' : passedRules <= 4 ? 'Sedang' : 'Kuat';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
          <Lock size={18} />
        </div>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="neu-pressed h-12 pl-12 pr-12 rounded-xl border-none w-full text-text-primary placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral hover:text-text-primary transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {value.length > 0 && (
        <div className="h-1.5 w-full neu-pressed rounded-full overflow-hidden">
          <div
            className={`h-full ${strengthColor} transition-all duration-300`}
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
      )}

      {(isFocused || (value.length > 0 && passedRules < rules.length)) && (
        <div className="flex flex-col gap-1 mt-1 neu-flat-sm rounded-xl p-3">
          {value.length > 0 && (
            <p className="text-xs font-semibold text-text-secondary mb-1">Kekuatan: {strengthLabel}</p>
          )}
          {rules.map((rule) => {
            const passed = rule.test(value);
            return (
              <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                {passed ? (
                  <Check size={14} className="text-success shrink-0" />
                ) : (
                  <X size={14} className="text-neutral shrink-0" />
                )}
                <span className={passed ? 'text-success' : 'text-text-secondary'}>{rule.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}