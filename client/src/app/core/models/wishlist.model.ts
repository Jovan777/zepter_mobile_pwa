import { ProductDiscount, ProductPrice } from './product.model';

export interface WishlistProduct {
  productPublicId: string;
  name: string;
  code: string;
  categoryName: string;
  imageUrl: string;
  prices: ProductPrice;
  discounts?: ProductDiscount;
}

export interface WishlistRecord {
  publicId: string;
  userPublicId: string;
  productPublicId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WishlistToggleResponse {
  wishlisted: boolean;
}
