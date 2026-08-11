import { Router } from 'express';
import {
  getChallans, getChallanById, createChallan, cancelChallan, confirmChallan
} from '../controllers/challans.controller';
import { downloadChallanPdf } from '../controllers/pdf.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getChallans);
router.get('/:id/pdf', downloadChallanPdf);   // must be before /:id
router.get('/:id', getChallanById);
router.post('/', requireRole(['Sales']), createChallan);
router.patch('/:id/cancel', requireRole(['Sales']), cancelChallan);
router.patch('/:id/confirm', requireRole(['Sales']), confirmChallan);

export default router;
