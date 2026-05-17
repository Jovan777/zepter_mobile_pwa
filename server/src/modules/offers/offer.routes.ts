import { Router } from 'express';
import { createOffer, getOfferByPublicId, getOffers } from './offer.controller';

const router = Router();

router.get('/', getOffers);
router.get('/:publicId', getOfferByPublicId);
router.post('/', createOffer);

export default router;
