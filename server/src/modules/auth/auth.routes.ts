import { Router } from 'express';
import { demoLogin, login } from './auth.controller';

const router = Router();

router.post('/login', login);
router.post('/demo-login', demoLogin);

export default router;
