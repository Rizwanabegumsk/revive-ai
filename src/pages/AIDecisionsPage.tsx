import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { DECISION_LOGS } from '../data/mockData';
import { Cpu } from 'lucide-react';

export const AIDecisionsPage: React.FC = () => {
  const { onOpenMobileNav } = useOutletContext<{ onOpenMobileNav: () => void }>();

  return (
    <div>
      <PageHeader
        title="AI Decisions"
        subtitle="Transparent audit log of machine learning decision models evaluating payment recovery probability, optimal timing, and execution channels."
        onOpenMobileNav={onOpenMobileNav}
      />

      {/* Model Health Banner */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>
              Revive Recovery Engine v3.4
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Active features: Gateway Latency Index, Bank Core Uptime, Past Customer Channel Preference, Amount Bucket Probability
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <span className="text-xs text-muted block">Accuracy Precision</span>
            <span className="text-strong num-tabular" style={{ fontSize: '15px' }}>99.4%</span>
          </div>
          <div>
            <span className="text-xs text-muted block">Avg Inference Latency</span>
            <span className="text-strong num-tabular" style={{ fontSize: '15px' }}>42ms</span>
          </div>
        </div>
      </div>

      {/* Decision Table */}
      <div className="dashboard-section" style={{ padding: 0 }}>
        <div className="section-header" style={{ padding: '1.25rem 1.5rem 0.75rem 1.5rem', marginBottom: 0 }}>
          <div className="section-title-group">
            <h2 className="section-title">Decision Audit Stream</h2>
            <p className="section-description">Real-time inference records with feature importance justification</p>
          </div>
        </div>

        <div className="queue-table-container">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Decision ID</th>
                <th>Txn Ref</th>
                <th>Customer & Amount</th>
                <th>Decision Type</th>
                <th>Confidence</th>
                <th>Primary ML Feature Justification</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {DECISION_LOGS.map((dec) => (
                <tr key={dec.id}>
                  <td className="text-mono text-strong" style={{ fontSize: '13px' }}>
                    {dec.id}
                  </td>
                  <td className="text-mono text-muted" style={{ fontSize: '12px' }}>
                    {dec.transactionId}
                  </td>
                  <td>
                    <div className="customer-name-cell">
                      <span className="text-strong">{dec.customerName}</span>
                      <span className="customer-email">{dec.amountFormatted}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary)' }}>
                      {dec.decisionType}
                    </span>
                  </td>
                  <td>
                    <span
                      className="num-tabular text-strong"
                      style={{
                        padding: '0.125rem 0.5rem',
                        backgroundColor: 'var(--color-surface-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px'
                      }}
                    >
                      {dec.confidenceScore}%
                    </span>
                  </td>
                  <td style={{ maxWidth: '380px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4, display: 'block' }}>
                      {dec.primaryFeature}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={dec.outcome} />
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
