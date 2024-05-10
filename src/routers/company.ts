import express from 'express';
const router = express.Router();
import { create, update, remove, getOne } from '../controllers/company';
import { authMiddleWare } from '../middleware/auth';

router.post('/create', authMiddleWare, create);
router
  .route('/:id')
  .patch(authMiddleWare, update)
  .delete(authMiddleWare, remove)
  .get(getOne);

export default router;
