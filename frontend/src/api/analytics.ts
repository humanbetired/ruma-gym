import { api } from './axios';
import type { DailyVisit, PeakHour, MemberGrowth } from '../types/analytics';

export async function getDailyVisits(days = 7): Promise<DailyVisit[]> {
  const res = await api.get<DailyVisit[]>('/analytics/daily-visits', { params: { days } });
  return res.data;
}

export async function getPeakHours(days = 30): Promise<PeakHour[]> {
  const res = await api.get<PeakHour[]>('/analytics/peak-hours', { params: { days } });
  return res.data;
}

export async function getMemberGrowth(months = 6): Promise<MemberGrowth[]> {
  const res = await api.get<MemberGrowth[]>('/analytics/member-growth', { params: { months } });
  return res.data;
}