import React, { useEffect, useState } from 'react';
import { Users, Package, FileCheck, FileEdit, AlertTriangle } from 'lucide-react';
import { getDashboardStats } from '../api/dashboard.api';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { DashboardStats } from '../types';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
}

const StatCard = ({ label, value, icon: Icon, colorClass }: StatCardProps) => (
  <div className="stat-card">
    <div className={`stat-icon ${colorClass}`}>
      <Icon size={22} />
    </div>
    <div className="stat-info">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value.toLocaleString()}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading dashboard..." />;

  return (
    <div className="page-enter">
      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard label="Active Customers"     value={stats?.totalCustomers ?? 0}        icon={Users}      colorClass="icon-blue" />
        <StatCard label="Total Products"       value={stats?.totalProducts ?? 0}          icon={Package}    colorClass="icon-amber" />
        <StatCard label="Confirmed Challans"   value={stats?.totalConfirmedChallans ?? 0} icon={FileCheck}  colorClass="icon-green" />
        <StatCard label="Draft Challans"       value={stats?.totalDraftChallans ?? 0}     icon={FileEdit}   colorClass="icon-purple" />
      </div>

      <div className="dashboard-grid">
        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <AlertTriangle size={18} color="var(--warning)" />
            <span className="card-title">Low Stock Alerts</span>
          </div>
          {stats?.lowStockProducts?.length === 0 ? (
            <p className="text-muted" style={{ padding: '1rem 0' }}>All stock levels are healthy ✓</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Min Alert</th>
                </tr>
              </thead>
              <tbody>
                {stats?.lowStockProducts?.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-500">{p.product_name}</td>
                    <td><span className="sku-code">{p.sku}</span></td>
                    <td>
                      <Badge variant={p.current_stock <= 0 ? 'danger' : 'warning'}>
                        {p.current_stock}
                      </Badge>
                    </td>
                    <td className="text-muted">{p.min_stock_alert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Challans */}
        <div className="card">
          <div className="card-header">
            <FileCheck size={18} color="var(--primary)" />
            <span className="card-title">Recent Challans</span>
          </div>
          {stats?.recentChallans?.length === 0 ? (
            <p className="text-muted" style={{ padding: '1rem 0' }}>No challans yet</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentChallans?.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-600">{c.challan_number}</td>
                    <td>{c.customer_name}</td>
                    <td>{c.total_quantity}</td>
                    <td>
                      <Badge variant={
                        c.status === 'Confirmed' ? 'success' :
                        c.status === 'Cancelled' ? 'danger' : 'warning'
                      }>
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
