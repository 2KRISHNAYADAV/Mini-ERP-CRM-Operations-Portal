import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customer CRM',
  '/products':  'Product Management',
  '/inventory': 'Inventory Management',
  '/challans':  'Sales Challans',
};

const roleColors: Record<string, string> = {
  Admin: 'var(--role-admin)',
  Sales: 'var(--role-sales)',
  Warehouse: 'var(--role-warehouse)',
  Accounts: 'var(--role-accounts)',
};

export const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] || 'Portal';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-hamburger" onClick={onToggleSidebar} title="Open Menu">
          <Menu size={20} />
        </button>
        <div className="navbar-title">{title}</div>
      </div>
      <div className="navbar-right">
        <button className="navbar-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="navbar-notif-dot" />
        </button>
        <div className="navbar-user">
          <div className="navbar-user-name">{user?.name}</div>
          <span
            className="navbar-role-badge"
            style={{ background: roleColors[user?.role || 'Admin'] || 'var(--primary)' }}
          >
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
};
