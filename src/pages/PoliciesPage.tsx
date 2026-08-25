import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { POLICIES_DATA } from '../data/mockData';
import { Sliders } from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const { onOpenMobileNav } = useOutletContext<{ onOpenMobileNav: () => void }>();
  const [policies, setPolicies] = useState(POLICIES_DATA);

  const togglePolicy = (id: string) => {
    setPolicies(prev =>
      prev.map(p => p.id === id ? { ...p, isEnabled: !p.isEnabled } : p)
    );
  };

  return (
    <div>
      <PageHeader
        title="Recovery Policies"
        subtitle="Configure safety guardrails, maximum automated retry thresholds, blackout windows, and risk boundaries for Revive AI."
        onOpenMobileNav={onOpenMobileNav}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {policies.map((pol) => (
          <div
            key={pol.id}
            className="dashboard-section"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              padding: '1.25rem 1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: pol.isEnabled ? 'var(--color-primary-light)' : 'var(--color-surface-subtle)',
                  color: pol.isEnabled ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Sliders size={18} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span className="text-mono text-xs text-muted">{pol.id}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    {pol.category}
                  </span>
                </div>
                <h3 className="section-title" style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                  {pol.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '0.25rem', maxWidth: '640px' }}>
                  {pol.description}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span className="text-xs text-muted block">Configured Parameter</span>
                <span className="text-strong num-tabular" style={{ fontSize: '14px' }}>
                  {pol.thresholdValue}
                </span>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => togglePolicy(pol.id)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: pol.isEnabled ? 'var(--color-primary)' : 'var(--color-border)',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                aria-label={`Toggle ${pol.name}`}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: pol.isEnabled ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
