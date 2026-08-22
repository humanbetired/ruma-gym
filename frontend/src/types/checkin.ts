export interface CheckInLog {
  id: string;
  userId: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  latitude: number | null;
  longitude: number | null;
  distanceMeters: number | null;
  durationMinutes: number | null;
  createdAt: string;
}