import { Router } from 'express';
import { demoLogin, login, registerZepterClub } from './auth.controller';

const router = Router();

router.post('/login', login);
router.post('/demo-login', demoLogin);
router.post('/register-zepter-club', registerZepterClub);

export default router;
