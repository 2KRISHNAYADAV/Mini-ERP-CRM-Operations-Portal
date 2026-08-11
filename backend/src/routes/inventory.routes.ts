import { Router } from 'express';
import { getStockMovements, adjustStock } from '../controllers/inventory.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/movements', getStockMovements);
router.post('/adjust', requireRole(['Warehouse']), adjustStock);

export default router;
