import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { loginApi } from '../api/auth.api';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginApi(email, password);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@test.com' },
    { label: 'Sales', email: 'sales@test.com' },
    { label: 'Warehouse', email: 'warehouse@test.com' },
    { label: 'Accounts', email: 'accounts@test.com' },
  ];

  return (
    <div className="login-container">
      <div className="login-left-pane">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">ERP</div>
            <h1 className="login-title">Mini ERP + CRM</h1>
            <p className="login-subtitle">Operations Portal — Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="input input-with-icon"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input input-with-icon input-with-icon-right"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <><div className="spinner spinner-btn" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-demo">
            <p className="login-demo-title">Demo Accounts (password: <code>password123</code>)</p>
            <div className="login-demo-grid">
              {demoAccounts.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className="login-demo-btn"
                  onClick={() => { setEmail(a.email); setPassword('password123'); }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="login-right-pane">
        <div className="bubbles-container">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
          <div className="bubble bubble-4"></div>
          <div className="bubble bubble-5"></div>
          <div className="bubble bubble-6"></div>
          <div className="bubble bubble-7"></div>
          <div className="bubble bubble-8"></div>
        </div>
        <div className="login-right-content">
          <div className="login-right-logo">ERP</div>
          <h2 className="login-right-title">Mini ERP & CRM</h2>
          <p className="login-right-subtitle">
            Manage your customers, inventory, products, and sales challans with a clean, high-performance interface.
          </p>
        </div>
      </div>
    </div>
  );
}
