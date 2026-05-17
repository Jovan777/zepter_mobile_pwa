export interface ProductPrice {
  retail: number;
  clubMember: number;
  clubPartner: number;
}

export interface ProductDiscount {
  clubMemberPercent: number;
  clubPartnerPercent: number;
}

export interface TechnicalDetail {
  label: string;
  value: string;
}

export type ProductStockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Product {
  _id?: string;
  publicId: string;
  name: string;
  slug: string;
  code: string;
  categorySlug: string;
  categoryName: string;
  campaignLabel?: string;
  images: string[];
  badges: string[];
  shortDescription: string;
  description: string;
  presentation: string;
  historyDetails: string;
  technicalDetails: TechnicalDetail[];
  prices: ProductPrice;
  discounts: ProductDiscount;
  currency: 'RSD' | 'EUR';
  stockStatus: ProductStockStatus;
  isFeatured: boolean;
  isNew: boolean;
  isOutlet: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ProductQuery {
  categorySlug?: string;
  q?: string;
  featured?: boolean;
  newOnly?: boolean;
  outlet?: boolean;
  page?: number;
  limit?: number;
}
