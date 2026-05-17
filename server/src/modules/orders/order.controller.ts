import { Request, Response } from 'express';
import { z } from 'zod';
import { Order } from './order.model';
import { asyncHandler } from '../../utils/asyncHandler';
import { calculateCart } from '../cart/cart.service';
import { createPublicId } from '../../utils/publicId';
import { HttpError } from '../../utils/httpError';

const personSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  postalCode: z.string().optional().default(''),
  country: z.string().optional().default('Republika Srbija')
});

const orderBodySchema = z.object({
  userPublicId: z.string().min(1),
  mode: z.enum(['BUYING', 'SELLING']),
  selectedPriceTier: z.enum(['retail', 'clubMember', 'clubPartner']).optional(),
  items: z.array(
    z.object({
      productPublicId: z.string().min(1),
      quantity: z.number().int().min(1).default(1)
    })
  ).min(1),
  buyerDetails: personSchema,
  deliveryDetails: personSchema.optional(),
  sameDeliveryAddress: z.boolean().default(true),
  isGift: z.boolean().default(false),
  clientWantsClubMembership: z.boolean().default(false),
  paymentMethod: z.enum(['CARD', 'CASH_ON_DELIVERY', 'PAYMENT_SLIP', 'INSTALLMENTS']).default('CARD'),
  note: z.string().optional().default(''),
  promoCode: z.string().optional().default('')
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const body = orderBodySchema.parse(req.body);
  const calculated = await calculateCart(body.mode, body.items, body.selectedPriceTier);

  const orderItems = calculated.items.map((item) => {
    const selectedPrice =
      calculated.totals.selectedPriceTier === 'retail'
        ? item.unitPrices.retail
        : calculated.totals.selectedPriceTier === 'clubMember'
          ? item.unitPrices.clubMember
          : item.unitPrices.clubPartner;

    return {
      productPublicId: item.productPublicId,
      name: item.name,
      code: item.code,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      unitPrice: selectedPrice,
      lineTotal: item.lineTotals.selected
    };
  });

  const paymentStatus =
    body.paymentMethod === 'CASH_ON_DELIVERY'
      ? 'CASH_ON_DELIVERY'
      : body.paymentMethod === 'CARD'
        ? 'MOCK_SUCCESS'
        : 'NOT_PAID';

  const order = await Order.create({
    publicId: createPublicId('ORD'),
    userPublicId: body.userPublicId,
    mode: body.mode,
    items: orderItems,
    buyerDetails: body.buyerDetails,
    deliveryDetails: body.deliveryDetails,
    sameDeliveryAddress: body.sameDeliveryAddress,
    isGift: body.isGift,
    clientWantsClubMembership: body.clientWantsClubMembership,
    paymentMethod: body.paymentMethod,
    paymentStatus,
    note: body.note,
    promoCode: body.promoCode,
    totals: calculated.totals,
    status: paymentStatus === 'MOCK_SUCCESS' ? 'MOCK_PAID' : 'CONFIRMED'
  });

  res.status(201).json({
    success: true,
    data: order
  });
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const filter: Record<string, unknown> = {};

  if (req.query.userPublicId) {
    filter.userPublicId = String(req.query.userPublicId);
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

  res.json({
    success: true,
    data: orders
  });
});

export const getOrderByPublicId = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ publicId: req.params.publicId }).lean();

  if (!order) {
    throw new HttpError(404, 'Order not found');
  }

  res.json({
    success: true,
    data: order
  });
});
