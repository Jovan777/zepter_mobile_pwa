import { Router } from 'express';
import { getDemoUser, getUserByPublicId } from './user.controller';

const router = Router();

router.get('/demo', getDemoUser);
router.get('/:publicId', getUserByPublicId);

export default router;
