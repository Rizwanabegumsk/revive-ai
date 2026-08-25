import React from 'react';
import { Download, Menu } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  onOpenMobileNav?: () => void;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onOpenMobileNav,
  actions
}) => {
  return (
    <header className="page-header">
      <div className="page-title-area">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onOpenMobileNav && (
            <button className="mobile-nav-toggle" onClick={onOpenMobileNav} aria-label="Open menu">
              <Menu size={18} />
            </button>
          )}
          <h1 className="page-title">{title}</h1>
        </div>
        <p className="page-subtitle">{subtitle}</p>
      </div>

      <div className="page-header-actions">
        {actions ? (
          actions
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select className="select-control" defaultValue="30d">
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="mtd">Month to Date</option>
              </select>

              <select className="select-control" defaultValue="all">
                <option value="all">All Gateways</option>
                <option value="razorpay">Razorpay</option>
                <option value="phonepe">PhonePe</option>
                <option value="payu">PayU</option>
                <option value="cashfree">Cashfree</option>
              </select>
            </div>

            <button className="btn btn-secondary">
              <Download size={14} />
              <span>Export</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
