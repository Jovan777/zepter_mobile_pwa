import { Request, Response } from 'express';
import { ZepterClubPlan } from './zepterClub.model';
import { asyncHandler } from '../../utils/asyncHandler';

export const getZepterClubPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await ZepterClubPlan.find({ isActive: true }).sort({ level: 1 }).lean();

  res.json({
    success: true,
    data: plans
  });
});
