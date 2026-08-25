import React from 'react';
import { Menu } from 'lucide-react';

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

      {actions && (
        <div className="page-header-actions">
          {actions}
        </div>
      )}
    </header>
  );
};
