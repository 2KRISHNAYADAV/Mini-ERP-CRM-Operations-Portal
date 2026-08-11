// ─── Shared TypeScript Types ─────────────────────────────────────────────────

export type UserRole = 'Admin' | 'Sales' | 'Warehouse' | 'Accounts';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

export interface Customer {
  id: number;
  customer_name: string;
  mobile_number: string;
  email: string;
  business_name: string;
  gst_number: string;
  customer_type: 'Retail' | 'Wholesale' | 'Distributor';
  address: string;
  status: 'Active' | 'Inactive';
  follow_up_date: string | null;
  notes: string;
  created_at: string;
}

export interface Product {
  id: number;
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  min_stock_alert: number;
  location: string;
  created_at: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  quantity_changed: number;
  movement_type: 'IN' | 'OUT';
  reason: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
}

export interface Challan {
  id: number;
  challan_number: string;
  customer_id: number;
  customer_name?: string;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  total_quantity: number;
  created_by: number;
  created_by_name?: string;
  created_at: string;
}

export interface ChallanItem {
  id: number;
  challan_id: number;
  product_id: number;
  product_name_snapshot: string;
  sku_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
}

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  totalConfirmedChallans: number;
  totalDraftChallans: number;
  lowStockProducts: Product[];
  recentChallans: Challan[];
}
