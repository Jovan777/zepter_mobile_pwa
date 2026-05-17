import { Request, Response } from 'express';
import { z } from 'zod';
import { Offer } from './offer.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { calculateCart } from '../cart/cart.service';
import { createPublicId } from '../../utils/publicId';
import { HttpError } from '../../utils/httpError';

const offerClientSchema = z.object({
  clientPublicId: z.string().optional().default(''),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().default('')
});

const offerBodySchema = z.object({
  userPublicId: z.string().min(1),
  items: z.array(
    z.object({
      productPublicId: z.string().min(1),
      quantity: z.number().int().min(1).default(1),
      privilegedDiscountLevel: z.string().optional().default('')
    })
  ).min(1),
  clients: z.array(offerClientSchema).min(1),
  validUntil: z.coerce.date(),
  promoCode: z.string().optional().default(''),
  privilegedConditions: z.string().optional().default(''),
  message: z.string().optional().default(''),
  sendVia: z.array(z.enum(['EMAIL', 'PHONE'])).min(1).default(['EMAIL'])
});

export const createOffer = asyncHandler(async (req: Request, res: Response) => {
  const body = offerBodySchema.parse(req.body);
  const calculated = await calculateCart('OFFERING', body.items, 'clubMember');

  const offerItems = calculated.items.map((item) => {
    const requestedItem = body.items.find((input) => input.productPublicId === item.productPublicId);

    return {
      productPublicId: item.productPublicId,
      name: item.name,
      code: item.code,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      unitPrice: item.unitPrices.clubMember,
      lineTotal: item.lineTotals.clubMember,
      privilegedDiscountLevel: requestedItem?.privilegedDiscountLevel || ''
    };
  });

  const offer = await Offer.create({
    publicId: createPublicId('OFF'),
    userPublicId: body.userPublicId,
    items: offerItems,
    clients: body.clients,
    validUntil: body.validUntil,
    promoCode: body.promoCode,
    privilegedConditions: body.privilegedConditions,
    message: body.message,
    sendVia: body.sendVia,
    totals: {
      selectedSubtotal: calculated.totals.clubMemberSubtotal,
      grandTotal: calculated.totals.clubMemberSubtotal,
      currency: 'RSD'
    },
    status: 'SENT'
  });

  res.status(201).json({
    success: true,
    data: offer
  });
});

export const getOffers = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};

  if (req.query.userPublicId) {
    filter.userPublicId = String(req.query.userPublicId);
  }

  const offers = await Offer.find(filter).sort({ createdAt: -1 }).lean();

  res.json({
    success: true,
    data: offers
  });
});

export const getOfferByPublicId = asyncHandler(async (req: Request, res: Response) => {
  const offer = await Offer.findOne({ publicId: req.params.publicId }).lean();

  if (!offer) {
    throw new HttpError(404, 'Offer not found');
  }

  res.json({
    success: true,
    data: offer
  });
});
