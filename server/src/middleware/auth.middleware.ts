import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../modules/users/user.model';
import { HttpError } from '../utils/httpError';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    publicId: string;
    email: string;
    role: string;
  };
}

export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const user = await User.findById(payload.sub).lean();

    if (user) {
      req.user = {
        id: user._id.toString(),
        publicId: user.publicId,
        email: user.email,
        role: user.role
      };
    }

    next();
  } catch {
    next();
  }
}

export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
  await optionalAuth(req, _res, () => undefined);

  if (!req.user) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }

  next();
}
