import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowDown,
  Check,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  Play,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { buildApiUrl, apiFetch } from '../config/api';

interface EngineSignalItem {
  name: string;
  value: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface PolicyCheckItem {
  name: string;
  passed: boolean;
  description: string;
}

interface PolicyDecisionObject {
  status: 'APPROVED' | 'BLOCKED' | 'MANUAL_REVIEW';
  allowed: boolean;
  reasons: string[];
  checks: PolicyCheckItem[];
  policyVersion: string;
}

interface PaymentDetailResponse {
  payment: {
    paymentId: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    failureReason?: string;
    gateway: string;
    retryCount: number;
    recovered?: boolean;
    recoveredAmount?: number;
    recoveredAt?: string;
    createdAt?: string;
    customerId?: {
      customerId: string;
      name: string;
      email: string;
      totalPayments: number;
      successfulPayments: number;
      recoveredPayments: number;
      preferredMethod: string;
    };
  };
  decision: {
    decisionId: string;
    probability: number;
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendation: string;
    recommendedAction?: string;
    recommendedMethod: string;
    delayMinutes: number;
    reasoning: string[];
    signals?: EngineSignalItem[];
    modelVersion: string;
    policyStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED' | 'MANUAL_REVIEW';
    status: string;
    policyChecks?: { rule?: string; name?: string; passed: boolean; explanation?: string; description?: string }[];
    policyReason?: string;
  };
  policyDecision?: PolicyDecisionObject;
  outcome?: {
    outcomeId: string;
    action: string;
    executionStatus: string;
    recovered: boolean;
    recoveredAmount?: number;
    amountRecovered?: number;
    method?: string;
    message?: string;
    executedAt?: string;
  };
}

interface TimelineEvent {
  _id: string;
  eventType: string;
  message: string;
  timestamp: string;
}

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const targetId = id || 'RV-28491';

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaymentDetailResponse | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const [approvedState, setApprovedState] = useState<boolean>(false);
  const [humanReviewState, setHumanReviewState] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [executionStep, setExecutionStep] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [showWhyReasoning, setShowWhyReasoning] = useState<boolean>(true);

  // Fetch payment detail & decision data from API
  const fetchPaymentData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(buildApiUrl(`/api/payments/${targetId}`));
      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}: Failed to load payment #${targetId}`);
      }

      const json: PaymentDetailResponse = await res.json();
      setData(json);

      if (json.payment.status === 'RECOVERED' || json.payment.recovered || json.outcome?.recovered) {
        setApprovedState(true);
      }

      try {
        const eventsRes = await fetch(buildApiUrl(`/api/recovery/events/${targetId}`));
        if (eventsRes.ok) {
          const eventsJson = await eventsRes.json();
          setEvents(eventsJson);
        }
      } catch (err) {
        console.warn('Could not fetch recovery events timeline:', err);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to REVIVE AI backend API');
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  // Execute Simulated Recovery via Backend API (POST /api/recovery/execute)
  const handleApproveRecovery = async () => {
    setShowConfirmModal(false);
    setExecuting(true);
    setExecutionError(null);

    // Interactive step simulation for clear demo visibility
    setExecutionStep(1); // Recovery initiated
    await new Promise(r => setTimeout(r, 400));
    setExecutionStep(2); // Policy authorization verified
    await new Promise(r => setTimeout(r, 400));
    setExecutionStep(3); // UPI retry simulated
    await new Promise(r => setTimeout(r, 400));
    setExecutionStep(4); // Payment response received

    try {
      const res = await apiFetch('/api/recovery/execute', {
        method: 'POST',
        body: JSON.stringify({ paymentId: targetId })
      });

      const json = await res.json();

      if (res.ok && (json.success || json.status === 'SUCCESS' || json.status === 'ALREADY_RECOVERED')) {
        setApprovedState(true);
        await fetchPaymentData();
      } else {
        const errMsg = json.reason || json.message || 'Recovery attempt failed';
        setExecutionError(errMsg);
      }
    } catch (err) {
      console.error('Execution error:', err);
      setExecutionError(err instanceof Error ? err.message : 'Recovery attempt failed');
    } finally {
      setExecuting(false);
      setExecutionStep(0);
    }
  };

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="transaction-detail-container">
        <div style={{ marginBottom: '1rem' }}>
          <Link
            to="/transactions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={15} />
            <span>Transactions</span>
          </Link>
        </div>

        <div
          className="dashboard-section"
          style={{
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
          }}
        >
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
            Loading Payment #{targetId} Context...
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Evaluating Revive Recovery Engine calculations & Safety Policy rules
          </div>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE (WITH RETRY BUTTON)
  if (error || !data) {
    return (
      <div className="transaction-detail-container">
        <div style={{ marginBottom: '1rem' }}>
          <Link
            to="/transactions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={15} />
            <span>Transactions</span>
          </Link>
        </div>

        <div
          className="dashboard-section"
          style={{
            padding: '2.5rem 2rem',
            border: '1px solid var(--color-danger-border)',
            backgroundColor: 'var(--color-danger-bg)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={24} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '0.125rem' }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-danger-text)' }}>
                Failed to Load Transaction Context
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-danger-text)', marginTop: '0.25rem', lineHeight: 1.45 }}>
                {error || `Payment #${targetId} was not found on the backend API server.`}
              </p>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                API Endpoint: <code>{buildApiUrl(`/api/payments/${targetId}`)}</code>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={fetchPaymentData}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px' }}
          >
            <RefreshCw size={15} />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  const { payment, decision, policyDecision, outcome } = data;
  const customer = payment.customerId;

  const formattedAmount = `₹${payment.amount.toLocaleString('en-IN')}`;

  const currentPolicyStatus = policyDecision?.status || (decision.policyStatus === 'APPROVED' ? 'APPROVED' : decision.policyStatus === 'MANUAL_REVIEW' ? 'MANUAL_REVIEW' : 'BLOCKED');
  const policyChecksList = policyDecision?.checks || (decision.policyChecks?.map(c => ({
    name: c.rule || c.name || 'Rule',
    passed: c.passed,
    description: c.explanation || c.description || ''
  })) || []);

  const isRecovered = payment.status === 'RECOVERED' || payment.recovered || outcome?.recovered || approvedState;

  return (
    <div className="transaction-detail-container">
      {/* Back Navigation Breadcrumb */}
      <div style={{ marginBottom: '1rem' }}>
        <Link
          to="/transactions"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={15} />
          <span>Transactions</span>
        </Link>
      </div>

      {/* HEADER SECTION */}
      <div
        className="dashboard-section"
        style={{
          marginBottom: '1.5rem',
          padding: '1.5rem 1.75rem',
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 className="page-title" style={{ fontSize: '1.625rem' }}>
                Payment #{payment.paymentId}
              </h1>
              <StatusBadge status={isRecovered ? 'RECOVERED' : payment.status} />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Gateway: {payment.gateway} • Failure: <strong style={{ color: isRecovered ? 'var(--color-success)' : 'var(--color-danger)' }}>{payment.failureReason || 'Temporary bank server timeout'}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="text-xs text-muted uppercase" style={{ letterSpacing: '0.04em', fontWeight: 600 }}>
              Payment Amount
            </span>
            <div className="metric-value num-tabular" style={{ fontSize: '2.25rem', color: 'var(--color-text)', lineHeight: 1.1 }}>
              {formattedAmount}
            </div>
          </div>
        </div>

        <hr style={{ margin: '1.25rem 0 1rem 0', borderColor: 'var(--color-border-subtle)', borderWidth: '1px 0 0 0' }} />

        {/* Four Payment Attributes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            minWidth: 0
          }}
        >
          <div>
            <span className="text-xs text-muted block">Original payment method</span>
            <span className="text-strong" style={{ fontSize: '14px', marginTop: '0.125rem', display: 'block' }}>
              {payment.method}
            </span>
          </div>

          <div>
            <span className="text-xs text-muted block">Failure reason</span>
            <span className="text-strong text-mono" style={{ fontSize: '13px', color: isRecovered ? 'var(--color-success)' : 'var(--color-danger)', marginTop: '0.125rem', display: 'block', wordBreak: 'break-word' }}>
              {isRecovered ? 'Recovered via simulated retry' : (payment.failureReason || 'Bank gateway error')}
            </span>
          </div>

          <div>
            <span className="text-xs text-muted block">Recommended recovery method</span>
            <span className="text-strong" style={{ fontSize: '14px', color: 'var(--color-primary)', marginTop: '0.125rem', display: 'block' }}>
              {decision.recommendedMethod}
            </span>
          </div>

          <div>
            <span className="text-xs text-muted block">Execution mode</span>
            <span
              className="text-strong"
              style={{
                fontSize: '12px',
                marginTop: '0.125rem',
                display: 'inline-block',
                padding: '0.125rem 0.5rem',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)'
              }}
            >
              Simulation Mode
            </span>
          </div>
        </div>
      </div>

      {/* DESKTOP TWO-COLUMN CONTENT LAYOUT */}
      <div className="detail-two-col">

        {/* LEFT COLUMN: AI Recovery Opportunity, AI Recommendation, Policy & Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

          {/* 1. RECOVERY OPPORTUNITY CARD */}
          <div
            className="dashboard-section"
            style={{
              padding: '1.5rem 1.75rem',
              border: '1px solid var(--color-primary-border)',
              backgroundColor: 'var(--color-surface)',
              minWidth: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 className="section-title" style={{ fontSize: '1.125rem' }}>
                  Recovery Opportunity
                </h2>
                <p className="section-description">
                  Recovery probability calculated by <strong>Revive Recovery Engine · v1</strong>
                </p>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0.25rem 0.625rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: decision.confidence === 'HIGH' ? 'var(--color-success-bg)' : decision.confidence === 'MEDIUM' ? 'var(--color-warning-bg-solid)' : 'var(--color-danger-bg)',
                  color: decision.confidence === 'HIGH' ? 'var(--color-success-text)' : decision.confidence === 'MEDIUM' ? 'var(--color-warning-text)' : 'var(--color-danger-text)',
                  border: `1px solid ${decision.confidence === 'HIGH' ? 'var(--color-success-border)' : decision.confidence === 'MEDIUM' ? 'var(--color-warning-border)' : 'var(--color-danger-border)'}`
                }}
              >
                {decision.confidence} CONFIDENCE
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                padding: '1.25rem',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-primary-border)',
                alignItems: 'center',
                minWidth: 0
              }}
            >
              {/* Score Display */}
              <div>
                <span className="text-xs uppercase text-muted" style={{ fontWeight: 600, letterSpacing: '0.04em', color: 'var(--color-primary)' }}>
                  Recovery probability
                </span>
                <div className="metric-value num-tabular" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                  {animatedProbability}
                </div>
                <span className="text-xs text-muted" style={{ marginTop: '0.375rem', display: 'block', fontWeight: 600 }}>
                  {probabilityPercent >= 75 ? 'Strong candidate for recovery' : probabilityPercent >= 50 ? 'Moderate recovery opportunity' : 'Low recovery probability'}
                </span>
              </div>

              {/* Strategy Visual Flow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <span className="text-xs uppercase text-muted" style={{ fontWeight: 600, letterSpacing: '0.04em', alignSelf: 'flex-start' }}>
                  AI Strategy Recommendation
                </span>
                <div
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '13px',
                    textAlign: 'center',
                    color: 'var(--color-text)',
                    letterSpacing: '0.04em',
                    boxSizing: 'border-box'
                  }}
                >
                  {decision.delayMinutes > 0 ? `WAIT ${decision.delayMinutes} MINUTES` : 'IMMEDIATE ACTION'}
                </div>

                <ArrowDown size={16} style={{ color: 'var(--color-primary)' }} />

                <div
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '13px',
                    textAlign: 'center',
                    letterSpacing: '0.04em',
                    boxShadow: 'var(--shadow-sm)',
                    boxSizing: 'border-box'
                  }}
                >
                  RETRY VIA {decision.recommendedMethod}
                </div>
              </div>
            </div>
          </div>

          {/* 2. AI RECOMMENDATION & WHY THIS DECISION */}
          <div className="dashboard-section" style={{ padding: '1.5rem 1.75rem', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 className="section-title">AI Recommendation</h2>
                <p className="section-description">
                  Recommended by <strong>Revive Recovery Engine · v1</strong>
                </p>
              </div>

              <button
                onClick={() => setShowWhyReasoning(!showWhyReasoning)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <span>Why this decision?</span>
                {showWhyReasoning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--color-text)',
                marginBottom: showWhyReasoning ? '1rem' : 0
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                Strategy: {decision.recommendation}
              </div>
              <span className="text-xs text-muted">
                Method: <strong>{decision.recommendedMethod}</strong> • Timing delay: <strong>{decision.delayMinutes} minutes</strong>
              </span>
            </div>

            {/* EXPANDABLE REASONING & SIGNALS */}
            {showWhyReasoning && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                <div>
                  <span className="text-xs uppercase text-muted block" style={{ fontWeight: 600, letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    Engine Signals & Attribution
                  </span>
                  <div className="evidence-grid">
                    {decision.signals && decision.signals.length > 0 ? (
                      decision.signals.map((sig, idx) => (
                        <div key={idx} className="evidence-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span className="evidence-label">{sig.name}</span>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '0.125rem 0.375rem',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: sig.impact === 'positive' ? 'var(--color-success-bg)' : sig.impact === 'negative' ? 'var(--color-danger-bg)' : 'var(--color-surface-subtle)',
                                color: sig.impact === 'positive' ? 'var(--color-success-text)' : sig.impact === 'negative' ? 'var(--color-danger-text)' : 'var(--color-text-secondary)'
                              }}
                            >
                              {sig.impact}
                            </span>
                          </div>
                          <span className="evidence-val" style={{ fontWeight: 600 }}>{sig.value}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="evidence-card">
                          <span className="evidence-label">Customer history</span>
                          <span className="evidence-val">
                            {customer ? `${customer.successfulPayments} of ${customer.totalPayments} previous payments successful` : '5 of 6 previous payments successful'}
                          </span>
                        </div>
                        <div className="evidence-card">
                          <span className="evidence-label">Payment method history</span>
                          <span className="evidence-val">
                            Previous {customer?.preferredMethod || 'UPI'} payments succeeded
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs uppercase text-muted block" style={{ fontWeight: 600, letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    Reasoning & Historical Attribution
                  </span>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--color-text-secondary)' }}>
                    {decision.reasoning && decision.reasoning.length > 0 ? (
                      decision.reasoning.map((item, idx) => (
                        <li key={idx} style={{ lineHeight: 1.45 }}>{item}</li>
                      ))
                    ) : (
                      <>
                        <li>Customer has a strong payment success history (83% historical success rate)</li>
                        <li>Previous UPI payments succeeded for this merchant profile</li>
                        <li>Failure reason is temporary server timeout eligible for auto-retry</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 3. POLICY CHECK */}
          <div className="dashboard-section" style={{ padding: '1.5rem 1.75rem', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 className="section-title">Policy Check</h2>
                <p className="section-description">
                  Deterministic merchant safety validation · <strong>Safety Policy · v1</strong>
                </p>
              </div>

              <div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.25rem 0.625rem',
                    backgroundColor: currentPolicyStatus === 'APPROVED' ? 'var(--color-success-bg)' : currentPolicyStatus === 'MANUAL_REVIEW' ? 'var(--color-warning-bg-solid)' : 'var(--color-danger-bg)',
                    border: `1px solid ${currentPolicyStatus === 'APPROVED' ? 'var(--color-success-border)' : currentPolicyStatus === 'MANUAL_REVIEW' ? 'var(--color-warning-border)' : 'var(--color-danger-border)'}`,
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: currentPolicyStatus === 'APPROVED' ? 'var(--color-success-text)' : currentPolicyStatus === 'MANUAL_REVIEW' ? 'var(--color-warning-text)' : 'var(--color-danger-text)'
                  }}
                >
                  {currentPolicyStatus === 'APPROVED' ? <Check size={14} /> : currentPolicyStatus === 'MANUAL_REVIEW' ? <AlertCircle size={14} /> : <X size={14} />}
                  <span>
                    {currentPolicyStatus === 'APPROVED' ? 'APPROVED FOR RECOVERY' : currentPolicyStatus === 'MANUAL_REVIEW' ? 'MANUAL REVIEW REQUIRED' : 'BLOCKED BY SAFETY POLICY'}
                  </span>
                </span>
              </div>
            </div>

            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: currentPolicyStatus === 'APPROVED' ? 'var(--color-success-bg)' : currentPolicyStatus === 'MANUAL_REVIEW' ? 'var(--color-warning-bg-solid)' : 'var(--color-danger-bg)',
                border: `1px solid ${currentPolicyStatus === 'APPROVED' ? 'var(--color-success-border)' : currentPolicyStatus === 'MANUAL_REVIEW' ? 'var(--color-warning-border)' : 'var(--color-danger-border)'}`,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '13px',
                color: currentPolicyStatus === 'APPROVED' ? 'var(--color-success-text)' : currentPolicyStatus === 'MANUAL_REVIEW' ? 'var(--color-warning-text)' : 'var(--color-danger-text)',
                marginBottom: '1rem'
              }}
            >
              {policyChecksList && policyChecksList.length > 0 ? (
                policyChecksList.map((chk, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 500 }}>
                    {chk.passed ? (
                      <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    ) : (
                      <X size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                    )}
                    <span>{chk.description || chk.name}</span>
                  </div>
                ))
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 500 }}>
                    <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <span>Automatic recovery enabled</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 500 }}>
                    <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <span>{formattedAmount} within ₹10,000 auto-recovery limit</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 500 }}>
                    <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <span>Retry count: {payment.retryCount} / 2</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 500 }}>
                    <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <span>{decision.recommendedMethod} recovery permitted</span>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              <ShieldCheck size={15} style={{ color: 'var(--color-primary)' }} />
              <span><strong>Safety Principle:</strong> AI recommends strategy. Policy independently authorizes execution.</span>
            </div>
          </div>

          {/* 4. RECOVERY ACTION CONTROLS & SIMULATION EXECUTION */}
          <div className="dashboard-section" style={{ padding: '1.5rem 1.75rem', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 className="section-title">
                Recovery Action
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0.125rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                SIMULATION MODE
              </span>
            </div>

            {/* Execution Failure Notice if any */}
            {executionError && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-danger-bg)',
                  border: '1px solid var(--color-danger-border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '13px',
                  color: 'var(--color-danger-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem'
                }}
              >
                <X size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                <div>
                  <strong>Recovery attempt failed:</strong> {executionError}
                </div>
              </div>
            )}

            {/* Action States */}
            {isRecovered ? (
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--color-success-bg)',
                  border: '1px solid var(--color-success-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}
              >
                <Check size={24} style={{ color: 'var(--color-success)', marginTop: '0.125rem', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-success-text)' }}>
                      ✓ Recovery Successful
                    </h4>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-success-text)', opacity: 0.9 }}>
                      Simulation Mode
                    </span>
                  </div>

                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success-text)', margin: '0.375rem 0 0.25rem 0' }}>
                    {formattedAmount} recovered
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--color-success-text)', lineHeight: 1.45 }}>
                    Payment recovered via {decision.recommendedMethod}. RecoveryOutcome document recorded in MongoDB.
                  </p>

                  <div style={{ marginTop: '0.75rem', paddingTop: '0.625rem', borderTop: '1px solid var(--color-success-border)', fontSize: '12px', color: 'var(--color-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <span><strong>Simulation Mode</strong> · No real payment was processed.</span>
                    {outcome?.executedAt && (
                      <span>Executed: {new Date(outcome.executedAt).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : executing ? (
              /* INTERACTIVE TIMELINE ANIMATION DURING EXECUTION */
              <div
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--color-primary-light)',
                  border: '1px solid var(--color-primary-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)' }}>
                    Executing recovery simulation...
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: executionStep >= 1 ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                    <Check size={14} />
                    <span>Recovery initiated for payment #{payment.paymentId}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: executionStep >= 2 ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                    <Check size={14} />
                    <span>Policy authorization verified (APPROVED)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: executionStep >= 3 ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                    <Check size={14} />
                    <span>{decision.recommendedMethod} gateway retry simulated</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: executionStep >= 4 ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                    <Check size={14} />
                    <span>Payment response received</span>
                  </div>
                </div>
              </div>
            ) : currentPolicyStatus === 'BLOCKED' ? (
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-danger-bg)',
                  border: '1px solid var(--color-danger-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem'
                }}
              >
                <X size={20} style={{ color: 'var(--color-danger)', marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-danger-text)' }}>
                    Recovery blocked by safety policy
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-danger-text)', marginTop: '0.25rem', lineHeight: 1.45 }}>
                    {policyDecision?.reasons.join('. ') || decision.policyReason || 'Transaction violated one or more merchant safety rules.'}
                  </p>
                  <span className="text-xs text-muted block" style={{ marginTop: '0.375rem' }}>
                    Automatic execution disabled per merchant safety protocol.
                  </span>
                </div>
              </div>
            ) : currentPolicyStatus === 'MANUAL_REVIEW' || humanReviewState ? (
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
                <AlertCircle size={20} style={{ color: 'var(--color-warning)', marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-warning-text)' }}>
                    Manual Review Required
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-warning-text)', marginTop: '0.25rem', lineHeight: 1.45 }}>
                    {policyDecision?.reasons.join('. ') || 'Transaction escalated to merchant operations team for manual verification.'}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.625rem 1.375rem', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                    onClick={() => setShowConfirmModal(true)}
                  >
                    <Play size={15} />
                    <span>Execute Recovery</span>
                  </button>

                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.625rem 1.25rem', fontSize: '13px' }}
                    onClick={() => setHumanReviewState(true)}
                  >
                    <UserCheck size={15} />
                    <span>Send to human review</span>
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <strong>Simulation Mode</strong> · No real payment will be processed.
                </div>
              </div>
            )}
          </div>

          {/* 5. RECOVERY OUTCOME DISPLAY */}
          {outcome && (
            <div className="dashboard-section" style={{ padding: '1.5rem 1.75rem', minWidth: 0 }}>
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>
                Recovery Outcome
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: '13px'
                }}
              >
                <div>
                  <span className="text-muted block text-xs">Execution Status</span>
                  <span className="text-strong" style={{ color: outcome.recovered ? 'var(--color-success)' : 'var(--color-text)' }}>
                    {outcome.executionStatus}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Amount Recovered</span>
                  <span className="text-strong num-tabular" style={{ color: 'var(--color-success)', fontSize: '14px' }}>
                    ₹{(outcome.amountRecovered || outcome.recoveredAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Recovery Method</span>
                  <span className="text-strong">{outcome.method || decision.recommendedMethod}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Executed Timestamp</span>
                  <span className="text-strong num-tabular">
                    {outcome.executedAt ? new Date(outcome.executedAt).toLocaleString() : 'Just now'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Customer Context & Decision Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

          {/* CUSTOMER CONTEXT PANEL */}
          <div className="dashboard-section" style={{ padding: '1.5rem', minWidth: 0 }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
              Customer Context
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                  {customer ? customer.name : 'Aisha Khan'}
                </h3>
                <span className="text-xs text-muted block">{customer ? customer.email : 'aisha@example.com'}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1rem',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  border: '1px solid var(--color-border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="text-muted text-xs">Total payments</span>
                  <span className="text-strong num-tabular">{customer ? customer.totalPayments : 6}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="text-muted text-xs">Successful payments</span>
                  <span className="text-strong num-tabular" style={{ color: 'var(--color-success)' }}>
                    {customer ? customer.successfulPayments : 5}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="text-muted text-xs">Recovered payments</span>
                  <span className="text-strong num-tabular">
                    {customer ? (customer.recoveredPayments + (isRecovered ? 1 : 0)) : 1}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                  <span className="text-muted text-xs">Preferred payment method</span>
                  <span className="text-strong" style={{ color: 'var(--color-primary)' }}>
                    {customer ? customer.preferredMethod : 'UPI'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DECISION TIMELINE */}
          <div className="dashboard-section" style={{ padding: '1.5rem', minWidth: 0 }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
              Decision Timeline
            </h2>

            <div className="timeline-vertical">
              {events && events.length > 0 ? (
                events.map((evt: any, idx: number) => (
                  <div key={evt._id || idx} className="timeline-item timeline-item-animated" style={{ animationDelay: `${idx * 120}ms` }}>
                    <span className="timeline-time">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <div className="timeline-content">
                      <span className="timeline-title">{evt.eventType.replace(/_/g, ' ')}</span>
                      <span className="timeline-desc">{evt.message}</span>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="timeline-item">
                    <span className="timeline-time">10:31:04</span>
                    <div className="timeline-content">
                      <span className="timeline-title">Payment failed</span>
                      <span className="timeline-desc">{payment.failureReason || 'Temporary bank server timeout'}</span>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <span className="timeline-time">10:31:05</span>
                    <div className="timeline-content">
                      <span className="timeline-title">Recovery opportunity detected</span>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <span className="timeline-time">10:31:06</span>
                    <div className="timeline-content">
                      <span className="timeline-title">AI assessment generated</span>
                      <span className="timeline-desc text-strong" style={{ color: 'var(--color-primary)' }}>{probabilityPercent}% recovery probability</span>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <span className="timeline-time">10:31:07</span>
                    <div className="timeline-content">
                      <span className="timeline-title">Policy approved recovery</span>
                      <span className="timeline-desc text-strong" style={{ color: currentPolicyStatus === 'APPROVED' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {currentPolicyStatus}
                      </span>
                    </div>
                  </div>

                  {isRecovered && (
                    <div className="timeline-item">
                      <span className="timeline-time">10:31:09</span>
                      <div className="timeline-content">
                        <span className="timeline-title">Recovery executed</span>
                        <span className="timeline-desc" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          ₹{payment.amount.toLocaleString('en-IN')} recovered via {decision.recommendedMethod}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      {showConfirmModal && (
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
              maxWidth: '460px',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Execute simulated recovery?
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
                border: '1px solid var(--color-border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Payment ID:</span>
                <span className="text-strong text-mono">{payment.paymentId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Amount:</span>
                <span className="text-strong num-tabular" style={{ color: 'var(--color-text)' }}>{formattedAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Method:</span>
                <span className="text-strong">{decision.recommendedMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Action:</span>
                <span className="text-strong">Wait {decision.delayMinutes} min → Retry</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Policy Status:</span>
                <span className="text-strong" style={{ color: 'var(--color-success)' }}>{currentPolicyStatus}</span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              This will run a backend recovery simulation and update MongoDB database metrics. No real payment gateway request will be executed.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApproveRecovery}
              >
                Execute Recovery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
