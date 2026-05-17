import { Request, Response } from 'express';
import { z } from 'zod';
import { Product } from '../products/product.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { HttpError } from '../../utils/httpError';
import { BlogPost } from './blog.model';

const blogQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  q: z.string().optional()
});

const slugParamsSchema = z.object({
  slug: z.string().min(1)
});

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getBlogPosts = asyncHandler(async (req: Request, res: Response) => {
  const query = blogQuerySchema.parse(req.query);
  const filter: Record<string, unknown> = { isPublished: true };

  if (query.category) {
    filter.category = query.category;
  }

  if (query.featured !== undefined) {
    filter.isFeatured = query.featured;
  }

  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [
      { title: regex },
      { subtitle: regex },
      { excerpt: regex },
      { category: regex },
      { author: regex },
      { 'content.text': regex },
      { 'content.items': regex }
    ];
  }

  const posts = await BlogPost.find(filter).sort({ publishedAt: -1 }).lean();

  res.json({
    success: true,
    data: posts
  });
});

export const getFeaturedBlogPosts = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await BlogPost.find({ isPublished: true, isFeatured: true })
    .sort({ publishedAt: -1 })
    .lean();

  res.json({
    success: true,
    data: posts
  });
});

export const getBlogPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const params = slugParamsSchema.parse(req.params);
  const post = await BlogPost.findOne({
    slug: params.slug,
    isPublished: true
  }).lean();

  if (!post) {
    throw new HttpError(404, 'Blog post not found');
  }

  const relatedProducts = await Product.find({
    publicId: { $in: post.relatedProductPublicIds },
    isActive: true
  }).lean();

  const productByPublicId = new Map(
    relatedProducts.map((product) => [product.publicId, product])
  );

  res.json({
    success: true,
    data: {
      post,
      relatedProducts: post.relatedProductPublicIds
        .map((publicId) => productByPublicId.get(publicId))
        .filter((product): product is NonNullable<typeof product> => !!product)
    }
  });
});
