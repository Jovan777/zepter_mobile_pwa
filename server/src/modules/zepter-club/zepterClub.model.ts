import { Schema, model, InferSchemaType } from 'mongoose';

const ZepterClubPlanSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    level: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    commissionFromPercent: { type: Number, default: 0 },
    commissionToPercent: { type: Number, default: 0 },
    requiredTurnover: { type: Number, default: 0 },
    benefits: [{ type: String }],
    description: { type: String, default: '' },
    isPartnerLevel: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type ZepterClubPlanDocument = InferSchemaType<typeof ZepterClubPlanSchema>;
export const ZepterClubPlan = model('ZepterClubPlan', ZepterClubPlanSchema);
