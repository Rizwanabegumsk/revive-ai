import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { RecoveryPage } from './pages/RecoveryPage';
import { AIDecisionsPage } from './pages/AIDecisionsPage';
import { AIExperimentsPage } from './pages/AIExperimentsPage';
import { CustomersPage } from './pages/CustomersPage';
import { PoliciesPage } from './pages/PoliciesPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transactions/:id" element={<TransactionDetailPage />} />
          <Route path="recovery" element={<RecoveryPage />} />
          <Route path="ai/decisions" element={<AIDecisionsPage />} />
          <Route path="ai/experiments" element={<AIExperimentsPage />} />
          <Route path="experiments" element={<AIExperimentsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="settings/policies" element={<PoliciesPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
