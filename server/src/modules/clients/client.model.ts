import { Schema, model, InferSchemaType } from 'mongoose';

const ClientSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    ownerUserPublicId: { type: String, required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: 'Republika Srbija' },
    clubStatus: { type: String, enum: ['NONE', 'INVITED', 'MEMBER'], default: 'NONE' },
    purchasesCount: { type: Number, default: 0 },
    totalTurnover: { type: Number, default: 0 },
    lastPurchaseAt: { type: Date },
    notes: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type ClientDocument = InferSchemaType<typeof ClientSchema>;
export const Client = model('Client', ClientSchema);
