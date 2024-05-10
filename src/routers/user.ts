import express from 'express';
const router = express.Router();
import { authMiddleWare } from '../middleware/auth';

import { signUp, signIn, update } from '../controllers/user';

router.post('/signup', signUp);
router.post('/signin', signIn);
router.patch('/update', authMiddleWare, update);

export default router;
