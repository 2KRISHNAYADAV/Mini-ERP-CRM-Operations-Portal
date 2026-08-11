import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products.api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PageHeader } from '../components/ui/PageHeader';

const EMPTY_FORM: Partial<Product> = {
  product_name: '', sku: '', category: '', unit_price: 0,
  current_stock: 0, min_stock_alert: 5, location: '',
};

const getStockVariant = (stock: number, min: number) => {
  if (stock <= 0) return 'danger' as const;
  if (stock <= min) return 'warning' as const;
  return 'success' as const;
};

const getStockLabel = (stock: number, min: number) => {
  if (stock <= 0) return `Out of Stock (${stock})`;
  if (stock <= min) return `Low Stock (${stock})`;
  return `In Stock (${stock})`;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const canCreate = ['Admin', 'Warehouse', 'Sales'].includes(user?.role || '');
  const canEdit   = ['Admin', 'Warehouse'].includes(user?.role || '');
  const canDelete = user?.role === 'Admin';

  const load = async () => {
    try {
      const { data } = await getProducts();
      setProducts(data);
      setFiltered(data);
    } catch {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(products.filter((p) =>
      p.product_name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ));
  }, [search, products]);

  const openAdd = () => { setEditTarget(null); setFormData(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditTarget(p);
    setFormData({ ...p });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await updateProduct(editTarget.id, {
          product_name: formData.product_name,
          sku: formData.sku,
          category: formData.category,
          unit_price: Number(formData.unit_price),
          min_stock_alert: Number(formData.min_stock_alert),
          location: formData.location,
        });
        toast.success('Product updated successfully');
      } else {
        await createProduct({
          ...formData,
          unit_price: Number(formData.unit_price),
          current_stock: Number(formData.current_stock),
          min_stock_alert: Number(formData.min_stock_alert),
        });
        toast.success('Product added successfully');
      }
      closeModal();
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const set = (key: keyof Product, val: any) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  if (loading) return <LoadingSpinner fullPage text="Loading products..." />;

  return (
    <div className="page-enter">
      <PageHeader
        title="Product Management"
        subtitle={`${products.length} product${products.length !== 1 ? 's' : ''} in catalogue`}
        action={canCreate ? (
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Product
          </button>
        ) : undefined}
      />

      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          className="search-input"
          placeholder="Search by name, SKU or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card table-card">
        {filtered.length === 0 ? (
          <EmptyState icon={Package} title="No products found" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock Status</th>
                  <th>Min Alert</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td><code className="sku-code">{p.sku}</code></td>
                    <td className="fw-500">{p.product_name}</td>
                    <td>{p.category || '—'}</td>
                    <td className="fw-500">₹{Number(p.unit_price).toFixed(2)}</td>
                    <td>
                      <Badge variant={getStockVariant(p.current_stock, p.min_stock_alert)}>
                        {getStockLabel(p.current_stock, p.min_stock_alert)}
                      </Badge>
                    </td>
                    <td className="text-muted">{p.min_stock_alert}</td>
                    <td className="text-muted">{p.location || '—'}</td>
                    <td>
                      <div className="action-btns">
                        {canEdit && (
                          <button className="btn-icon" onClick={() => openEdit(p)} title="Edit">
                            <Pencil size={15} />
                          </button>
                        )}
                        {canDelete && (
                          <button className="btn-icon btn-icon-danger" onClick={() => setDeleteTarget(p)} title="Delete">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editTarget ? 'Edit Product' : 'Add Product'}
        size="md"
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
            <button form="product-form" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editTarget ? 'Update Product' : 'Add Product'}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="input" required value={formData.product_name || ''} onChange={(e) => set('product_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">SKU Code *</label>
              <input className="input" required value={formData.sku || ''} onChange={(e) => set('sku', e.target.value)} disabled={!!editTarget} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="input" value={formData.category || ''} onChange={(e) => set('category', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input className="input" type="number" step="0.01" min="0" required value={formData.unit_price ?? ''} onChange={(e) => set('unit_price', e.target.value)} />
            </div>
          </div>
          {!editTarget && (
            <div className="form-group">
              <label className="form-label">Initial Stock Qty</label>
              <input className="input" type="number" min="0" value={formData.current_stock ?? ''} onChange={(e) => set('current_stock', e.target.value)} />
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Min Stock Alert</label>
              <input className="input" type="number" min="0" value={formData.min_stock_alert ?? ''} onChange={(e) => set('min_stock_alert', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Location / Bin</label>
              <input className="input" value={formData.location || ''} onChange={(e) => set('location', e.target.value)} placeholder="e.g., A-Shelf-3" />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Delete "${deleteTarget?.product_name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        loading={deleting}
      />
    </div>
  );
}
