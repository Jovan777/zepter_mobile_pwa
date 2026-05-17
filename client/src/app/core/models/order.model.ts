import { CartItemInput, CartTotals, PriceTier } from './cart.model';
import { CommerceMode } from './commerce-mode.model';

export type PaymentMethod = 'CARD' | 'CASH_ON_DELIVERY' | 'PAYMENT_SLIP' | 'INSTALLMENTS';
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

export interface CreateOrderPayload {
  userPublicId: string;
  mode: Extract<CommerceMode, 'BUYING' | 'SELLING'>;
  selectedPriceTier?: PriceTier;
  items: CartItemInput[];
  buyerDetails: PersonDetails;
  deliveryDetails?: PersonDetails;
  sameDeliveryAddress: boolean;
  isGift: boolean;
  clientWantsClubMembership: boolean;
  paymentMethod: PaymentMethod;
  note?: string;
  promoCode?: string;
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

export interface Order {
  _id?: string;
  publicId: string;
  userPublicId: string;
  mode: Extract<CommerceMode, 'BUYING' | 'SELLING'>;
  items: OrderItem[];
  buyerDetails: PersonDetails;
  deliveryDetails?: PersonDetails;
  sameDeliveryAddress: boolean;
  isGift: boolean;
  clientWantsClubMembership: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  note?: string;
  promoCode?: string;
  totals: CartTotals;
  status: OrderStatus;
  createdAt: string;
}
