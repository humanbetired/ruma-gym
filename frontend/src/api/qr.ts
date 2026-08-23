import { api } from './axios';

export async function getCurrentStaticQrToken(): Promise<{ token: string | null }> {
  const res = await api.get<{ token: string | null }>('/qr/current-static');
  return res.data;
}