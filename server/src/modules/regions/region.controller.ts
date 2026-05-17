import { Request, Response } from 'express';
import { Region } from './region.model';
import { asyncHandler } from '../../utils/asyncHandler';

export const getRegions = asyncHandler(async (_req: Request, res: Response) => {
  const regions = await Region.find({ isActive: true }).sort({ isDefault: -1, name: 1 }).lean();

  res.json({
    success: true,
    data: regions
  });
});
