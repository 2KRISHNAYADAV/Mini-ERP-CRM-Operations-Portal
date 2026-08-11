import { Router } from 'express';
import {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct
} from '../controllers/products.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', requireRole(['Warehouse', 'Sales']), createProduct);
router.put('/:id', requireRole(['Warehouse']), updateProduct);
router.delete('/:id', requireRole(['Admin'] as any), deleteProduct);

export default router;
