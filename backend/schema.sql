-- ============================================================
-- Mini ERP + CRM Operations Portal — PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role        VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Sales', 'Warehouse', 'Accounts')),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Customers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id              SERIAL PRIMARY KEY,
  customer_name   VARCHAR(255) NOT NULL,
  mobile_number   VARCHAR(20),
  email           VARCHAR(255),
  business_name   VARCHAR(255),
  gst_number      VARCHAR(50),
  customer_type   VARCHAR(50) DEFAULT 'Retail' CHECK (customer_type IN ('Retail', 'Wholesale', 'Distributor')),
  address         TEXT,
  status          VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  follow_up_date  DATE,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- ─── Products ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  product_name    VARCHAR(255) NOT NULL,
  sku             VARCHAR(100) UNIQUE NOT NULL,
  category        VARCHAR(100),
  unit_price      DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  current_stock   INT DEFAULT 0 CHECK (current_stock >= 0),
  min_stock_alert INT DEFAULT 5 CHECK (min_stock_alert >= 0),
  location        VARCHAR(100),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(current_stock);

-- ─── Stock Movements ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_movements (
  id              SERIAL PRIMARY KEY,
  product_id      INT REFERENCES products(id) ON DELETE CASCADE,
  quantity_changed INT NOT NULL CHECK (quantity_changed > 0),
  movement_type   VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
  reason          VARCHAR(255),
  created_by      INT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);

-- ─── Challans ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challans (
  id              SERIAL PRIMARY KEY,
  challan_number  VARCHAR(100) UNIQUE NOT NULL,
  customer_id     INT REFERENCES customers(id) ON DELETE RESTRICT,
  status          VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Confirmed', 'Cancelled')),
  total_quantity  INT NOT NULL DEFAULT 0,
  created_by      INT REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_challans_status ON challans(status);
CREATE INDEX IF NOT EXISTS idx_challans_customer ON challans(customer_id);

-- ─── Challan Items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challan_items (
  id                    SERIAL PRIMARY KEY,
  challan_id            INT REFERENCES challans(id) ON DELETE CASCADE,
  product_id            INT REFERENCES products(id) ON DELETE SET NULL,
  product_name_snapshot VARCHAR(255) NOT NULL,
  sku_snapshot          VARCHAR(100),
  unit_price_snapshot   DECIMAL(10,2),
  quantity              INT NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS idx_challan_items_challan ON challan_items(challan_id);

-- ============================================================
-- NOTE: Run seed.ts (ts-node seed.ts) to insert demo users
-- ============================================================
