import { Router } from 'express';
import { getZepterClubPlans } from './zepterClub.controller';

const router = Router();

router.get('/plans', getZepterClubPlans);

export default router;
