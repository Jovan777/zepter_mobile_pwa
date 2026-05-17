import { Request, Response } from 'express';
import { z } from 'zod';
import { Client } from './client.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { createPublicId } from '../../utils/publicId';

const createClientSchema = z.object({
  ownerUserPublicId: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  city: z.string().optional().default(''),
  country: z.string().optional().default('Republika Srbija'),
  clubStatus: z.enum(['NONE', 'INVITED', 'MEMBER']).optional().default('NONE'),
  notes: z.string().optional().default('')
});

export const getClients = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = { isActive: true };

  if (req.query.ownerUserPublicId) {
    filter.ownerUserPublicId = String(req.query.ownerUserPublicId);
  }

  const clients = await Client.find(filter).sort({ createdAt: -1 }).lean();

  res.json({
    success: true,
    data: clients
  });
});

export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const body = createClientSchema.parse(req.body);

  const client = await Client.create({
    publicId: createPublicId('CL'),
    ...body
  });

  res.status(201).json({
    success: true,
    data: client
  });
});
