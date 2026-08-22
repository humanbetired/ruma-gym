import { api } from './axios';
import type { Payment } from '../types/membership';

export async function submitPaymentProof(
  membershipId: string,
  amount: number,
  proofImage: File,
): Promise<Payment> {
  const formData = new FormData();
  formData.append('membershipId', membershipId);
  formData.append('amount', String(amount));
  formData.append('proofImage', proofImage);

  const res = await api.post<Payment>('/payments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getPendingPayments(): Promise<Payment[]> {
  const res = await api.get<Payment[]>('/payments/pending');
  return res.data;
}

export async function approvePayment(id: string): Promise<Payment> {
  const res = await api.patch<Payment>(`/payments/${id}/approve`);
  return res.data;
}

export async function rejectPayment(id: string, reason?: string): Promise<Payment> {
  const res = await api.patch<Payment>(`/payments/${id}/reject`, { reason });
  return res.data;
}