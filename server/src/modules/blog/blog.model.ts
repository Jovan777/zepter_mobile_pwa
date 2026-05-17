import { Schema, model, InferSchemaType } from 'mongoose';

const BlogContentBlockSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['paragraph', 'heading', 'quote', 'list'],
      required: true
    },
    text: { type: String, default: '' },
    items: [{ type: String }]
  },
  { _id: false }
);

const BlogPostSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    excerpt: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true, index: true },
    monthLabel: { type: String, required: true },
    imageUrl: { type: String, required: true },
    content: [BlogContentBlockSchema],
    relatedProductPublicIds: [{ type: String }],
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    publishedAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

BlogPostSchema.index({ title: 'text', subtitle: 'text', excerpt: 'text', category: 'text' });

export type BlogPostDocument = InferSchemaType<typeof BlogPostSchema>;
export const BlogPost = model('BlogPost', BlogPostSchema);
