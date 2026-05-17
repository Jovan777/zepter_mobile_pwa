import { Router } from 'express';
import { calculateCartController } from './cart.controller';

const router = Router();

router.post('/calculate', calculateCartController);

export default router;
