import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordStrengthInput } from '../../components/ui/PasswordStrengthInput';
import { Button } from '../../components/ui/Button';
import { KeyRound, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token reset password tidak ditemukan di URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      navigate('/login', { state: { justResetPassword: true } });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        const msg = err.response.data.message;
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        setError('Gagal mengatur ulang password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-14 h-14 rounded-full neu-pressed flex items-center justify-center text-error">
            <AlertTriangle size={28} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-text-primary">Link Tidak Valid</h1>
            <p className="text-text-secondary mt-2 text-sm">
              Link reset password tidak lengkap atau sudah tidak berlaku.
            </p>
          </div>
          <Link to="/forgot-password" className="text-sm text-primary font-semibold mt-2">
            Minta link baru
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full neu-pressed flex items-center justify-center text-primary mb-4">
          <KeyRound size={24} />
        </div>
        <h1 className="text-[26px] font-bold text-text-primary">Buat Password Baru</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Password baru kamu harus berbeda dari sebelumnya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordStrengthInput value={newPassword} onChange={setNewPassword} placeholder="Password Baru" />

        {error && <p className="text-sm text-error">{error}</p>}

        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
        </Button>
      </form>
    </AuthLayout>
  );
}