import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getProducts = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rows } = await query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product_name, sku, category, unit_price, current_stock, min_stock_alert, location } = req.body;

    const { rows } = await query(
      `INSERT INTO products (product_name, sku, category, unit_price, current_stock, min_stock_alert, location)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [product_name, sku, category, unit_price, current_stock || 0, min_stock_alert || 5, location]
    );

    // Record initial stock movement if stock > 0
    if (current_stock > 0) {
      await query(
        `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
         VALUES ($1,$2,'IN','Initial stock on creation',$3)`,
        [rows[0].id, current_stock, req.user?.id]
      );
    }

    res.status(201).json(rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'SKU already exists. Please use a unique SKU.' });
      return;
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product_name, sku, category, unit_price, min_stock_alert, location } = req.body;

    const { rows } = await query(
      `UPDATE products SET
        product_name=$1, sku=$2, category=$3, unit_price=$4,
        min_stock_alert=$5, location=$6
       WHERE id=$7 RETURNING *`,
      [product_name, sku, category, unit_price, min_stock_alert, location, req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'SKU already exists.' });
      return;
    }
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rowCount } = await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
