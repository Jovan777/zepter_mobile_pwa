import { Request, Response } from 'express';
import { Category } from './category.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { HttpError } from '../../utils/httpError';

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();

  res.json({
    success: true,
    data: categories
  });
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true }).lean();

  if (!category) {
    throw new HttpError(404, 'Category not found');
  }

  res.json({
    success: true,
    data: category
  });
});
