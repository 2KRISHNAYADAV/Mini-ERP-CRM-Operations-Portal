import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, Warehouse, FileText, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { path: '/dashboard',  label: 'Dashboard',          icon: LayoutDashboard },
  { path: '/customers',  label: 'Customer CRM',        icon: Users,       roles: ['Admin', 'Sales', 'Accounts'] },
  { path: '/products',   label: 'Products',            icon: Package,     roles: ['Admin', 'Warehouse', 'Sales'] },
  { path: '/inventory',  label: 'Inventory',           icon: Warehouse,   roles: ['Admin', 'Warehouse', 'Sales'] },
  { path: '/challans',   label: 'Sales Challans',      icon: FileText,    roles: ['Admin', 'Sales', 'Accounts'] },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const visibleItems = navItems.filter(
    (item) => !item.roles || !user || item.roles.includes(user.role) || user.role === 'Admin'
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">ERP</div>
          <div>
            <div className="sidebar-brand-name">Mini ERP</div>
            <div className="sidebar-brand-sub">Operations Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose} // close drawer on selection
              >
                <item.icon size={18} className="sidebar-link-icon" />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="sidebar-link-chevron" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
