import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { calculateCart } from './cart.service';

const cartSchema = z.object({
  mode: z.enum(['BUYING', 'SELLING', 'OFFERING']).default('BUYING'),
  selectedPriceTier: z.enum(['retail', 'clubMember', 'clubPartner']).optional(),
  items: z.array(
    z.object({
      productPublicId: z.string().min(1),
      quantity: z.number().int().min(1).default(1)
    })
  ).min(1)
});

export const calculateCartController = asyncHandler(async (req: Request, res: Response) => {
  const body = cartSchema.parse(req.body);
  const calculated = await calculateCart(body.mode, body.items, body.selectedPriceTier);

  res.json({
    success: true,
    data: calculated
  });
});
