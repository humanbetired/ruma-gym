import { api } from './axios';
import type { Facility, GalleryImage } from '../types/content';

export async function getFacilities(): Promise<Facility[]> {
  const res = await api.get<Facility[]>('/facilities');
  return res.data;
}

export async function getGalleryImages(category?: string): Promise<GalleryImage[]> {
  const res = await api.get<GalleryImage[]>('/gallery', {
    params: category ? { category } : {},
  });
  return res.data;
}

// ADMIN: FACILITY

export async function getFacilitiesAdmin(): Promise<Facility[]> {
  const res = await api.get<Facility[]>('/admin/facilities');
  return res.data;
}

export async function createFacility(data: {
  name: string;
  description?: string;
  sortOrder?: number;
}): Promise<Facility> {
  const res = await api.post<Facility>('/admin/facilities', data);
  return res.data;
}

export async function updateFacility(
  id: string,
  data: { name?: string; description?: string; sortOrder?: number },
): Promise<Facility> {
  const res = await api.patch<Facility>(`/admin/facilities/${id}`, data);
  return res.data;
}

export async function deleteFacility(id: string): Promise<Facility> {
  const res = await api.delete<Facility>(`/admin/facilities/${id}`);
  return res.data;
}

export async function restoreFacility(id: string): Promise<Facility> {
  const res = await api.patch<Facility>(`/admin/facilities/${id}/restore`);
  return res.data;
}

// ADMIN: GALLERY

export async function createGalleryImage(
  data: { caption?: string; category?: string; sortOrder?: number },
  imageFile: File,
): Promise<GalleryImage> {
  const formData = new FormData();
  if (data.caption) formData.append('caption', data.caption);
  if (data.category) formData.append('category', data.category);
  if (data.sortOrder !== undefined) formData.append('sortOrder', String(data.sortOrder));
  formData.append('image', imageFile);

  const res = await api.post<GalleryImage>('/admin/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await api.delete(`/admin/gallery/${id}`);
}