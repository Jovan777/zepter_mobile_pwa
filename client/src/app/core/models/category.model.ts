export interface Category {
  _id?: string;
  publicId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  iconUrl?: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
}
