export type UserRole = 'CUSTOMER' | 'PARTNER' | 'ADMIN';
export type ClubStatus = 'NONE' | 'MEMBER' | 'PARTNER';

export interface UserAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface UserMarketingPlan {
  currentRank: string;
  currentDiscountPercent: number;
  nextRank: string;
  requiredTurnoverForNextRank: number;
  currentTurnover: number;
  invitedMembersCount: number;
  clientsPurchasesCount: number;
}

export interface User {
  _id?: string;
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  customerCode: string;
  clubNumber: string;
  recommenderCode: string;
  role: UserRole;
  clubStatus: ClubStatus;
  address: UserAddress;
  marketingPlan: UserMarketingPlan;
  marketingConsent: boolean;
  directMarketingConsent: boolean;
}
