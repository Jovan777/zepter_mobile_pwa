import { Schema, model, InferSchemaType } from 'mongoose';

const PersonDetailsSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'Republika Srbija' }
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    productPublicId: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true }
  },
  { _id: false }
);

const TotalsSchema = new Schema(
  {
    retailSubtotal: { type: Number, required: true },
    clubMemberSubtotal: { type: Number, required: true },
    clubPartnerSubtotal: { type: Number, required: true },
    selectedSubtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    currency: { type: String, enum: ['RSD', 'EUR'], default: 'RSD' },
    selectedPriceTier: { type: String, enum: ['retail', 'clubMember', 'clubPartner'], required: true }
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    userPublicId: { type: String, required: true, index: true },
    mode: { type: String, enum: ['BUYING', 'SELLING'], required: true },
    items: [OrderItemSchema],
    buyerDetails: { type: PersonDetailsSchema, required: true },
    deliveryDetails: { type: PersonDetailsSchema },
    sameDeliveryAddress: { type: Boolean, default: true },
    isGift: { type: Boolean, default: false },
    clientWantsClubMembership: { type: Boolean, default: false },
    paymentMethod: {
      type: String,
      enum: ['CARD', 'CASH_ON_DELIVERY', 'PAYMENT_SLIP', 'INSTALLMENTS'],
      default: 'CARD'
    },
    paymentStatus: {
      type: String,
      enum: ['NOT_PAID', 'MOCK_SUCCESS', 'CASH_ON_DELIVERY', 'FAILED'],
      default: 'NOT_PAID'
    },
    note: { type: String, default: '' },
    promoCode: { type: String, default: '' },
    totals: { type: TotalsSchema, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'CONFIRMED', 'MOCK_PAID', 'CANCELLED'],
      default: 'CONFIRMED'
    }
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof OrderSchema>;
export const Order = model('Order', OrderSchema);
