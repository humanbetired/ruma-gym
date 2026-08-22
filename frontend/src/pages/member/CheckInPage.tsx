import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { scanQr } from '../../api/checkin';
import { Button } from '../../components/ui/Button';
import axios from 'axios';
import type { CheckInLog } from '../../types/checkin';

type ScanStatus = 'idle' | 'scanning' | 'processing' | 'success' | 'error';

export function CheckInPage() {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [message, setMessage] = useState('');
  const [, setLastResult] = useState<CheckInLog | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = 'qr-reader';

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  async function startScanning() {
    setStatus('scanning');
    setMessage('');

    const scanner = new Html5Qrcode(readerId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText) => handleScanSuccess(decodedText, scanner),
        () => {},
      );
    } catch {
      setStatus('error');
      setMessage('Tidak bisa mengakses kamera. Pastikan izin kamera sudah diberikan.');
    }
  }

  async function handleScanSuccess(token: string, scanner: Html5Qrcode) {
    await scanner.stop();
    setStatus('processing');
    setMessage('Mengambil lokasi kamu...');

    if (!navigator.geolocation) {
      setStatus('error');
      setMessage('Browser kamu tidak mendukung geolocation.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await scanQr({
            token,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          setLastResult(result);
          setStatus('success');
          setMessage(
            result.type === 'CHECK_IN'
              ? 'Berhasil check-in! Selamat berlatih.'
              : `Berhasil check-out! Durasi latihan: ${result.durationMinutes} menit.`,
          );
        } catch (err) {
          setStatus('error');
          if (axios.isAxiosError(err) && err.response?.data?.message) {
            setMessage(err.response.data.message);
          } else {
            setMessage('Terjadi kesalahan saat memproses scan.');
          }
        }
      },
      () => {
        setStatus('error');
        setMessage('Gagal mengambil lokasi. Pastikan izin lokasi sudah diberikan.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function reset() {
    setStatus('idle');
    setMessage('');
    setLastResult(null);
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Check-in / Check-out</h1>

      <div className="neu-flat rounded-2xl p-6 flex flex-col items-center gap-4">
        <div id={readerId} className={`w-full rounded-xl overflow-hidden ${status === 'scanning' ? 'block' : 'hidden'}`} />

        {status === 'idle' && (
          <>
            <p className="text-text-secondary text-center text-sm">
              Arahkan kamera ke QR code yang ada di resepsionis gym.
            </p>
            <Button onClick={startScanning} className="w-full">Mulai Scan</Button>
          </>
        )}

        {status === 'processing' && <p className="text-text-secondary">{message}</p>}

        {status === 'success' && (
          <>
            <div className="text-success text-center font-semibold">{message}</div>
            <Button onClick={reset} variant="secondary" className="w-full">Scan Lagi</Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-error text-center font-semibold">{message}</div>
            <Button onClick={reset} variant="secondary" className="w-full">Coba Lagi</Button>
          </>
        )}
      </div>
    </div>
  );
}