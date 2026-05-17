import { Schema, model, InferSchemaType } from 'mongoose';

const RegionSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    countryName: { type: String, required: true },
    currency: { type: String, default: 'RSD' },
    locale: { type: String, default: 'sr-RS' },
    languageCodes: [{ type: String }],
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export type RegionDocument = InferSchemaType<typeof RegionSchema>;
export const Region = model('Region', RegionSchema);
