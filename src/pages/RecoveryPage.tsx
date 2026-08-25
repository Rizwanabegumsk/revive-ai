import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { RECOVERY_QUEUE } from '../data/mockData';
import { Zap, AlertTriangle } from 'lucide-react';

export const RecoveryPage: React.FC = () => {
  const { onOpenMobileNav } = useOutletContext<{ onOpenMobileNav: () => void }>();
  const [activeTab, setActiveTab] = useState<'all' | 'automated' | 'links' | 'escalations'>('all');

  const filteredItems = RECOVERY_QUEUE.filter((item) => {
    if (activeTab === 'automated') return item.autoEligible;
    if (activeTab === 'links') return item.recommendedAction.toLowerCase().includes('link');
    if (activeTab === 'escalations') return !item.autoEligible || item.priority === 'Attention';
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Recovery Operations"
        subtitle="Manage and monitor automated payment retry pipelines, WhatsApp recovery links, and manual merchant escalations."
        onOpenMobileNav={onOpenMobileNav}
      />

      {/* Operational Summary Strip */}
      <div className="metric-strip-container" style={{ marginBottom: '1.5rem' }}>
        <div className="metric-strip">
          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-title">Active Workflows</span>
            </div>
            <div className="metric-value-row">
              <span className="metric-value num-tabular">1,248</span>
            </div>
            <span className="metric-subtitle">Currently queued or retrying</span>
          </div>

          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-title">Smart Retries Today</span>
            </div>
            <div className="metric-value-row">
              <span className="metric-value num-tabular">842</span>
            </div>
            <span className="metric-subtitle">78.4% auto-execution success</span>
          </div>

          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-title">WhatsApp Links Sent</span>
            </div>
            <div className="metric-value-row">
              <span className="metric-value num-tabular">319</span>
            </div>
            <span className="metric-subtitle">Avg conversion time: 14 mins</span>
          </div>

          <div className="metric-item">
            <div className="metric-header">
              <span className="metric-title">Pending Escalations</span>
            </div>
            <div className="metric-value-row">
              <span className="metric-value num-tabular">14</span>
            </div>
            <span className="metric-subtitle">Requires merchant action</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Active Operations
          <span className="tab-count">{RECOVERY_QUEUE.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'automated' ? 'active' : ''}`}
          onClick={() => setActiveTab('automated')}
        >
          Automated Auto-Retries
          <span className="tab-count">{RECOVERY_QUEUE.filter(i => i.autoEligible).length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
        >
          Payment Links
          <span className="tab-count">{RECOVERY_QUEUE.filter(i => i.recommendedAction.toLowerCase().includes('link')).length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'escalations' ? 'active' : ''}`}
          onClick={() => setActiveTab('escalations')}
        >
          Merchant Escalations
          <span className="tab-count">{RECOVERY_QUEUE.filter(i => !i.autoEligible || i.priority === 'Attention').length}</span>
        </button>
      </div>

      {/* Operations Table */}
      <div className="dashboard-section" style={{ padding: 0 }}>
        <div className="queue-table-container">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Operation ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Assigned Action</th>
                <th>Probability</th>
                <th>Gateway & Channel</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="text-mono text-strong" style={{ fontSize: '13px' }}>
                    {item.id}
                  </td>
                  <td>
                    <div className="customer-name-cell">
                      <span className="text-strong">{item.customerName}</span>
                      <span className="customer-email">{item.customerEmail}</span>
                    </div>
                  </td>
                  <td className="amount-cell text-strong">
                    {item.amountFormatted}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {item.autoEligible ? (
                        <Zap size={14} style={{ color: 'var(--color-primary)' }} />
                      ) : (
                        <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />
                      )}
                      <span style={{ fontWeight: 500 }}>{item.recommendedAction}</span>
                    </div>
                  </td>
                  <td className="num-tabular text-strong" style={{ fontSize: '13px' }}>
                    {item.recoveryProbability}%
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="text-strong">{item.gateway}</span>
                      <span className="text-xs text-muted">{item.channel}</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={item.priority} />
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
