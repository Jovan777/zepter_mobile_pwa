export type PriceTier = 'retail' | 'clubMember' | 'clubPartner';

export type OrderMode = 'BUYING' | 'SELLING';

export type PaymentMethod = 'CARD' | 'CASH_ON_DELIVERY' | 'PAYMENT_SLIP' | 'INSTALLMENTS';

export type PaymentStatus = 'NOT_PAID' | 'MOCK_SUCCESS' | 'CASH_ON_DELIVERY' | 'FAILED';

export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'MOCK_PAID' | 'CANCELLED';

export interface PersonDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderItem {
  productPublicId: string;
  name: string;
  code: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderTotals {
  retailSubtotal: number;
  clubMemberSubtotal: number;
  clubPartnerSubtotal: number;
  selectedSubtotal: number;
  deliveryFee: number;
  grandTotal: number;
  currency: 'RSD' | 'EUR';
  selectedPriceTier: PriceTier;
}

export interface Order {
  publicId: string;
  userPublicId: string;
  mode: OrderMode;
  items: OrderItem[];
  buyerDetails: PersonDetails;
  deliveryDetails?: PersonDetails;
  sameDeliveryAddress: boolean;
  isGift: boolean;
  clientWantsClubMembership: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  note: string;
  promoCode: string;
  totals: OrderTotals;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  userPublicId: string;
  mode: OrderMode;
  selectedPriceTier?: PriceTier;
  items: Array<{
    productPublicId: string;
    quantity: number;
  }>;
  buyerDetails: PersonDetails;
  deliveryDetails?: PersonDetails;
  sameDeliveryAddress: boolean;
  isGift: boolean;
  clientWantsClubMembership: boolean;
  paymentMethod: PaymentMethod;
  note: string;
  promoCode: string;
}