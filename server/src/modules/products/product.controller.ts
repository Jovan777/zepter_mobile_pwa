import { Request, Response } from 'express';
import { z } from 'zod';
import { Product } from './product.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { HttpError } from '../../utils/httpError';

const productQuerySchema = z.object({
  categorySlug: z.string().optional(),
  q: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  newOnly: z.coerce.boolean().optional(),
  outlet: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  page: z.coerce.number().int().min(1).default(1)
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = productQuerySchema.parse(req.query);

  const filter: Record<string, unknown> = { isActive: true };

  if (query.categorySlug) filter.categorySlug = query.categorySlug;
  if (query.featured !== undefined) filter.isFeatured = query.featured;
  if (query.newOnly !== undefined) filter.isNew = query.newOnly;
  if (query.outlet !== undefined) filter.isOutlet = query.outlet;

  if (query.q) {
    filter.$text = { $search: query.q };
  }

  const skip = (query.page - 1) * query.limit;

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(query.limit).lean(),
    Product.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: products,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  });
});

export const getProductByPublicId = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({
    publicId: req.params.publicId,
    isActive: true
  }).lean();

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  res.json({
    success: true,
    data: product
  });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true
  }).lean();

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  res.json({
    success: true,
    data: product
  });
});
