import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { buildApiUrl, apiFetch } from '../config/api';
import {
  FlaskConical,
  Plus,
  RefreshCw,
  AlertCircle,
  Loader2,
  Award,
  CheckCircle2,
  Clock,
  Lightbulb,
  X
} from 'lucide-react';

interface IVariant {
  variantId: 'CONTROL' | 'CHALLENGER';
  name: string;
  strategy: string;
  waitMinutes: number;
  paymentMethod: string;
  recoveryAttempts: number;
  successfulRecoveries: number;
  recoveredAmount: number;
  recoveryRate: number;
}

interface IExperimentAnalysis {
  experiment: {
    experimentId: string;
    name: string;
    description: string;
    status: 'RUNNING' | 'PAUSED' | 'COMPLETED';
    metric: 'RECOVERY_RATE' | 'RECOVERED_AMOUNT';
    createdAt: string;
  };
  control: IVariant;
  challenger: IVariant;
  totalAttempts: number;
  totalRecovered: number;
  lift: number;
  winnerStatus: 'CHALLENGER' | 'CONTROL' | 'TIE' | 'INSUFFICIENT_DATA';
  winner: 'CHALLENGER' | 'CONTROL' | 'TIE' | null;
  recommendation: string;
  insight: string;
  minimumSampleSize: number;
  hasSufficientData: boolean;
}

export const AIExperimentsPage: React.FC = () => {
  const { onOpenMobileNav } = useOutletContext<{ onOpenMobileNav: () => void }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [experiments, setExperiments] = useState<IExperimentAnalysis[]>([]);
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null);

  // Modal State for New Experiment
  const [showModal, setShowModal] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [controlWait, setControlWait] = useState(90);
  const [controlMethod, setControlMethod] = useState('UPI');
  const [challengerWait, setChallengerWait] = useState(30);
  const [challengerMethod, setChallengerMethod] = useState('UPI');

  const fetchExperiments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildApiUrl('/api/experiments'));
      if (!res.ok) throw new Error(`API returned HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setExperiments(json.data);
        if (json.data.length > 0 && !selectedExpId) {
          setSelectedExpId(json.data[0].experiment.experimentId);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to experiments API');
    } finally {
      setLoading(false);
    }
  }, [selectedExpId]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    setCreating(true);
    try {
      const res = await apiFetch('/api/experiments', {
        method: 'POST',
        body: JSON.stringify({
          name: formName,
          description: formDesc || 'Recovery strategy optimization experiment',
          metric: 'RECOVERY_RATE',
          control: {
            name: `Control (${controlWait} Min)`,
            waitMinutes: controlWait,
            method: controlMethod
          },
          challenger: {
            name: `Challenger (${challengerWait} Min)`,
            waitMinutes: challengerWait,
            method: challengerMethod
          }
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setFormName('');
        setFormDesc('');
        await fetchExperiments();
        setSelectedExpId(json.data.experiment.experimentId);
      }
    } catch (err) {
      console.error('Error creating experiment:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (expId: string, currentStatus: string) => {
    const action = currentStatus === 'RUNNING' ? 'pause' : 'activate';
    try {
      const res = await apiFetch(`/api/experiments/${expId}/${action}`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchExperiments();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const selectedExp = experiments.find(e => e.experiment.experimentId === selectedExpId) || experiments[0];

  return (
    <div>
      <PageHeader
        title="Recovery Experiments"
        subtitle="Optimize recovery strategies using real outcome data."
        onOpenMobileNav={onOpenMobileNav}
        actions={
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>New Experiment</span>
          </button>
        }
      />

      {/* ARCHITECTURAL FLOW BANNER */}
      <div
        className="dashboard-section"
        style={{
          marginBottom: '1.5rem',
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--color-surface-subtle)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FlaskConical size={20} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                Strategy Recommendation & Intelligence Pipeline
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
                Historical Recovery Outcomes ➔ Experiments ➔ Strategy Performance ➔ Recovery Intelligence
              </p>
            </div>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-border)' }}>
            Best observed strategy: <strong>Delayed UPI retry after 90 minutes</strong>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="dashboard-section" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)', margin: '0 auto 1rem auto' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>Loading Recovery Experiments...</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Comparing recovery variant metrics and statistical confidence</div>
        </div>
      ) : error ? (
        /* ERROR STATE */
        <div className="dashboard-section" style={{ padding: '2rem', border: '1px solid var(--color-danger-border)', backgroundColor: 'var(--color-danger-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertCircle size={24} style={{ color: 'var(--color-danger)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-danger-text)' }}>Unable to Load Recovery Experiments</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-danger-text)', marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchExperiments}>
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : experiments.length === 0 ? (
        /* EMPTY STATE */
        <div className="dashboard-section" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <FlaskConical size={40} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>No recovery experiments yet</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
            Create your first strategy optimization experiment to compare retry timings and payment methods.
          </p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Create First Experiment</span>
          </button>
        </div>
      ) : (
        /* EXPERIMENTS MAIN LAYOUT */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. EXPERIMENT LIST SUMMARY */}
          <div className="dashboard-section" style={{ padding: '1.25rem 1.5rem' }}>
            <h2 className="section-title" style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>
              Active Experiments
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {experiments.map((item) => {
                const isSelected = item.experiment.experimentId === selectedExp?.experiment.experimentId;
                return (
                  <div
                    key={item.experiment.experimentId}
                    onClick={() => setSelectedExpId(item.experiment.experimentId)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="text-mono text-xs text-muted">{item.experiment.experimentId}</span>
                        <StatusBadge status={item.experiment.status} />
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '0.125rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: item.winnerStatus === 'CHALLENGER' ? 'var(--color-success-bg)' : item.winnerStatus === 'CONTROL' ? 'var(--color-surface-subtle)' : 'var(--color-warning-bg-solid)',
                          color: item.winnerStatus === 'CHALLENGER' ? 'var(--color-success-text)' : item.winnerStatus === 'CONTROL' ? 'var(--color-text)' : 'var(--color-warning-text)'
                        }}
                      >
                        {item.winnerStatus === 'CHALLENGER' ? 'CHALLENGER LEADS' : item.winnerStatus === 'CONTROL' ? 'CONTROL LEADS' : 'COLLECTING DATA'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                      {item.experiment.name}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '12px', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                      <div>
                        <span className="text-muted block text-xs">Control</span>
                        <span className="text-strong num-tabular">{item.control.recoveryRate}%</span>
                      </div>
                      <div>
                        <span className="text-muted block text-xs">Challenger</span>
                        <span className="text-strong num-tabular" style={{ color: 'var(--color-primary)' }}>{item.challenger.recoveryRate}%</span>
                      </div>
                      <div>
                        <span className="text-muted block text-xs">Measured Lift</span>
                        <span className="text-strong num-tabular" style={{ color: item.lift >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {item.lift >= 0 ? `+${item.lift}%` : `${item.lift}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. SELECTED EXPERIMENT DETAILED COMPARISON */}
          {selectedExp && (
            <div className="dashboard-section" style={{ padding: '1.75rem' }}>
              
              {/* Header Details & Action Toggle */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="text-mono text-xs text-muted">{selectedExp.experiment.experimentId}</span>
                    <StatusBadge status={selectedExp.experiment.status} />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Metric: {selectedExp.experiment.metric}</span>
                  </div>
                  <h2 className="section-title" style={{ fontSize: '1.375rem', marginTop: '0.25rem' }}>
                    {selectedExp.experiment.name}
                  </h2>
                  <p className="section-description" style={{ marginTop: '0.125rem' }}>
                    {selectedExp.experiment.description}
                  </p>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleToggleStatus(selectedExp.experiment.experimentId, selectedExp.experiment.status)}
                >
                  {selectedExp.experiment.status === 'RUNNING' ? 'Pause Experiment' : 'Activate Experiment'}
                </button>
              </div>

              {/* WINNER / DATA STATUS BANNER */}
              <div style={{ marginBottom: '1.5rem' }}>
                {selectedExp.winnerStatus === 'INSUFFICIENT_DATA' ? (
                  <div
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'var(--color-warning-bg-solid)',
                      border: '1px solid var(--color-warning-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.875rem'
                    }}
                  >
                    <Clock size={20} style={{ color: 'var(--color-warning)', marginTop: '0.125rem', flexShrink: 0 }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-warning-text)' }}>
                          COLLECTING DATA
                        </span>
                        <span className="text-xs text-muted">
                          Sample size: <strong>{selectedExp.totalAttempts} / {selectedExp.minimumSampleSize} minimum outcomes required</strong>
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-warning-text)', marginTop: '0.25rem', lineHeight: 1.45 }}>
                        More recovery outcomes are required before selecting a winning strategy. Statistical safety rules prevent premature selection on small samples.
                      </p>
                    </div>
                  </div>
                ) : selectedExp.winnerStatus === 'CHALLENGER' ? (
                  <div
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'var(--color-success-bg)',
                      border: '1px solid var(--color-success-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.875rem'
                    }}
                  >
                    <Award size={22} style={{ color: 'var(--color-success)', marginTop: '0.125rem', flexShrink: 0 }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-success-text)' }}>
                          CHALLENGER LEADS
                        </span>
                        <span className="text-xs text-muted" style={{ color: 'var(--color-success-text)' }}>
                          Statistically Significant Result ({selectedExp.totalAttempts} samples evaluated)
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-success-text)', marginTop: '0.25rem', fontWeight: 600 }}>
                        Recovery rate is {selectedExp.lift}% higher than Control. Challenger variant ({selectedExp.challenger.waitMinutes} minutes delay) recovered more payments.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.875rem'
                    }}
                  >
                    <CheckCircle2 size={20} style={{ color: 'var(--color-text-secondary)', marginTop: '0.125rem', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text)' }}>
                        NO STATISTICAL DIFFERENCE
                      </span>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        Control and Challenger variants perform similarly across current payment sample datasets.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SIDE-BY-SIDE VARIANT COMPARISON */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* CONTROL VARIANT CARD */}
                <div
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>
                      CONTROL VARIANT (Baseline)
                    </span>
                    <span className="text-mono text-xs text-muted">CONTROL</span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>{selectedExp.control.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      {selectedExp.control.strategy}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', padding: '0.875rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', fontSize: '13px' }}>
                    <div>
                      <span className="text-muted block text-xs">Recovery Rate</span>
                      <span className="text-strong num-tabular" style={{ fontSize: '1.25rem' }}>{selectedExp.control.recoveryRate}%</span>
                    </div>
                    <div>
                      <span className="text-muted block text-xs">Recovered</span>
                      <span className="text-strong num-tabular" style={{ fontSize: '1rem' }}>₹{selectedExp.control.recoveredAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-xs">Attempts</span>
                      <span className="text-strong num-tabular" style={{ fontSize: '1rem' }}>{selectedExp.control.recoveryAttempts}</span>
                    </div>
                  </div>
                </div>

                {/* CHALLENGER VARIANT CARD */}
                <div
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'var(--color-primary-light)',
                    border: '1px solid var(--color-primary-border)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-primary)' }}>
                      CHALLENGER VARIANT (Optimized)
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '0.125rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-primary)',
                        color: '#ffffff'
                      }}
                    >
                      +{selectedExp.lift}% LIFT
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>{selectedExp.challenger.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      {selectedExp.challenger.strategy}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', padding: '0.875rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-border)', fontSize: '13px' }}>
                    <div>
                      <span className="text-muted block text-xs">Recovery Rate</span>
                      <span className="text-strong num-tabular" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>{selectedExp.challenger.recoveryRate}%</span>
                    </div>
                    <div>
                      <span className="text-muted block text-xs">Recovered</span>
                      <span className="text-strong num-tabular" style={{ fontSize: '1rem', color: 'var(--color-success)' }}>₹{selectedExp.challenger.recoveredAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-xs">Attempts</span>
                      <span className="text-strong num-tabular" style={{ fontSize: '1rem' }}>{selectedExp.challenger.recoveryAttempts}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* EXPERIMENT INSIGHTS */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                  <Lightbulb size={18} style={{ color: 'var(--color-primary)' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Experiment Insight</h4>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
                  {selectedExp.insight}
                </p>
              </div>

            </div>
          )}

        </div>
      )}

      {/* CREATE NEW EXPERIMENT MODAL */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '540px',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FlaskConical size={20} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' }}>Create Recovery Experiment</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateExperiment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Experiment Name
                </label>
                <input
                  type="text"
                  className="input-search"
                  placeholder="e.g. UPI Retry Cadence Optimization"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                  Description / Hypothesis
                </label>
                <textarea
                  className="input-search"
                  placeholder="e.g. Compare 90-minute vs 30-minute delay before initiating UPI retry."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', padding: '0.5rem 0.75rem' }}
                />
              </div>

              {/* Control Setup */}
              <div style={{ padding: '0.875rem', backgroundColor: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  CONTROL VARIANT (Baseline)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Wait Minutes</label>
                    <input
                      type="number"
                      className="input-search"
                      value={controlWait}
                      onChange={(e) => setControlWait(Number(e.target.value))}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Method</label>
                    <select
                      className="select-control"
                      value={controlMethod}
                      onChange={(e) => setControlMethod(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="UPI">UPI</option>
                      <option value="CARD">CARD</option>
                      <option value="NETBANKING">NETBANKING</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Challenger Setup */}
              <div style={{ padding: '0.875rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-border)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', display: 'block', marginBottom: '0.5rem' }}>
                  CHALLENGER VARIANT (New Variant)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Wait Minutes</label>
                    <input
                      type="number"
                      className="input-search"
                      value={challengerWait}
                      onChange={(e) => setChallengerWait(Number(e.target.value))}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Method</label>
                    <select
                      className="select-control"
                      value={challengerMethod}
                      onChange={(e) => setChallengerMethod(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="UPI">UPI</option>
                      <option value="CARD">CARD</option>
                      <option value="NETBANKING">NETBANKING</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {creating && <Loader2 size={14} className="animate-spin" />}
                  <span>{creating ? 'Creating...' : 'Launch Experiment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
