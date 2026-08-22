import { api } from './axios';
import type { CheckInLog } from '../types/checkin';

export async function scanQr(payload: {
  token: string;
  latitude: number;
  longitude: number;
}): Promise<CheckInLog> {
  const res = await api.post<CheckInLog>('/check-in/scan', payload);
  return res.data;
}

export interface CheckInLogWithUser extends CheckInLog {
  user: { fullName: string };
}

export async function getRecentCheckIns(limit = 20): Promise<CheckInLogWithUser[]> {
  const res = await api.get<CheckInLogWithUser[]>('/check-in/recent', {
    params: { limit },
  });
  return res.data;
}