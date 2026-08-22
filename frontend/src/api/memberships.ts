import { api } from './axios';
import type { Membership } from '../types/membership';
import type { MembershipPlan } from '../types/membership';

export async function createMembership(planId: string): Promise<Membership> {
  const res = await api.post<Membership>('/memberships', { planId });
  return res.data;
}

export async function getMyMemberships(): Promise<Membership[]> {
  const res = await api.get<Membership[]>('/memberships/my');
  return res.data;
}

export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  const res = await api.get<MembershipPlan[]>('/memberships/plans');
  return res.data;
}

export async function getMembershipPlansAdmin(): Promise<MembershipPlan[]> {
  const res = await api.get<MembershipPlan[]>('/memberships/plans/admin');
  return res.data;
}

export async function createMembershipPlan(data: {
  name: string;
  durationDays: number;
  price: number;
  ptSessionQuota?: number;
}): Promise<MembershipPlan> {
  const res = await api.post<MembershipPlan>('/memberships/plans', data);
  return res.data;
}

export async function updateMembershipPlan(
  id: string,
  data: {
    name?: string;
    durationDays?: number;
    price?: number;
    ptSessionQuota?: number;
    isActive?: boolean;
  },
): Promise<MembershipPlan> {
  const res = await api.patch<MembershipPlan>(`/memberships/plans/${id}`, data);
  return res.data;
}

export async function cancelMembership(id: string): Promise<void> {
  await api.delete(`/memberships/${id}`);
}