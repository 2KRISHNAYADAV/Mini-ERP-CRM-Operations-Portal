import React, { useEffect, useState } from 'react';
import { Plus, FileText, Trash2, Eye, X, CheckCircle, Download } from 'lucide-react';
import { getChallans, createChallan, cancelChallan, getChallanById, confirmChallan, downloadChallanPdf } from '../api/challans.api';
import { getCustomers } from '../api/customers.api';
import { getProducts } from '../api/products.api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Challan, Customer, Product } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PageHeader } from '../components/ui/PageHeader';

interface SelectedProduct { product_id: string; quantity: number }

export default function Challans() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewTarget, setViewTarget] = useState<any>(null);
  const [cancelTarget, setCancelTarget] = useState<Challan | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Challan | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [customerId, setCustomerId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const { toast } = useToast();
  const { user } = useAuth();
  const canCreate = ['Admin', 'Sales'].includes(user?.role || '');

  const load = async () => {
    try {
      const [cRes, pRes, chRes] = await Promise.all([
        getCustomers(), getProducts(), getChallans()
      ]);
      setCustomers(cRes.data);
      setProducts(pRes.data);
      setChallans(chRes.data);
    } catch {
      toast.error('Failed to load challan data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setCustomerId('');
    setSelectedProducts([]);
    setShowCreate(true);
  };

  const addProductLine = () =>
    setSelectedProducts([...selectedProducts, { product_id: '', quantity: 1 }]);

  const removeProductLine = (i: number) =>
    setSelectedProducts(selectedProducts.filter((_, idx) => idx !== i));

  const updateLine = (i: number, key: keyof SelectedProduct, val: any) => {
    const updated = [...selectedProducts];
    (updated[i] as any)[key] = val;
    setSelectedProducts(updated);
  };

  const totalQty = selectedProducts.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

  const handleSubmit = async (status: 'Draft' | 'Confirmed') => {
    if (!customerId) { toast.error('Please select a customer'); return; }
    if (selectedProducts.length === 0) { toast.error('Add at least one product'); return; }
    if (selectedProducts.some((p) => !p.product_id || p.quantity <= 0)) {
      toast.error('Please fill all product lines correctly'); return;
    }

    setSaving(true);
    try {
      await createChallan({
        customer_id: Number(customerId),
        products: selectedProducts.map((p) => ({
          product_id: Number(p.product_id),
          quantity: Number(p.quantity),
        })),
        status,
      });
      toast.success(status === 'Draft' ? 'Draft saved successfully' : 'Challan confirmed and stock updated!');
      setShowCreate(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create challan');
    } finally {
      setSaving(false);
    }
  };

  const handleViewChallan = async (c: Challan) => {
    try {
      const { data } = await getChallanById(c.id);
      setViewTarget(data);
    } catch {
      toast.error('Failed to load challan details');
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelChallan(cancelTarget.id);
      toast.success('Challan cancelled');
      setCancelTarget(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel challan');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    setConfirming(true);
    try {
      await confirmChallan(confirmTarget.id);
      toast.success('Challan confirmed and stock updated!');
      setConfirmTarget(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to confirm challan');
    } finally {
      setConfirming(false);
    }
  };

  const handleDownloadPdf = async (challan: any) => {
    setPdfLoading(true);
    try {
      await downloadChallanPdf(challan.id, challan.challan_number);
    } catch {
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading challans..." />;

  return (
    <div className="page-enter">
      <PageHeader
        title="Sales Challans"
        subtitle={`${challans.length} challan${challans.length !== 1 ? 's' : ''} total`}
        action={canCreate ? (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Create Challan
          </button>
        ) : undefined}
      />

      <div className="card table-card">
        {challans.length === 0 ? (
          <EmptyState icon={FileText} title="No challans yet" description="Create your first sales challan." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-600">{c.challan_number}</td>
                    <td>{c.customer_name}</td>
                    <td className="fw-500">{c.total_quantity}</td>
                    <td>
                      <Badge variant={
                        c.status === 'Confirmed' ? 'success' :
                        c.status === 'Cancelled' ? 'danger' : 'warning'
                      }>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="text-muted">{c.created_by_name || '—'}</td>
                    <td className="text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" onClick={() => handleViewChallan(c)} title="View Details">
                          <Eye size={15} />
                        </button>
                        {canCreate && c.status === 'Draft' && (
                          <>
                            <button className="btn-icon btn-icon-success" onClick={() => setConfirmTarget(c)} title="Confirm & Reduce Stock">
                              <CheckCircle size={15} />
                            </button>
                            <button className="btn-icon btn-icon-danger" onClick={() => setCancelTarget(c)} title="Cancel Challan">
                              <X size={15} />
                            </button>
                          </>
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

      {/* Create Challan Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Sales Challan"
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => handleSubmit('Draft')}
              disabled={saving}
            >
              Save as Draft
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSubmit('Confirmed')}
              disabled={saving}
            >
              <CheckCircle size={16} />
              {saving ? 'Processing...' : 'Confirm & Reduce Stock'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Customer *</label>
          <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">-- Select Customer --</option>
            {customers.filter((c) => c.status === 'Active').map((c) => (
              <option key={c.id} value={c.id}>{c.customer_name} — {c.business_name}</option>
            ))}
          </select>
        </div>

        <div className="challan-products-header">
          <label className="form-label" style={{ marginBottom: 0 }}>Products *</label>
          <button type="button" className="btn btn-outline btn-sm" onClick={addProductLine}>
            <Plus size={14} /> Add Line
          </button>
        </div>

        {selectedProducts.length === 0 && (
          <div className="text-muted text-sm" style={{ marginBottom: '1rem' }}>
            No products added. Click "Add Line" to start.
          </div>
        )}

        {selectedProducts.map((sp, i) => {
          const prod = products.find((p) => p.id === Number(sp.product_id));
          return (
            <div key={i} className="challan-product-row">
              <select
                className="input"
                style={{ flex: 1, marginBottom: 0 }}
                value={sp.product_id}
                onChange={(e) => updateLine(i, 'product_id', e.target.value)}
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_name} — ₹{Number(p.unit_price).toFixed(2)} (Stock: {p.current_stock})
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="Qty"
                style={{ width: '90px', marginBottom: 0 }}
                value={sp.quantity}
                onChange={(e) => updateLine(i, 'quantity', parseInt(e.target.value) || 0)}
              />
              {prod && (
                <div className="challan-line-info">
                  ₹{(Number(prod.unit_price) * sp.quantity).toFixed(2)}
                </div>
              )}
              <button type="button" className="btn-icon btn-icon-danger" onClick={() => removeProductLine(i)}>
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}

        {selectedProducts.length > 0 && (
          <div className="challan-summary">
            <span>Total Items: <strong>{selectedProducts.length}</strong></span>
            <span>Total Qty: <strong>{totalQty}</strong></span>
          </div>
        )}
      </Modal>

      {/* View Challan Detail Modal */}
      {viewTarget && (
        <Modal
          isOpen={!!viewTarget}
          onClose={() => setViewTarget(null)}
          title={`Challan: ${viewTarget.challan_number}`}
          size="lg"
          headerAction={
            <button
              className="btn btn-outline btn-sm"
              onClick={() => handleDownloadPdf(viewTarget)}
              disabled={pdfLoading}
              title="Download PDF"
            >
              {pdfLoading
                ? <><div className="spinner spinner-btn" /> Generating...</>
                : <><Download size={14} /> Download PDF</>}
            </button>
          }
        >
          <div className="challan-detail">
            <div className="challan-detail-row">
              <div><span className="label">Customer:</span> <strong>{viewTarget.customer_name}</strong></div>
              <div><span className="label">Business:</span> {viewTarget.business_name}</div>
              <div><span className="label">Status:</span>
                <Badge variant={viewTarget.status === 'Confirmed' ? 'success' : viewTarget.status === 'Cancelled' ? 'danger' : 'warning'}>
                  {viewTarget.status}
                </Badge>
              </div>
              <div><span className="label">Date:</span> {new Date(viewTarget.created_at).toLocaleString()}</div>
            </div>
            <table className="table" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Product (Snapshot)</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {viewTarget.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="fw-500">{item.product_name_snapshot}</td>
                    <td><code>{item.sku_snapshot}</code></td>
                    <td>₹{Number(item.unit_price_snapshot).toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td className="fw-600">₹{(Number(item.unit_price_snapshot) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="challan-detail-total">
              Total Quantity: <strong>{viewTarget.total_quantity}</strong>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Challan"
        message={`Cancel challan "${cancelTarget?.challan_number}"? This cannot be undone.`}
        confirmLabel="Yes, Cancel"
        isDestructive
        loading={cancelling}
      />

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirm}
        title="Confirm Challan"
        message={`Confirm challan "${confirmTarget?.challan_number}"? This will check and reduce stock, and cannot be undone.`}
        confirmLabel="Yes, Confirm"
        loading={confirming}
      />
    </div>
  );
}
