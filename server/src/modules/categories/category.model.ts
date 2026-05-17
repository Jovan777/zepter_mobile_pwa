import { Schema, model, InferSchemaType } from 'mongoose';

const CategorySchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    iconUrl: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export type CategoryDocument = InferSchemaType<typeof CategorySchema>;
export const Category = model('Category', CategorySchema);
