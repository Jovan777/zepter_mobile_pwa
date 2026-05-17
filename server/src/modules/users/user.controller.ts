import { Request, Response } from 'express';
import { User } from './user.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { HttpError } from '../../utils/httpError';

export const getDemoUser = asyncHandler(async (_req: Request, res: Response) => {
  const user = await User.findOne({ email: 'jovan.jovovic064@gmail.com' }).select('-passwordHash').lean();

  if (!user) {
    throw new HttpError(404, 'Demo user not found. Run npm run seed first.');
  }

  res.json({
    success: true,
    data: user
  });
});

export const getUserByPublicId = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ publicId: req.params.publicId }).select('-passwordHash').lean();

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  res.json({
    success: true,
    data: user
  });
});
