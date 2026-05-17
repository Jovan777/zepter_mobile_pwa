import { Schema, model, InferSchemaType } from 'mongoose';

const OfferClientSchema = new Schema(
  {
    clientPublicId: { type: String, default: '' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' }
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
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
    privilegedDiscountLevel: { type: String, default: '' }
  },
  { _id: false }
);

const OfferSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    userPublicId: { type: String, required: true, index: true },
    items: [OfferItemSchema],
    clients: [OfferClientSchema],
    validUntil: { type: Date, required: true },
    promoCode: { type: String, default: '' },
    privilegedConditions: { type: String, default: '' },
    message: { type: String, default: '' },
    sendVia: [{ type: String, enum: ['EMAIL', 'PHONE'] }],
    totals: {
      selectedSubtotal: { type: Number, required: true },
      grandTotal: { type: Number, required: true },
      currency: { type: String, enum: ['RSD', 'EUR'], default: 'RSD' }
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SENT'],
      default: 'SENT'
    }
  },
  { timestamps: true }
);

export type OfferDocument = InferSchemaType<typeof OfferSchema>;
export const Offer = model('Offer', OfferSchema);
