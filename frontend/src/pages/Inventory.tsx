import React, { useEffect, useState } from 'react';
import { Plus, Warehouse, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { getStockMovements, adjustStock } from '../api/inventory.api';
import { getProducts } from '../api/products.api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { StockMovement, Product } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';

export default function Inventory() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterProduct, setFilterProduct] = useState('');

  const [form, setForm] = useState({
    product_id: '',
    quantity: '',
    movement_type: 'IN' as 'IN' | 'OUT',
    reason: '',
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const canAdjust = ['Admin', 'Warehouse'].includes(user?.role || '');

  const load = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        getStockMovements(filterProduct ? Number(filterProduct) : undefined),
        getProducts(),
      ]);
      setMovements(mRes.data);
      setProducts(pRes.data);
    } catch {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterProduct]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.quantity) return;
    setSaving(true);
    try {
      const { data } = await adjustStock({
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        movement_type: form.movement_type,
        reason: form.reason || undefined,
      });
      toast.success(`Stock adjusted. New stock: ${data.newStock}`);
      setShowModal(false);
      setForm({ product_id: '', quantity: '', movement_type: 'IN', reason: '' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === Number(form.product_id));

  if (loading) return <LoadingSpinner fullPage text="Loading inventory..." />;

  return (
    <div className="page-enter">
      <PageHeader
        title="Inventory Management"
        subtitle="Stock movements and adjustments"
        action={canAdjust ? (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Adjust Stock
          </button>
        ) : undefined}
      />

      {/* Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <select
          className="input"
          style={{ maxWidth: '320px' }}
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.product_name} ({p.sku})</option>
          ))}
        </select>
      </div>

      {/* Stock Summary Cards */}
      <div className="inventory-summary">
        {products.slice(0, 4).map((p) => (
          <div key={p.id} className="inventory-card">
            <div className="inventory-card-name">{p.product_name}</div>
            <div className="inventory-card-sku">{p.sku}</div>
            <div className="inventory-card-stock">
              <span>{p.current_stock}</span>
              <Badge variant={p.current_stock <= 0 ? 'danger' : p.current_stock <= p.min_stock_alert ? 'warning' : 'success'}>
                {p.current_stock <= 0 ? 'Out' : p.current_stock <= p.min_stock_alert ? 'Low' : 'OK'}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Movements Table */}
      <div className="card table-card">
        <div className="card-header">
          <Warehouse size={18} color="var(--primary)" />
          <span className="card-title">Stock Movement Log</span>
        </div>
        {movements.length === 0 ? (
          <EmptyState icon={Warehouse} title="No stock movements" description="Movements are recorded when stock is adjusted or challans are confirmed." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty Changed</th>
                  <th>Reason</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="text-muted text-sm">
                      {new Date(m.created_at).toLocaleDateString()}<br />
                      <span style={{ fontSize: '0.75rem' }}>{new Date(m.created_at).toLocaleTimeString()}</span>
                    </td>
                    <td className="fw-500">{m.product_name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {m.movement_type === 'IN'
                          ? <ArrowUpCircle size={16} color="var(--success)" />
                          : <ArrowDownCircle size={16} color="var(--danger)" />}
                        <Badge variant={m.movement_type === 'IN' ? 'success' : 'danger'}>
                          {m.movement_type}
                        </Badge>
                      </div>
                    </td>
                    <td className="fw-600">{m.quantity_changed}</td>
                    <td className="text-muted">{m.reason}</td>
                    <td className="text-muted">{m.created_by_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Manual Stock Adjustment" size="sm">
        <form onSubmit={handleAdjust}>
          <div className="form-group">
            <label className="form-label">Product *</label>
            <select className="input" required value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
              <option value="">-- Select Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name} (Current: {p.current_stock})
                </option>
              ))}
            </select>
          </div>
          {selectedProduct && (
            <div className="current-stock-info">
              Current Stock: <strong>{selectedProduct.current_stock}</strong> units
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Movement Type *</label>
            <select className="input" value={form.movement_type} onChange={(e) => setForm({ ...form, movement_type: e.target.value as 'IN' | 'OUT' })}>
              <option value="IN">IN — Add to stock</option>
              <option value="OUT">OUT — Remove from stock</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input className="input" type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <input className="input" placeholder="e.g., Received from supplier" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Adjusting...' : 'Adjust Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
