import { Router } from 'express';
import { getProductByPublicId, getProductBySlug, getProducts } from './product.controller';

const router = Router();

router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:publicId', getProductByPublicId);

export default router;
