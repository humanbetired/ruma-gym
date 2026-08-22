import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { IconInput } from '../../components/ui/IconInput';
import { Button } from '../../components/ui/Button';
import { Mail, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setIsSent(true);
    } catch {
      setError('Terjadi kesalahan, coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      {isSent ? (
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-14 h-14 rounded-full neu-pressed flex items-center justify-center text-success">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Cek Email Kamu</h1>
            <p className="text-text-secondary mt-2 text-sm">
              Kalau email <span className="text-text-primary font-medium">{email}</span> terdaftar, kami sudah
              mengirimkan link untuk reset password. Link berlaku selama 1 jam.
            </p>
          </div>
          <Link to="/login" className="text-sm text-primary font-semibold mt-2">
            Kembali ke halaman masuk
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-[26px] font-bold text-text-primary">Lupa Password?</h1>
            <p className="text-text-secondary mt-1">
              Masukkan email kamu, kami akan kirimkan link untuk membuat password baru.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <IconInput
              icon={<Mail size={18} />}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <p className="text-sm text-error">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="mt-1">
              {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
            </Button>
          </form>

          <p className="text-sm text-text-secondary mt-8 text-center">
            Ingat password kamu?{' '}
            <Link to="/login" className="text-secondary font-semibold">
              Masuk di sini
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}