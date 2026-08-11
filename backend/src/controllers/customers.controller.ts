import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

export const getCustomers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rows } = await query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rows } = await query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      customer_name, mobile_number, email, business_name,
      gst_number, customer_type, address, status, follow_up_date, notes
    } = req.body;

    const { rows } = await query(
      `INSERT INTO customers 
        (customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [customer_name, mobile_number, email, business_name, gst_number,
       customer_type || 'Retail', address, status || 'Active', follow_up_date || null, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      customer_name, mobile_number, email, business_name,
      gst_number, customer_type, address, status, follow_up_date, notes
    } = req.body;

    const { rows } = await query(
      `UPDATE customers SET
        customer_name=$1, mobile_number=$2, email=$3, business_name=$4,
        gst_number=$5, customer_type=$6, address=$7, status=$8,
        follow_up_date=$9, notes=$10
       WHERE id=$11 RETURNING *`,
      [customer_name, mobile_number, email, business_name, gst_number,
       customer_type, address, status, follow_up_date || null, notes, req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rowCount } = await query('DELETE FROM customers WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};
