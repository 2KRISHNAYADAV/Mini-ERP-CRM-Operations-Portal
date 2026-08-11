import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers.api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Customer } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PageHeader } from '../components/ui/PageHeader';

const EMPTY_FORM: Partial<Customer> = {
  customer_name: '', mobile_number: '', email: '', business_name: '',
  gst_number: '', customer_type: 'Retail', address: '', status: 'Active',
  follow_up_date: null, notes: '',
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const canWrite = ['Admin', 'Sales', 'Accounts'].includes(user?.role || '');
  const canDelete = user?.role === 'Admin';

  const load = async () => {
    try {
      const { data } = await getCustomers();
      setCustomers(data);
      setFiltered(data);
    } catch {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      customers.filter((c) =>
        c.customer_name.toLowerCase().includes(q) ||
        c.business_name?.toLowerCase().includes(q) ||
        c.mobile_number?.includes(q) ||
        c.email?.toLowerCase().includes(q)
      )
    );
  }, [search, customers]);

  const openAdd = () => { setEditTarget(null); setFormData(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c: Customer) => { setEditTarget(c); setFormData(c); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await updateCustomer(editTarget.id, formData);
        toast.success('Customer updated successfully');
      } else {
        await createCustomer(formData);
        toast.success('Customer added successfully');
      }
      closeModal();
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success('Customer deleted');
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  const set = (key: keyof Customer, val: string) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  if (loading) return <LoadingSpinner fullPage text="Loading customers..." />;

  return (
    <div className="page-enter">
      <PageHeader
        title="Customer CRM"
        subtitle={`${customers.length} customer${customers.length !== 1 ? 's' : ''} total`}
        action={canWrite ? (
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Customer
          </button>
        ) : undefined}
      />

      {/* Search */}
      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          className="search-input"
          placeholder="Search by name, business, phone or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card table-card">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" description="Add your first customer or adjust search." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td className="text-muted">{i + 1}</td>
                    <td>
                      <div className="fw-500">{c.customer_name}</div>
                      {c.gst_number && <div className="text-xs text-muted">GST: {c.gst_number}</div>}
                    </td>
                    <td>{c.business_name || '—'}</td>
                    <td>
                      <div>{c.mobile_number}</div>
                      <div className="text-xs text-muted">{c.email}</div>
                    </td>
                    <td><Badge variant="info">{c.customer_type}</Badge></td>
                    <td>
                      <Badge variant={c.status === 'Active' ? 'success' : 'neutral'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="action-btns">
                        {canWrite && (
                          <button className="btn-icon" onClick={() => openEdit(c)} title="Edit">
                            <Pencil size={15} />
                          </button>
                        )}
                        {canDelete && (
                          <button className="btn-icon btn-icon-danger" onClick={() => setDeleteTarget(c)} title="Delete">
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

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editTarget ? 'Edit Customer' : 'Add Customer'} size="md">
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input className="input" required value={formData.customer_name || ''} onChange={(e) => set('customer_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input className="input" value={formData.business_name || ''} onChange={(e) => set('business_name', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input className="input" required value={formData.mobile_number || ''} onChange={(e) => set('mobile_number', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" value={formData.email || ''} onChange={(e) => set('email', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input className="input" value={formData.gst_number || ''} onChange={(e) => set('gst_number', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <select className="input" value={formData.customer_type || 'Retail'} onChange={(e) => set('customer_type', e.target.value)}>
                <option>Retail</option>
                <option>Wholesale</option>
                <option>Distributor</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="input" rows={2} value={formData.address || ''} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="input" value={formData.status || 'Active'} onChange={(e) => set('status', e.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input className="input" type="date" value={formData.follow_up_date || ''} onChange={(e) => set('follow_up_date', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="input" rows={2} value={formData.notes || ''} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editTarget ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.customer_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        loading={deleting}
      />
    </div>
  );
}
