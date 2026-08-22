import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resendVerification } from '../../api/auth';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { IconInput } from '../../components/ui/IconInput';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import axios from 'axios';

function GoogleIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34C2.44 15.98 5.48 18 9 18z"/>
    <path fill="#FBBC05" d="M3.97 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.05l3.01-2.34z"/>
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
  </svg>;
}

export function LoginPage() {
  const { login } = useAuth(), navigate = useNavigate(), location = useLocation();
  const state = location.state as { justRegistered?: boolean; registeredEmail?: string; justResetPassword?: boolean } | null;
  const [email, setEmail] = useState(state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : '';
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Terjadi kesalahan, coba lagi');
      if (String(msg).toLowerCase().includes('belum diverifikasi')) setNeedsVerification(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setResendStatus('sending');
    try {
      await resendVerification(email);
      setResendStatus('sent');
    } catch {
      setResendStatus('idle');
      setError('Gagal mengirim email verifikasi.');
    }
  }

  function handleGoogleLogin() {
    const url = import.meta.env.VITE_API_URL;
    if (url) window.location.href = `${url}/auth/google`;
    else setError('Konfigurasi API belum tersedia.');
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-text-primary">Selamat Datang Kembali</h1>
        <p className="mt-1 text-text-secondary">Masuk untuk lanjutkan latihanmu</p>
      </div>

      {state?.justRegistered && <div className="neu-pressed mb-5 rounded-xl p-3 text-sm text-success">Registrasi berhasil! Cek email kamu untuk verifikasi sebelum login.</div>}
      {state?.justResetPassword && <div className="neu-pressed mb-5 rounded-xl p-3 text-sm text-success">Password berhasil diubah! Silakan masuk dengan password barumu.</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <IconInput icon={<Mail size={18}/>} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <IconInput icon={<Lock size={18}/>} type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />

        <div className="-mt-2 flex items-center justify-between">
          <button type="button" onClick={() => setShowPassword(v => !v)} className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary">
            {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
            {showPassword ? 'Sembunyikan' : 'Tampilkan'} password
          </button>
          <Link to="/forgot-password" className="text-xs font-medium text-primary hover:brightness-110">Lupa password?</Link>
        </div>

        {error && <div className="neu-pressed flex items-start gap-2 rounded-xl p-3 text-sm text-error"><AlertTriangle size={16} className="mt-0.5 shrink-0"/><span>{error}</span></div>}

        {needsVerification && (
          <div className="neu-pressed rounded-xl p-3">
            {resendStatus === 'sent'
              ? <p className="text-sm text-success">Email verifikasi baru sudah dikirim.</p>
              : <button type="button" onClick={handleResend} disabled={resendStatus === 'sending'} className="text-sm font-semibold text-primary underline">{resendStatus === 'sending' ? 'Mengirim...' : 'Kirim ulang email verifikasi'}</button>}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="mt-1">{isSubmitting ? 'Memproses...' : 'Masuk'}</Button>
      </form>

      <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-border"/><span className="text-xs text-text-secondary">atau</span><div className="h-px flex-1 bg-border"/></div>

      <button type="button" onClick={handleGoogleLogin} className="neu-flat flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-text-secondary transition-all hover:brightness-110 active:scale-[0.98]">
        <GoogleIcon/> Masuk dengan Google
      </button>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Belum punya akun? <Link to="/register" className="font-semibold text-secondary">Daftar di sini</Link>
      </p>
    </AuthLayout>
  );
}