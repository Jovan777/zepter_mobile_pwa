import { Schema, model, InferSchemaType } from 'mongoose';

const WishlistSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    userPublicId: { type: String, required: true, index: true },
    productPublicId: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

WishlistSchema.index({ userPublicId: 1, productPublicId: 1 }, { unique: true });

export type WishlistDocument = InferSchemaType<typeof WishlistSchema>;
export const Wishlist = model('Wishlist', WishlistSchema);
