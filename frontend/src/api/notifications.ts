import { api } from './axios';
import type { Notification } from '../types/notification';

export async function getMyNotifications(): Promise<Notification[]> {
  const res = await api.get<Notification[]>('/notifications/my');
  return res.data;
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const res = await api.patch<Notification>(`/notifications/${id}/read`);
  return res.data;
}