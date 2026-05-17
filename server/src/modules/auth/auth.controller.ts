import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../users/user.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { HttpError } from '../../utils/httpError';
import { env } from '../../config/env';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function signUserToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  } as jwt.SignOptions);
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const user = await User.findOne({ email: body.email.toLowerCase(), isActive: true });

  if (!user || !user.passwordHash) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const isValid = await bcrypt.compare(body.password, user.passwordHash);

  if (!isValid) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const token = signUserToken(user._id.toString());

  res.json({
    success: true,
    data: {
      token,
      user: {
        publicId: user.publicId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        clubStatus: user.clubStatus
      }
    }
  });
});

export const demoLogin = asyncHandler(async (_req: Request, res: Response) => {
  const user = await User.findOne({ email: 'jovan.jovovic064@gmail.com', isActive: true });

  if (!user) {
    throw new HttpError(404, 'Demo user not found. Run npm run seed first.');
  }

  const token = signUserToken(user._id.toString());

  res.json({
    success: true,
    data: {
      token,
      user: {
        publicId: user.publicId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        clubStatus: user.clubStatus
      }
    }
  });
});
