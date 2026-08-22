import { api } from './axios';

export interface ActiveMembership {
  planName: string;
  endDate: string;
}

export interface UserBasic {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  ktaNumber: string | null;
  role: string;
  createdAt: string;
  activeMembership: ActiveMembership | null;
}

export interface PaginatedUsers {
  data: UserBasic[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getUsersByRole(
  role?: string,
  search?: string,
  page = 1,
  limit = 5,
): Promise<PaginatedUsers> {
  const res = await api.get<PaginatedUsers>('/users', {
    params: {
      role,
      search: search || undefined,
      page,
      limit,
    },
  });

  return res.data;
}

export async function updateUserRole(
  id: string,
  role: string,
): Promise<UserBasic> {
  const res = await api.patch<UserBasic>(
    `/users/${id}/role`,
    { role },
  );

  return res.data;
}

export interface KtaData {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  ktaNumber: string;
  createdAt: string;
  activeMembership: {
    planName: string;
    startDate: string;
    endDate: string;
  } | null;
}

export async function getMyKta(): Promise<KtaData> {
  const res = await api.get<KtaData>('/users/me/kta');

  return res.data;
}