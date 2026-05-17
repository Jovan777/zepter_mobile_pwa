import { Schema, model, InferSchemaType } from 'mongoose';

const MoneyPriceSchema = new Schema(
  {
    retail: { type: Number, required: true, min: 0 },
    clubMember: { type: Number, required: true, min: 0 },
    clubPartner: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const DiscountSchema = new Schema(
  {
    clubMemberPercent: { type: Number, default: 0 },
    clubPartnerPercent: { type: Number, default: 0 }
  },
  { _id: false }
);

const TechnicalDetailSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, index: true },
    categorySlug: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },
    campaignLabel: { type: String, default: '' },
    images: [{ type: String, required: true }],
    badges: [{ type: String }],
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    presentation: { type: String, default: '' },
    historyDetails: { type: String, default: '' },
    technicalDetails: [TechnicalDetailSchema],
    prices: { type: MoneyPriceSchema, required: true },
    discounts: { type: DiscountSchema, required: true },
    currency: { type: String, enum: ['RSD', 'EUR'], default: 'RSD' },
    stockStatus: { type: String, enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'], default: 'IN_STOCK' },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isOutlet: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', shortDescription: 'text', code: 'text', categoryName: 'text' });

export type ProductDocument = InferSchemaType<typeof ProductSchema>;
export const Product = model('Product', ProductSchema);
