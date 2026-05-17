import { CartItemInput, PriceTier } from './cart.model';

export interface OfferRecipient {
  clientPublicId?: string;
  source: 'CLIENT' | 'MANUAL';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface PrivilegedConditions {
  enabled: boolean;
  discountPercent: number;
  validUntil: string | Date;
  promoCodeEnabled: boolean;
  promoCode?: string;
}

export interface CreateOfferItem extends CartItemInput {
  selectedPriceTier?: PriceTier;
}

export interface CreateOfferPayload {
  sellerUserPublicId: string;
  mode: 'OFFERING';
  items: CreateOfferItem[];
  recipients: OfferRecipient[];
  privilegedConditions: PrivilegedConditions;
  note?: string;
  status?: 'DRAFT' | 'SENT';
}

export interface OfferItem {
  productPublicId: string;
  name: string;
  code: string;
  imageUrl: string;
  quantity: number;
  unitPrices: Record<PriceTier, number>;
  lineTotals: Record<PriceTier, number>;
  selectedPriceTier: PriceTier;
  selectedUnitPrice: number;
  selectedLineTotal: number;
  offerUnitPrice: number;
  offerLineTotal: number;
}

export interface Offer {
  _id?: string;
  publicId: string;
  sellerUserPublicId: string;
  mode: 'OFFERING';
  items: OfferItem[];
  recipients: OfferRecipient[];
  privilegedConditions: PrivilegedConditions;
  totals: {
    retailSubtotal: number;
    clubMemberSubtotal: number;
    clubPartnerSubtotal: number;
    offerSubtotal: number;
    currency: 'RSD' | 'EUR';
  };
  status: 'DRAFT' | 'SENT' | 'EXPIRED' | 'ACCEPTED' | 'CANCELLED';
  note?: string;
  createdAt: string;
}
