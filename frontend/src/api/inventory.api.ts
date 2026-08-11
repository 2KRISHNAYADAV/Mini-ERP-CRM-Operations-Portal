import api from './axios';
import { StockMovement } from '../types';

export const getStockMovements = (productId?: number) =>
  api.get<StockMovement[]>('/inventory/movements', {
    params: productId ? { product_id: productId } : undefined,
  });

export const adjustStock = (data: {
  product_id: number;
  quantity: number;
  movement_type: 'IN' | 'OUT';
  reason?: string;
}) => api.post('/inventory/adjust', data);
