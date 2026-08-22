import { api } from './axios';
import type { WarungProduct, WarungTransaction } from '../types/warung';

export async function getActiveProducts(): Promise<WarungProduct[]> {
  const res = await api.get<WarungProduct[]>('/warung/products');
  return res.data;
}

export async function getAllProductsAdmin(): Promise<WarungProduct[]> {
  const res = await api.get<WarungProduct[]>('/warung/products/admin');
  return res.data;
}

export async function createProduct(data: {
  name: string;
  price: number;
  stock: number;
}): Promise<WarungProduct> {
  const res = await api.post<WarungProduct>('/warung/products', data);
  return res.data;
}

export async function updateProduct(
  id: string,
  data: { name?: string; price?: number; stock?: number; isActive?: boolean },
): Promise<WarungProduct> {
  const res = await api.patch<WarungProduct>(`/warung/products/${id}`, data);
  return res.data;
}

export async function deleteProduct(id: string): Promise<WarungProduct> {
  const res = await api.delete<WarungProduct>(`/warung/products/${id}`);
  return res.data;
}

export async function createTransaction(
  items: { productId: string; quantity: number }[],
): Promise<WarungTransaction> {
  const res = await api.post<WarungTransaction>('/warung/transactions', { items });
  return res.data;
}

export interface PaginatedTransactions {
  data: WarungTransaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getTransactions(params: {
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedTransactions> {
  const res = await api.get<PaginatedTransactions>('/warung/transactions', { params });
  return res.data;
}