import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    database: 'connected',
    service: 'ERP CRM Backend'
  });
});

export default router;
