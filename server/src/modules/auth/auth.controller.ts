import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../users/user.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { HttpError } from '../../utils/httpError';
import { env } from '../../config/env';
import { createPublicId } from '../../utils/publicId';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerZepterClubSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6),
  country: z.string().trim().optional().default('Republika Srbija'),
  city: z.string().trim().optional().default(''),
  address: z.string().trim().optional().default(''),
  password: z.string().min(6).optional()
});

function signUserToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  } as jwt.SignOptions);
}

function toAuthUser(user: {
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  clubStatus: string;
}) {
  return {
    publicId: user.publicId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    clubStatus: user.clubStatus
  };
}

function createNumericCode(length: number): string {
  let value = '';

  for (let i = 0; i < length; i += 1) {
    value += Math.floor(Math.random() * 10).toString();
  }

  return value;
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
      user: toAuthUser(user)
    }
  });
});

export const registerZepterClub = asyncHandler(async (req: Request, res: Response) => {
  const body = registerZepterClubSchema.parse(req.body);
  const email = body.email.toLowerCase();
  const existingUser = await User.findOne({ email }).lean();

  if (existingUser) {
    throw new HttpError(409, 'Email adresa je već registrovana. Prijavite se postojećim nalogom.');
  }

  const password = body.password || createNumericCode(10);
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    publicId: createPublicId('USR'),
    email,
    passwordHash,
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone,
    customerCode: `CU${createNumericCode(6)}`,
    clubNumber: createNumericCode(12),
    recommenderCode: '',
    role: 'PARTNER',
    clubStatus: 'PARTNER',
    address: {
      street: body.address,
      city: body.city,
      country: body.country
    },
    marketingPlan: {
      currentRank: 'ZepterClub Partner',
      currentDiscountPercent: 12,
      nextRank: 'Gold Partner',
      requiredTurnoverForNextRank: 250000,
      currentTurnover: 0,
      invitedMembersCount: 0,
      clientsPurchasesCount: 0
    },
    marketingConsent: true,
    directMarketingConsent: true,
    isActive: true
  });

  const token = signUserToken(user._id.toString());

  res.status(201).json({
    success: true,
    data: {
      token,
      user: toAuthUser(user)
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
      user: toAuthUser(user)
    }
  });
});
