import { Router } from 'express';
import { createClient, getClients } from './client.controller';

const router = Router();

router.get('/', getClients);
router.post('/', createClient);

export default router;
