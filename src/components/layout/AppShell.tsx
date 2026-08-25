import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="main-viewport">
        <main key={location.pathname} className="main-content page-enter-animated">
          <Outlet context={{ onOpenMobileNav: () => setMobileOpen(true) }} />
        </main>
      </div>
    </div>
  );
};
