export interface ZepterClubPlan {
  _id?: string;
  code: string;
  name: string;
  level: number;
  discountPercent: number;
  commissionFromPercent: number;
  commissionToPercent: number;
  requiredTurnover: number;
  benefits: string[];
  description: string;
  isPartnerLevel: boolean;
  isActive: boolean;
}
