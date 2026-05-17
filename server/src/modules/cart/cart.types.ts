export type CommerceMode = 'BUYING' | 'SELLING' | 'OFFERING';
export type PriceTier = 'retail' | 'clubMember' | 'clubPartner';

export interface CartInputItem {
  productPublicId: string;
  quantity: number;
}

export interface CalculatedCartItem {
  productPublicId: string;
  name: string;
  code: string;
  categoryName: string;
  imageUrl: string;
  quantity: number;
  unitPrices: {
    retail: number;
    clubMember: number;
    clubPartner: number;
  };
  lineTotals: {
    retail: number;
    clubMember: number;
    clubPartner: number;
    selected: number;
  };
}

export interface CartTotals {
  retailSubtotal: number;
  clubMemberSubtotal: number;
  clubPartnerSubtotal: number;
  selectedSubtotal: number;
  deliveryFee: number;
  grandTotal: number;
  currency: 'RSD' | 'EUR';
  selectedPriceTier: PriceTier;
}
