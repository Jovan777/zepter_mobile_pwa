import { Schema, model, InferSchemaType } from 'mongoose';

const OfferRecipientSchema = new Schema(
  {
    clientPublicId: { type: String, default: '' },
    source: { type: String, enum: ['CLIENT', 'MANUAL'], default: 'MANUAL' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: 'Republika Srbija' }
  },
  { _id: false }
);

const OfferItemSchema = new Schema(
  {
    productPublicId: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    quantity: { type: Number, required: true },
    unitPrices: {
      retail: { type: Number, required: true },
      clubMember: { type: Number, required: true },
      clubPartner: { type: Number, required: true }
    },
    lineTotals: {
      retail: { type: Number, required: true },
      clubMember: { type: Number, required: true },
      clubPartner: { type: Number, required: true }
    },
    selectedPriceTier: {
      type: String,
      enum: ['retail', 'clubMember', 'clubPartner'],
      default: 'clubMember'
    },
    selectedUnitPrice: { type: Number, required: true },
    selectedLineTotal: { type: Number, required: true },
    offerUnitPrice: { type: Number, required: true },
    offerLineTotal: { type: Number, required: true }
  },
  { _id: false }
);

const PrivilegedConditionsSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0 },
    validUntil: { type: Date, required: true },
    promoCodeEnabled: { type: Boolean, default: false },
    promoCode: { type: String, default: '' }
  },
  { _id: false }
);

const OfferTotalsSchema = new Schema(
  {
    retailSubtotal: { type: Number, required: true },
    clubMemberSubtotal: { type: Number, required: true },
    clubPartnerSubtotal: { type: Number, required: true },
    offerSubtotal: { type: Number, required: true },
    currency: { type: String, enum: ['RSD', 'EUR'], default: 'RSD' }
  },
  { _id: false }
);

const OfferSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    sellerUserPublicId: { type: String, required: true, index: true },
    mode: { type: String, enum: ['OFFERING'], default: 'OFFERING' },
    items: [OfferItemSchema],
    recipients: [OfferRecipientSchema],
    privilegedConditions: { type: PrivilegedConditionsSchema, required: true },
    totals: { type: OfferTotalsSchema, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'SENT', 'EXPIRED', 'ACCEPTED', 'CANCELLED'],
      default: 'SENT'
    },
    note: { type: String, default: '' }
  },
  { timestamps: true }
);

export type OfferDocument = InferSchemaType<typeof OfferSchema>;
export const Offer = model('Offer', OfferSchema);
