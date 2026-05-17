import { Request, Response } from 'express';
import { z } from 'zod';
import { Offer } from './offer.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { calculateCart } from '../cart/cart.service';
import { createPublicId } from '../../utils/publicId';
import { HttpError } from '../../utils/httpError';

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

const priceTierSchema = z.enum(['retail', 'clubMember', 'clubPartner']);

const offerRecipientSchema = z.object({
  clientPublicId: z.string().optional().default(''),
  source: z.enum(['CLIENT', 'MANUAL']).optional().default('MANUAL'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  country: z.string().optional().default('Republika Srbija')
});

const privilegedConditionsSchema = z.object({
  enabled: z.boolean().default(false),
  discountPercent: z.number().min(0).max(90).default(0),
  validUntil: z.coerce.date(),
  promoCodeEnabled: z.boolean().default(false),
  promoCode: z.string().optional().default('')
});

const offerBodySchema = z.object({
  sellerUserPublicId: z.string().min(1),
  mode: z.literal('OFFERING').default('OFFERING'),
  items: z.array(
    z.object({
      productPublicId: z.string().min(1),
      quantity: z.number().int().min(1).default(1),
      selectedPriceTier: priceTierSchema.optional().default('clubMember')
    })
  ).min(1),
  recipients: z.array(offerRecipientSchema).min(1),
  privilegedConditions: privilegedConditionsSchema,
  note: z.string().optional().default(''),
  status: z.enum(['DRAFT', 'SENT']).optional().default('SENT')
});

export const createOffer = asyncHandler(async (req: Request, res: Response) => {
  const body = offerBodySchema.parse(req.body);
  const calculated = await calculateCart('OFFERING', body.items);
  const discountMultiplier =
    body.privilegedConditions.enabled && body.privilegedConditions.discountPercent > 0
      ? (100 - body.privilegedConditions.discountPercent) / 100
      : 1;

  const offerItems = calculated.items.map((item) => ({
    productPublicId: item.productPublicId,
    name: item.name,
    code: item.code,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    unitPrices: item.unitPrices,
    lineTotals: {
      retail: item.lineTotals.retail,
      clubMember: item.lineTotals.clubMember,
      clubPartner: item.lineTotals.clubPartner
    },
    selectedPriceTier: item.selectedPriceTier,
    selectedUnitPrice: item.selectedUnitPrice,
    selectedLineTotal: item.selectedLineTotal,
    offerUnitPrice: money(item.selectedUnitPrice * discountMultiplier),
    offerLineTotal: money(item.selectedLineTotal * discountMultiplier)
  }));

  const offerSubtotal = money(offerItems.reduce((sum, item) => sum + item.offerLineTotal, 0));

  const offer = await Offer.create({
    publicId: createPublicId('OFF'),
    sellerUserPublicId: body.sellerUserPublicId,
    mode: 'OFFERING',
    items: offerItems,
    recipients: body.recipients,
    privilegedConditions: body.privilegedConditions,
    totals: {
      retailSubtotal: calculated.totals.retailSubtotal,
      clubMemberSubtotal: calculated.totals.clubMemberSubtotal,
      clubPartnerSubtotal: calculated.totals.clubPartnerSubtotal,
      offerSubtotal,
      currency: calculated.totals.currency
    },
    status: body.status,
    note: body.note
  });

  res.status(201).json({
    success: true,
    data: offer
  });
});

export const getOffers = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};
  const sellerUserPublicId = req.query.sellerUserPublicId || req.query.userPublicId;

  if (sellerUserPublicId) {
    filter.sellerUserPublicId = String(sellerUserPublicId);
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
