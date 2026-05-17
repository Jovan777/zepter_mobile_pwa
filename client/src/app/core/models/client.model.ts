export type ClientClubStatus = 'NONE' | 'INVITED' | 'MEMBER';

export interface Client {
  _id?: string;
  publicId: string;
  ownerUserPublicId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  clubStatus: ClientClubStatus;
  purchasesCount: number;
  totalTurnover: number;
  lastPurchaseAt?: string;
  notes?: string;
}
