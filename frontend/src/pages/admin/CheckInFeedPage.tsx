import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { getRecentCheckIns } from '../../api/checkin';
import { getCurrentStaticQrToken } from '../../api/qr';
import type { CheckInLogWithUser } from '../../api/checkin';
import { LogIn, LogOut, QrCode, Download } from 'lucide-react';

export function CheckInFeedPage() {
  const [logs, setLogs] = useState<CheckInLogWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const downloadQrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getRecentCheckIns()
      .then(setLogs)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    getCurrentStaticQrToken().then((result) => setQrToken(result.token));
  }, []);

  useEffect(() => {
    const checkInSocket: Socket = io(`${import.meta.env.VITE_API_URL}/check-in`);

    checkInSocket.on('checkin:new', (newLog: CheckInLogWithUser) => {
      setLogs((prev) => [newLog, ...prev].slice(0, 20));
    });

    return () => {
      checkInSocket.disconnect();
    };
  }, []);

  function handleDownloadQr() {
    const svgElement = downloadQrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;

    const image = new Image();
    image.onload = () => {
      const scale = 4;
      const canvas = document.createElement('canvas');
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const pngUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = 'qr-presensi-ruma-gym.png';
      link.click();
    };
    image.src = svgDataUrl;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Live Check-in Feed</h1>

      {qrToken && (
        <div ref={downloadQrRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <QRCodeSVG value={qrToken} size={512} bgColor="#FFFFFF" fgColor="#000000" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="neu-flat rounded-xl p-6 flex flex-col items-center gap-4 h-fit">
          <div className="flex items-center gap-2 self-start">
            <QrCode size={18} className="text-primary" />
            <h2 className="font-bold text-text-primary">QR Presensi</h2>
          </div>

          <div className="neu-pressed rounded-xl p-4">
            {qrToken ? (
              <QRCodeSVG value={qrToken} size={220} bgColor="transparent" fgColor="#E8E9EB" />
            ) : (
              <div className="w-55 h-55 flex items-center justify-center text-text-secondary text-sm">
                Memuat QR...
              </div>
            )}
          </div>

          {qrToken && (
            <button
              onClick={handleDownloadQr}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:brightness-110 transition-all"
            >
              <Download size={16} />
              Download QR
            </button>
          )}
        </div>

        <div>
          {isLoading ? (
            <p className="text-text-secondary">Memuat...</p>
          ) : logs.length === 0 ? (
            <p className="text-text-secondary">Belum ada aktivitas check-in.</p>
          ) : (
            <div className="neu-flat rounded-xl p-2 flex flex-col gap-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg hover:brightness-105 transition-all">
                  <div
                    className={`w-10 h-10 rounded-full neu-pressed flex items-center justify-center shrink-0 ${
                      log.type === 'CHECK_IN' ? 'text-success' : 'text-primary'
                    }`}
                  >
                    {log.type === 'CHECK_IN' ? <LogIn size={18} /> : <LogOut size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary truncate">{log.user.fullName}</p>
                    <p className="text-sm text-text-secondary">
                      {log.type === 'CHECK_IN' ? 'Check-in' : 'Check-out'}
                      {log.durationMinutes != null && ` • ${log.durationMinutes} menit`}
                    </p>
                  </div>

                  <span className="text-sm text-neutral shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}