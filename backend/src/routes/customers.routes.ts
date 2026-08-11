import { Router } from 'express';
import {
  getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer
} from '../controllers/customers.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', requireRole(['Sales', 'Accounts']), createCustomer);
router.put('/:id', requireRole(['Sales', 'Accounts']), updateCustomer);
router.delete('/:id', requireRole(['Admin'] as any), deleteCustomer);

export default router;
