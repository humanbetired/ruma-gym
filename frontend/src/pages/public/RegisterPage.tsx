import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { IconInput } from '../../components/ui/IconInput';
import { PasswordStrengthInput } from '../../components/ui/PasswordStrengthInput';
import { Button } from '../../components/ui/Button';
import { User, Mail, Phone, AlertTriangle } from 'lucide-react';
import axios from 'axios';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34C2.44 15.98 5.48 18 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.05l3.01-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register({ fullName, email, phone: phone || undefined, password });
      navigate('/login', { state: { justRegistered: true, registeredEmail: email } });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const msg = err.response.data.message;
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        setError('Terjadi kesalahan, coba lagi');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleRegister() {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-text-primary">Buat Akun Baru</h1>
        <p className="text-text-secondary mt-1">Mulai perjalanan fitnessmu hari ini</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <IconInput icon={<User size={18} />} type="text" placeholder="Nama Lengkap" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <IconInput icon={<Mail size={18} />} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <IconInput icon={<Phone size={18} />} type="tel" placeholder="Nomor HP (opsional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <PasswordStrengthInput value={password} onChange={setPassword} />

        {error && (
          <div className="flex items-start gap-2 text-sm text-error neu-pressed rounded-xl p-3">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? 'Memproses...' : 'Daftar'}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-secondary">atau</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogleRegister}
        className="neu-flat h-12 w-full rounded-xl flex items-center justify-center gap-2 font-semibold text-sm text-text-secondary hover:brightness-110 transition-all active:scale-[0.98]"
      >
        <GoogleIcon />
        Daftar dengan Google
      </button>

      <p className="text-sm text-text-secondary mt-8 text-center">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-secondary font-semibold">
          Masuk di sini
        </Link>
      </p>
    </AuthLayout>
  );
}