import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="main-viewport">
        <main className="main-content">
          <Outlet context={{ onOpenMobileNav: () => setMobileOpen(true) }} />
        </main>
      </div>
    </div>
  );
};
