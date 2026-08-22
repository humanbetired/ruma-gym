import { api } from './axios';
import type { TrainerProfile, TrainerSchedule } from '../types/trainer';

export async function getTrainers(): Promise<TrainerProfile[]> {
  const res = await api.get<TrainerProfile[]>('/trainers');
  return res.data;
}

export async function getTrainerById(id: string): Promise<TrainerProfile> {
  const res = await api.get<TrainerProfile>(`/trainers/${id}`);
  return res.data;
}

export async function getTrainerSchedules(trainerId: string): Promise<TrainerSchedule[]> {
  const res = await api.get<TrainerSchedule[]>(`/trainers/${trainerId}/schedules`);
  return res.data;
}

export async function getMyTrainerProfile(): Promise<TrainerProfile> {
  const res = await api.get<TrainerProfile>('/trainers/me');
  return res.data;
}

export async function getMySchedules(): Promise<TrainerSchedule[]> {
  const res = await api.get<TrainerSchedule[]>('/trainers/me/schedules');
  return res.data;
}

export async function createSchedule(payload: {
  date: string;
  startTime: string;
  endTime: string;
}): Promise<TrainerSchedule> {
  const res = await api.post<TrainerSchedule>('/trainers/me/schedules', payload);
  return res.data;
}

export async function deleteSchedule(scheduleId: string): Promise<void> {
  await api.delete(`/trainers/me/schedules/${scheduleId}`);
}

export async function createTrainerProfile(data: {
  userId: string;
  bio?: string;
  specialty?: string;
}): Promise<TrainerProfile> {
  const res = await api.post<TrainerProfile>('/trainers', data);
  return res.data;
}

export async function updateTrainerProfileAdmin(
  id: string,
  data: { bio?: string; specialty?: string },
): Promise<TrainerProfile> {
  const res = await api.patch<TrainerProfile>(`/trainers/${id}`, data);
  return res.data;
}

export async function updateMyTrainerProfile(data: {
  bio?: string;
  specialty?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  whatsappUrl?: string;
}): Promise<TrainerProfile> {
  const res = await api.patch<TrainerProfile>('/trainers/me', data);
  return res.data;
}

export async function uploadMyTrainerPhoto(file: File): Promise<TrainerProfile> {
  const formData = new FormData();
  formData.append('photo', file);

  const res = await api.post<TrainerProfile>('/trainers/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}