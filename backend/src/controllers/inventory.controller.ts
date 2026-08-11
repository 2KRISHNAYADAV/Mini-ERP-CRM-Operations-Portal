import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getStockMovements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = req.query.product_id;
    let sql = `
      SELECT sm.*, p.product_name, u.name as created_by_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.created_by = u.id
    `;
    const params: any[] = [];
    if (productId) {
      sql += ' WHERE sm.product_id = $1';
      params.push(productId);
    }
    sql += ' ORDER BY sm.created_at DESC LIMIT 200';
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
};

export const adjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product_id, quantity, movement_type, reason } = req.body;

    if (!['IN', 'OUT'].includes(movement_type)) {
      res.status(400).json({ error: 'movement_type must be IN or OUT' });
      return;
    }
    if (quantity <= 0) {
      res.status(400).json({ error: 'Quantity must be positive' });
      return;
    }

    // Get current stock
    const { rows: productRows } = await query(
      'SELECT * FROM products WHERE id = $1',
      [product_id]
    );
    if (productRows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = productRows[0];
    if (movement_type === 'OUT' && product.current_stock < quantity) {
      res.status(400).json({
        error: `Insufficient stock. Available: ${product.current_stock}, Requested: ${quantity}`,
      });
      return;
    }

    const stockChange = movement_type === 'IN' ? quantity : -quantity;

    await query(
      'UPDATE products SET current_stock = current_stock + $1 WHERE id = $2',
      [stockChange, product_id]
    );

    const { rows: movRows } = await query(
      `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [product_id, quantity, movement_type, reason || 'Manual adjustment', req.user?.id]
    );

    res.status(201).json({
      movement: movRows[0],
      newStock: product.current_stock + stockChange,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
};
