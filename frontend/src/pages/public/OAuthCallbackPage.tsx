import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSessionFromOAuth } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const accessToken = searchParams.get('accessToken');

    if (!accessToken) {
      navigate('/login');
      return;
    }

    setSessionFromOAuth(accessToken).then(() => {
      navigate('/');
    });
  }, [searchParams, navigate, setSessionFromOAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 size={40} className="text-primary animate-spin" />
      <p className="text-text-secondary">Menyelesaikan login...</p>
    </div>
  );
}