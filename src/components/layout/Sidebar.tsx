import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  RotateCcw,
  Cpu,
  Users,
  X,
  FlaskConical,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="brand-logo" onClick={onCloseMobile}>
          <div className="brand-mark">R</div>
          <span className="brand-text">REVIVE</span>
        </NavLink>
        {mobileOpen && (
          <button className="mobile-nav-toggle" onClick={onCloseMobile} aria-label="Close menu">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="sidebar-content">
        <div className="sidebar-nav-group">
          <ul className="sidebar-nav-list">
            <li className="sidebar-nav-item">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <LayoutDashboard className="sidebar-nav-icon" />
                <span>Overview</span>
              </NavLink>
            </li>

            <li className="sidebar-nav-item">
              <NavLink
                to="/transactions"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Receipt className="sidebar-nav-icon" />
                <span>Transactions</span>
              </NavLink>
            </li>

            <li className="sidebar-nav-item">
              <NavLink
                to="/recovery"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <RotateCcw className="sidebar-nav-icon" />
                <span>Recovery</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* AI Section */}
        <div className="sidebar-nav-group">
          <div className="sidebar-nav-label">AI</div>
          <ul className="sidebar-nav-list">
            <li className="sidebar-nav-item">
              <NavLink
                to="/ai/decisions"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Cpu className="sidebar-nav-icon" />
                <span>Decisions</span>
              </NavLink>
            </li>
            <li className="sidebar-nav-item">
              <NavLink
                to="/ai/experiments"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <FlaskConical className="sidebar-nav-icon" />
                <span>Experiments</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Customers Section */}
        <div className="sidebar-nav-group">
          <ul className="sidebar-nav-list">
            <li className="sidebar-nav-item">
              <NavLink
                to="/customers"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Users className="sidebar-nav-icon" />
                <span>Customers</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Settings Section */}
        <div className="sidebar-nav-group">
          <div className="sidebar-nav-label">Settings</div>
          <ul className="sidebar-nav-list">
            <li className="sidebar-nav-item">
              <NavLink
                to="/settings/policies"
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <ShieldAlert className="sidebar-nav-icon" />
                <span>Policies</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      {/* Sidebar Footer - Merchant Switcher */}
      <div className="sidebar-footer">
        <div className="merchant-badge">
          <div className="merchant-info">
            <span className="merchant-name">Nova Fashion</span>
            <span className="merchant-store">Production • INR</span>
          </div>
          <div className="live-indicator">
            <span className="live-dot" />
            <span>Live</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
