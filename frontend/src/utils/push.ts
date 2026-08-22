import { api } from '../api/axios';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function subscribeToPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Browser tidak mendukung push notification.');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    const subJson = subscription.toJSON();

    await api.post('/push/subscribe', {
      endpoint: subJson.endpoint,
      keys: {
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      },
    });

    return true;
  } catch (error) {
    console.error('Gagal subscribe push notification:', error);
    return false;
  }
}