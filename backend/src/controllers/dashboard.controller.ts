import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      customersRes,
      productsRes,
      confirmedChallansRes,
      draftChallansRes,
      lowStockRes,
      recentChallansRes,
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM customers WHERE status = $1', ['Active']),
      query('SELECT COUNT(*) FROM products'),
      query("SELECT COUNT(*) FROM challans WHERE status = 'Confirmed'"),
      query("SELECT COUNT(*) FROM challans WHERE status = 'Draft'"),
      query(
        'SELECT * FROM products WHERE current_stock <= min_stock_alert ORDER BY current_stock ASC LIMIT 10'
      ),
      query(`
        SELECT c.*, cust.customer_name
        FROM challans c
        JOIN customers cust ON c.customer_id = cust.id
        ORDER BY c.created_at DESC LIMIT 5
      `),
    ]);

    res.json({
      totalCustomers: parseInt(customersRes.rows[0].count),
      totalProducts: parseInt(productsRes.rows[0].count),
      totalConfirmedChallans: parseInt(confirmedChallansRes.rows[0].count),
      totalDraftChallans: parseInt(draftChallansRes.rows[0].count),
      lowStockProducts: lowStockRes.rows,
      recentChallans: recentChallansRes.rows,
    });
  } catch (err: any) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
