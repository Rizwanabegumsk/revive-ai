import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Check, ArrowDown } from 'lucide-react';
import type { RecoveryQueueItem } from '../../types';

interface DrawerProps {
  item: RecoveryQueueItem | null;
  onClose: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({ item, onClose }) => {
  const [approved, setApproved] = useState(false);

  if (!item) return null;

  const isHighConfidence = item.recoveryProbability >= 75;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-danger">Payment failed</span>
              <Link
                to={`/transactions/${item.id}`}
                onClick={onClose}
                className="text-xs text-mono"
                style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
              >
                {item.id} ↗
              </Link>
            </div>
            <h3 className="drawer-title" style={{ marginTop: '0.375rem' }}>
              {item.customerName}
            </h3>
          </div>
          <button className="btn btn-subtle btn-icon-only" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Main Financial Amount Card */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span className="text-xs text-muted uppercase" style={{ letterSpacing: '0.04em', fontWeight: 600 }}>
                Failed Amount
              </span>
              <div className="metric-value num-tabular" style={{ fontSize: '2rem', marginTop: '0.125rem' }}>
                {item.amountFormatted}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="text-xs text-muted block">Gateway Response</span>
              <span className="text-strong text-mono" style={{ fontSize: '12px', color: 'var(--color-danger)' }}>
                {item.failureReason}
              </span>
            </div>
          </div>

          {/* REVIVE AI Probability Header */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-primary-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '11px'
                  }}
                >
                  R
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                  REVIVE AI
                </span>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.125rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isHighConfidence ? 'var(--color-success-bg)' : 'var(--color-warning-bg-solid)',
                  color: isHighConfidence ? 'var(--color-success-text)' : 'var(--color-warning-text)',
                  border: `1px solid ${isHighConfidence ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`
                }}
              >
                {isHighConfidence ? 'HIGH CONFIDENCE' : 'MEDIUM CONFIDENCE'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Recovery probability
              </span>
              <span className="num-tabular" style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {item.recoveryProbability}%
              </span>
            </div>
          </div>

          {/* Recommended Strategy Visualizer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recommended strategy
            </h4>

            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.625rem'
              }}
            >
              <div
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: 'var(--color-text)',
                  letterSpacing: '0.04em'
                }}
              >
                WAIT 90 MIN
              </div>

              <ArrowDown size={16} style={{ color: 'var(--color-primary)' }} />

              <div
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.04em',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {item.recommendedAction.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Why? (Feature Justifications) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
              Why?
            </h4>

            <div
              style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--color-text)',
                lineHeight: 1.6
              }}
            >
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>•</span>
                  <span>Customer has 5 successful payments</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>•</span>
                  <span>Previous UPI payments succeeded</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>•</span>
                  <span>Bank decline appears temporary</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>•</span>
                  <span>Similar transactions recovered after delayed retry</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Policy Check */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              POLICY CHECK
            </h4>

            <div
              style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid var(--color-success-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
                fontSize: '13px',
                color: 'var(--color-success-text)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                <span>Under ₹10,000 auto-recovery limit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                <span>Retry count within limit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                <span>Action permitted</span>
              </div>
            </div>
          </div>

          {/* AI Decision Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              AI DECISION TIMELINE
            </h4>

            <div
              style={{
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                paddingLeft: '0.75rem',
                borderLeft: '2px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span className="text-mono text-muted">10:31</span>
                <span className="text-strong">Payment failed</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span className="text-mono text-muted">10:31</span>
                <span>Context analyzed</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span className="text-mono text-muted">10:31</span>
                <span>Recovery probability calculated</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span className="text-mono text-muted">10:31</span>
                <span>Strategy selected</span>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span className="text-mono text-muted">10:31</span>
                <span style={{ color: 'var(--color-success-text)', fontWeight: 600 }}>Policy approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className={`btn ${approved ? 'btn-secondary' : 'btn-primary'}`}
            style={{ minWidth: '160px' }}
            onClick={() => setApproved(!approved)}
          >
            {approved ? (
              <>
                <Check size={14} style={{ color: 'var(--color-success)' }} />
                <span>Recovery Approved</span>
              </>
            ) : (
              <span>Approve recovery</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
