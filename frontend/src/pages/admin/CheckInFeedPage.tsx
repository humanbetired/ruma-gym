import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { getRecentCheckIns } from '../../api/checkin';
import type { CheckInLogWithUser } from '../../api/checkin';
import { LogIn, LogOut, QrCode } from 'lucide-react';

export function CheckInFeedPage() {
  const [logs, setLogs] = useState<CheckInLogWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [isQrConnected, setIsQrConnected] = useState(false);

  useEffect(() => {
    getRecentCheckIns()
      .then(setLogs)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const checkInSocket: Socket = io(`${import.meta.env.VITE_API_URL}/check-in`);

    checkInSocket.on('checkin:new', (newLog: CheckInLogWithUser) => {
      setLogs((prev) => [newLog, ...prev].slice(0, 20));
    });

    const qrSocket: Socket = io(`${import.meta.env.VITE_API_URL}/qr`);

    qrSocket.on('connect', () => setIsQrConnected(true));
    qrSocket.on('disconnect', () => setIsQrConnected(false));
    qrSocket.on('qr:rotate', (data: { token: string }) => {
      setQrToken(data.token);
    });

    return () => {
      checkInSocket.disconnect();
      qrSocket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Live Check-in Feed</h1>

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

          <p className={`text-xs flex items-center gap-1.5 ${isQrConnected ? 'text-success' : 'text-text-secondary'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isQrConnected ? 'bg-success' : 'bg-neutral'}`} />
            {isQrConnected ? 'QR aktif' : 'Menghubungkan...'}
          </p>
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