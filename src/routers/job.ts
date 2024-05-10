import express from 'express';
const router = express.Router();
import { authMiddleWare } from '../middleware/auth';

import {
  create,
  getOne,
  getAll,
  update,
  remove,
  applyTojob,
  listApplicants,
} from '../controllers/job';

router.route('/').post(authMiddleWare, create).get(getAll);
router.get('/list', listApplicants);
router
  .route('/:id')
  .get(getOne)
  .patch(authMiddleWare, update)
  .delete(authMiddleWare, remove);
router.post('/apply', authMiddleWare, applyTojob);

export default router;
