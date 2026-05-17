import { Router } from 'express';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
} from './wishlist.controller';

const router = Router();

router.get('/:userPublicId', getWishlist);
router.post('/', addToWishlist);
router.post('/toggle', toggleWishlist);
router.delete('/:userPublicId/:productPublicId', removeFromWishlist);

export default router;
