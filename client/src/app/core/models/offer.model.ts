import { CartItemInput } from './cart.model';

export interface OfferClient {
  clientPublicId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface CreateOfferItem extends CartItemInput {
  privilegedDiscountLevel?: string;
}

export interface CreateOfferPayload {
  userPublicId: string;
  items: CreateOfferItem[];
  clients: OfferClient[];
  validUntil: string | Date;
  promoCode?: string;
  privilegedConditions?: string;
  message?: string;
  sendVia: ('EMAIL' | 'PHONE')[];
}

export interface OfferItem {
  productPublicId: string;
  name: string;
  code: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  privilegedDiscountLevel?: string;
}

export interface Offer {
  _id?: string;
  publicId: string;
  userPublicId: string;
  items: OfferItem[];
  clients: OfferClient[];
  validUntil: string;
  promoCode?: string;
  privilegedConditions?: string;
  message?: string;
  sendVia: ('EMAIL' | 'PHONE')[];
  totals: {
    selectedSubtotal: number;
    grandTotal: number;
    currency: 'RSD' | 'EUR';
  };
  status: 'DRAFT' | 'SENT';
  createdAt: string;
}
