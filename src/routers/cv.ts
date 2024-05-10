import express from 'express';
const router = express.Router();
import { create, remove, getAll, update } from '../controllers/cv';
import { authMiddleWare } from '../middleware/auth';

router.post('/create', authMiddleWare, create);
router
  .route('/:id')
  .delete(authMiddleWare, remove)
  .patch(authMiddleWare, update);
router.get('/', authMiddleWare, getAll);

export default router;
