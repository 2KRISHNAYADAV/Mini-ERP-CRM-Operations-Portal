import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getChallans = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rows } = await query(`
      SELECT c.*, cust.customer_name, u.name as created_by_name
      FROM challans c
      JOIN customers cust ON c.customer_id = cust.id
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch challans' });
  }
};

export const getChallanById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const challanId = req.params.id;

    const { rows: challanRows } = await query(`
      SELECT c.*, cust.customer_name, cust.mobile_number as customer_mobile,
             cust.business_name, u.name as created_by_name
      FROM challans c
      JOIN customers cust ON c.customer_id = cust.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `, [challanId]);

    if (challanRows.length === 0) {
      res.status(404).json({ error: 'Challan not found' });
      return;
    }

    const { rows: itemRows } = await query(
      `SELECT * FROM challan_items WHERE challan_id = $1`,
      [challanId]
    );

    res.json({ ...challanRows[0], items: itemRows });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch challan' });
  }
};

export const createChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await (await import('../db')).pool.connect();
  try {
    const { customer_id, products, status } = req.body;

    if (!products || products.length === 0) {
      res.status(400).json({ error: 'At least one product is required' });
      return;
    }

    await client.query('BEGIN');

    // Generate challan number
    const countRes = await client.query('SELECT COUNT(*) FROM challans');
    const nextId = parseInt(countRes.rows[0].count) + 1;
    const challanNum = `CH-${new Date().getFullYear()}-${String(nextId).padStart(4, '0')}`;

    const challanRes = await client.query(
      `INSERT INTO challans (challan_number, customer_id, status, total_quantity, created_by)
       VALUES ($1,$2,$3,0,$4) RETURNING *`,
      [challanNum, customer_id, status || 'Draft', req.user?.id]
    );
    const challan = challanRes.rows[0];

    let totalQty = 0;

    for (const p of products) {
      const prodRes = await client.query('SELECT * FROM products WHERE id = $1', [p.product_id]);
      if (prodRes.rows.length === 0) {
        throw new Error(`Product ID ${p.product_id} not found`);
      }
      const prod = prodRes.rows[0];

      if (status === 'Confirmed' && prod.current_stock < p.quantity) {
        throw new Error(
          `Insufficient stock for "${prod.product_name}". Available: ${prod.current_stock}, Requested: ${p.quantity}`
        );
      }

      await client.query(
        `INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [challan.id, prod.id, prod.product_name, prod.sku, prod.unit_price, p.quantity]
      );

      if (status === 'Confirmed') {
        await client.query(
          'UPDATE products SET current_stock = current_stock - $1 WHERE id = $2',
          [p.quantity, prod.id]
        );
        await client.query(
          `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
           VALUES ($1,$2,'OUT',$3,$4)`,
          [prod.id, p.quantity, `Challan ${challanNum}`, req.user?.id]
        );
      }

      totalQty += Number(p.quantity);
    }

    await client.query(
      'UPDATE challans SET total_quantity = $1 WHERE id = $2',
      [totalQty, challan.id]
    );

    await client.query('COMMIT');
    res.status(201).json({ ...challan, total_quantity: totalQty });
  } catch (err: any) {
    await client.query('ROLLBACK');
    const statusCode = err.message.includes('Insufficient stock') ? 400 : 500;
    res.status(statusCode).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const cancelChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rows } = await query(
      `UPDATE challans SET status='Cancelled' WHERE id=$1 AND status='Draft' RETURNING *`,
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(400).json({ error: 'Only Draft challans can be cancelled' });
      return;
    }
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to cancel challan' });
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await (await import('../db')).pool.connect();
  try {
    const challanId = req.params.id;

    await client.query('BEGIN');

    const { rows: challanRows } = await client.query(
      'SELECT * FROM challans WHERE id = $1 FOR UPDATE',
      [challanId]
    );

    if (challanRows.length === 0) {
      res.status(404).json({ error: 'Challan not found' });
      return;
    }

    const challan = challanRows[0];
    if (challan.status !== 'Draft') {
      res.status(400).json({ error: 'Only Draft challans can be confirmed' });
      return;
    }

    const { rows: itemRows } = await client.query(
      'SELECT * FROM challan_items WHERE challan_id = $1',
      [challanId]
    );

    for (const item of itemRows) {
      const { rows: productRows } = await client.query(
        'SELECT * FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );

      if (productRows.length === 0) {
        throw new Error(`Product not found for item with ID ${item.id}`);
      }

      const product = productRows[0];
      if (product.current_stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.product_name}". Available: ${product.current_stock}, Requested: ${item.quantity}`
        );
      }
    }

    for (const item of itemRows) {
      await client.query(
        'UPDATE products SET current_stock = current_stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );

      await client.query(
        `INSERT INTO stock_movements (product_id, quantity_changed, movement_type, reason, created_by)
         VALUES ($1, $2, 'OUT', $3, $4)`,
        [item.product_id, item.quantity, `Challan ${challan.challan_number}`, req.user?.id]
      );
    }

    const { rows: updatedChallanRows } = await client.query(
      "UPDATE challans SET status = 'Confirmed' WHERE id = $1 RETURNING *",
      [challanId]
    );

    await client.query('COMMIT');
    res.json(updatedChallanRows[0]);
  } catch (err: any) {
    await client.query('ROLLBACK');
    const statusCode = err.message.includes('Insufficient stock') ? 400 : 500;
    res.status(statusCode).json({ error: err.message });
  } finally {
    client.release();
  }
};
