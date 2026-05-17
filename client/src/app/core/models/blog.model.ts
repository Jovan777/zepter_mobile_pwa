import { Product } from './product.model';

export type BlogContentBlockType = 'paragraph' | 'heading' | 'quote' | 'list';

export interface BlogContentBlock {
  type: BlogContentBlockType;
  text?: string;
  items?: string[];
}

export interface BlogPost {
  _id?: string;
  publicId: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  author: string;
  category: string;
  monthLabel: string;
  imageUrl: string;
  content: BlogContentBlock[];
  relatedProductPublicIds: string[];
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogDetailsResponse {
  post: BlogPost;
  relatedProducts: Product[];
}
