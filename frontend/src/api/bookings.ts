import { api } from './axios';
import type { PtBooking } from '../types/trainer';

export async function createBooking(payload: {
  scheduleId: string;
  notes?: string;
}): Promise<PtBooking> {
  const res = await api.post<PtBooking>('/bookings', payload);
  return res.data;
}

export async function getMyBookings(): Promise<PtBooking[]> {
  const res = await api.get<PtBooking[]>('/bookings/my');
  return res.data;
}

export async function getMyConfirmedSchedule(from?: Date, to?: Date): Promise<PtBooking[]> {
  const res = await api.get<PtBooking[]>('/bookings/my/schedule', {
    params: {
      from: from?.toISOString(),
      to: to?.toISOString(),
    },
  });
  return res.data;
}

export async function getTrainerBookings(): Promise<PtBooking[]> {
  const res = await api.get<PtBooking[]>('/bookings/trainer/my');
  return res.data;
}

export async function getPendingBookings(): Promise<PtBooking[]> {
  const res = await api.get<PtBooking[]>('/bookings/pending');
  return res.data;
}

export async function approveBooking(id: string): Promise<PtBooking> {
  const res = await api.patch<PtBooking>(`/bookings/${id}/approve`);
  return res.data;
}

export async function rejectBooking(id: string): Promise<PtBooking> {
  const res = await api.patch<PtBooking>(`/bookings/${id}/reject`);
  return res.data;
}