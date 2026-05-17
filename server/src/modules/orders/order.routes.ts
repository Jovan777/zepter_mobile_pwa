import { Router } from 'express';
import { createOrder, getOrderByPublicId, getOrders } from './order.controller';

const router = Router();

router.get('/', getOrders);
router.get('/:publicId', getOrderByPublicId);
router.post('/', createOrder);

export default router;
