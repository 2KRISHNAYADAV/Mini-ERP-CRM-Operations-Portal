import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { UserRole } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Challans from './pages/Challans';

// ─── Full-page boot spinner ───────────────────────────────────────────────────
const BootScreen = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      background: 'var(--bg)',
    }}
  >
    <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
    <span className="loading-text">Verifying session…</span>
  </div>
);

// ─── Role-protected route wrapper ────────────────────────────────────────────
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) => {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && user?.role !== 'Admin' && !allowedRoles.includes(user?.role as UserRole)) {
    return (
      <Layout>
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { isInitializing } = useAuth();

  // Hold rendering until we've verified (or invalidated) the stored token
  if (isInitializing) return <BootScreen />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/customers" element={
        <ProtectedRoute allowedRoles={['Sales', 'Accounts']}><Customers /></ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute allowedRoles={['Warehouse', 'Sales']}><Products /></ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={['Warehouse', 'Sales']}><Inventory /></ProtectedRoute>
      } />
      <Route path="/challans" element={
        <ProtectedRoute allowedRoles={['Sales', 'Accounts']}><Challans /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
