import { useEffect, useState } from 'react';
import { getMyNotifications, markNotificationAsRead } from '../../api/notifications';
import type { Notification } from '../../types/notification';
import { Bell, BellRing } from 'lucide-react';
import { subscribeToPush } from '../../utils/push';
import { Button } from '../../components/ui/Button';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pushStatus, setPushStatus] = useState<'idle' | 'enabling' | 'enabled' | 'failed'>('idle');

  useEffect(() => {
    getMyNotifications()
      .then(setNotifications)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleEnablePush() {
    setPushStatus('enabling');
    const success = await subscribeToPush();
    setPushStatus(success ? 'enabled' : 'failed');
  }

  async function handleClick(notification: Notification) {
    if (notification.isRead) return;
    try {
      await markNotificationAsRead(notification.id);
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
    } catch {
      // biarkan saja dia dengan yang lain dan ikhlaskan.
    }
  }

  if (isLoading) return <p className="text-text-secondary">Memuat...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Notifikasi</h1>

        {pushStatus !== 'enabled' && (
          <Button variant="secondary" onClick={handleEnablePush} disabled={pushStatus === 'enabling'}>
            <BellRing size={16} className="inline mr-2" />
            {pushStatus === 'enabling' ? 'Mengaktifkan...' : 'Aktifkan Push'}
          </Button>
        )}
      </div>

      {pushStatus === 'enabled' && <p className="text-sm text-success mb-4">✓ Notifikasi push aktif di perangkat ini.</p>}
      {pushStatus === 'failed' && (
        <p className="text-sm text-error mb-4">Gagal mengaktifkan push. Pastikan izin notifikasi diberikan di pengaturan browser.</p>
      )}

      {notifications.length === 0 ? (
        <p className="text-text-secondary">Belum ada notifikasi.</p>
      ) : (
        <div className="neu-flat rounded-xl overflow-hidden flex flex-col gap-1 p-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                !notification.isRead ? 'neu-pressed' : 'hover:brightness-105'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${notification.isRead ? 'text-neutral' : 'text-secondary'}`}>
                <Bell size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.isRead ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-neutral mt-1">
                  {new Date(notification.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>

              {!notification.isRead && <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}