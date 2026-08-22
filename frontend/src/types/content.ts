export interface Facility {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  category: string | null;
  sortOrder: number;
  createdAt: string;
}