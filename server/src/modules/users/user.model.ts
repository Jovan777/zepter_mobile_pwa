import { Schema, model, InferSchemaType } from 'mongoose';

const AddressSchema = new Schema(
  {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'Republika Srbija' }
  },
  { _id: false }
);

const MarketingPlanSchema = new Schema(
  {
    currentRank: { type: String, default: 'ZepterClub Partner' },
    currentDiscountPercent: { type: Number, default: 12 },
    nextRank: { type: String, default: 'Gold Partner' },
    requiredTurnoverForNextRank: { type: Number, default: 250000 },
    currentTurnover: { type: Number, default: 132000 },
    invitedMembersCount: { type: Number, default: 8 },
    clientsPurchasesCount: { type: Number, default: 17 }
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: '' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, default: '' },
    customerCode: { type: String, default: '' },
    clubNumber: { type: String, default: '' },
    recommenderCode: { type: String, default: '' },
    role: { type: String, enum: ['CUSTOMER', 'PARTNER', 'ADMIN'], default: 'PARTNER' },
    clubStatus: { type: String, enum: ['NONE', 'MEMBER', 'PARTNER'], default: 'PARTNER' },
    address: { type: AddressSchema, default: () => ({}) },
    marketingPlan: { type: MarketingPlanSchema, default: () => ({}) },
    marketingConsent: { type: Boolean, default: true },
    directMarketingConsent: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema>;
export const User = model('User', UserSchema);
