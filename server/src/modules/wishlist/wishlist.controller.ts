import { Request, Response } from 'express';
import { z } from 'zod';
import { Product } from '../products/product.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { HttpError } from '../../utils/httpError';
import { createPublicId } from '../../utils/publicId';
import { Wishlist } from './wishlist.model';

const paramsSchema = z.object({
  userPublicId: z.string().min(1)
});

const removeParamsSchema = z.object({
  userPublicId: z.string().min(1),
  productPublicId: z.string().min(1)
});

const wishlistBodySchema = z.object({
  userPublicId: z.string().min(1),
  productPublicId: z.string().min(1)
});

const toWishlistProduct = (product: {
  publicId: string;
  name: string;
  code: string;
  categoryName: string;
  images?: string[];
  prices: {
    retail: number;
    clubMember: number;
    clubPartner: number;
  };
  discounts: {
    clubMemberPercent: number;
    clubPartnerPercent: number;
  };
}) => ({
  productPublicId: product.publicId,
  name: product.name,
  code: product.code,
  categoryName: product.categoryName,
  imageUrl: product.images?.[0] || '',
  prices: product.prices,
  discounts: product.discounts
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const params = paramsSchema.parse(req.params);

  const items = await Wishlist.find({ userPublicId: params.userPublicId })
    .sort({ createdAt: -1 })
    .lean();

  const productPublicIds = items.map((item) => item.productPublicId);

  if (productPublicIds.length === 0) {
    res.json({
      success: true,
      data: []
    });
    return;
  }

  const products = await Product.find({
    publicId: { $in: productPublicIds },
    isActive: true
  }).lean();

  const productByPublicId = new Map(products.map((product) => [product.publicId, product]));
  const wishlistProducts = productPublicIds
    .map((productPublicId) => productByPublicId.get(productPublicId))
    .filter((product): product is NonNullable<typeof product> => !!product)
    .map(toWishlistProduct);

  res.json({
    success: true,
    data: wishlistProducts
  });
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const body = wishlistBodySchema.parse(req.body);

  const product = await Product.findOne({
    publicId: body.productPublicId,
    isActive: true
  }).lean();

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  const item = await Wishlist.findOneAndUpdate(
    {
      userPublicId: body.userPublicId,
      productPublicId: body.productPublicId
    },
    {
      $setOnInsert: {
        publicId: createPublicId('WIS'),
        userPublicId: body.userPublicId,
        productPublicId: body.productPublicId
      }
    },
    {
      new: true,
      upsert: true
    }
  ).lean();

  res.status(201).json({
    success: true,
    data: item
  });
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const params = removeParamsSchema.parse(req.params);

  await Wishlist.deleteOne({
    userPublicId: params.userPublicId,
    productPublicId: params.productPublicId
  });

  res.json({
    success: true,
    data: {
      removed: true
    }
  });
});

export const toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
  const body = wishlistBodySchema.parse(req.body);

  const existing = await Wishlist.findOne({
    userPublicId: body.userPublicId,
    productPublicId: body.productPublicId
  });

  if (existing) {
    await existing.deleteOne();

    res.json({
      success: true,
      data: {
        wishlisted: false
      }
    });
    return;
  }

  const product = await Product.findOne({
    publicId: body.productPublicId,
    isActive: true
  }).lean();

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  await Wishlist.create({
    publicId: createPublicId('WIS'),
    userPublicId: body.userPublicId,
    productPublicId: body.productPublicId
  });

  res.status(201).json({
    success: true,
    data: {
      wishlisted: true
    }
  });
});
