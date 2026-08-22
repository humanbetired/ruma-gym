import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan di URL.');
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        if (axios.isAxiosError(err) && err.response?.data?.message) {
          setMessage(err.response.data.message);
        } else {
          setMessage('Gagal memverifikasi email.');
        }
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center flex flex-col items-center gap-4">
      {status === 'loading' && (
        <>
          <Loader2 size={48} className="text-primary animate-spin" />
          <p className="text-text-secondary">Memverifikasi email kamu...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2 size={48} className="text-success" />
          <h1 className="text-xl font-bold">Email Terverifikasi!</h1>
          <p className="text-text-secondary">{message}</p>
          <Link to="/login">
            <Button className="mt-2">Masuk Sekarang</Button>
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle size={48} className="text-error" />
          <h1 className="text-xl font-bold">Verifikasi Gagal</h1>
          <p className="text-text-secondary">{message}</p>
          <Link to="/login">
            <Button variant="secondary" className="mt-2">
              Kembali ke Login
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}