import { api } from './axios';
import type { DropInVisit } from '../types/dropin';

export async function createDropIn(data: {
  visitorName: string;
  visitorPhone?: string;
  amount: number;
}): Promise<DropInVisit> {
  const res = await api.post<DropInVisit>('/drop-in', data);
  return res.data;
}

export async function checkoutDropIn(id: string): Promise<DropInVisit> {
  const res = await api.patch<DropInVisit>(`/drop-in/${id}/checkout`);
  return res.data;
}

export async function getTodayDropIns(): Promise<DropInVisit[]> {
  const res = await api.get<DropInVisit[]>('/drop-in/today');
  return res.data;
}

export interface DailyDropInStat {
  date: string;
  count: number;
  revenue: number;
}

export async function getDropInDailyStats(days = 7): Promise<DailyDropInStat[]> {
  const res = await api.get<DailyDropInStat[]>('/drop-in/stats/daily', { params: { days } });
  return res.data;
}