import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import customersRoutes from './customers.routes';
import productsRoutes from './products.routes';
import inventoryRoutes from './inventory.routes';
import challansRoutes from './challans.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/customers', customersRoutes);
router.use('/products', productsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/challans', challansRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
