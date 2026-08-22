import { api } from './axios';

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const res = await api.get<{ message: string }>('/auth/verify-email', { params: { token } });
  return res.data;
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>('/auth/resend-verification', { email });
  return res.data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  return res.data;
}