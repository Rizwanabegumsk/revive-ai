import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricStrip } from '../components/common/MetricStrip';
import type { MetricItemData } from '../components/common/MetricStrip';
import { RecoveryChart } from '../components/dashboard/RecoveryChart';
import { StatusBadge } from '../components/common/StatusBadge';
import { RefreshCw, AlertCircle, Loader2, ChevronRight, Zap, ShieldCheck } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface IAnalyticsOverview {
  totalRevenueAtRisk: number;
  totalRevenueRecovered: number;
  recoveryRate: number;
  failedPaymentCount: number;
  recoveredPaymentCount: number;
  averageRecoveryProbability: number;
  aiAssistedRecoveryCount: number;
  averageRecoveredAmount: number;
}

interface ITrendPoint {
  date: string;
  failedAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
  totalFailedCount: number;
}

interface IMethodMetric {
  method: string;
  attempts: number;
  successfulRecoveries: number;
  recoveredAmount: number;
  successRate: number;
}

interface IFailureMetric {
  failureReason: string;
  paymentCount: number;
  amountAtRisk: number;
  recoverableAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
}

interface ITopRecoverableItem {
  paymentId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  failureReason: string;
  recoveryProbability: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedMethod: string;
  policyStatus: 'APPROVED' | 'BLOCKED' | 'MANUAL_REVIEW';
}

export const DashboardPage: React.FC = () => {
  const { onOpenMobileNav } = useOutletContext<{ onOpenMobileNav: () => void }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<IAnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<ITrendPoint[]>([]);
  const [methods, setMethods] = useState<IMethodMetric[]>([]);
  const [failures, setFailures] = useState<IFailureMetric[]>([]);
  const [topRecoverable, setTopRecoverable] = useState<ITopRecoverableItem[]>([]);

  // Fetch all analytics API endpoints
  const fetchAnalyticsData = useCallback(async () => {
    setError(null);
    try {
      const [ovRes, trRes, meRes, faRes, topRes] = await Promise.all([
        fetch(buildApiUrl('/api/analytics/overview')),
        fetch(buildApiUrl('/api/analytics/trends')),
        fetch(buildApiUrl('/api/analytics/methods')),
        fetch(buildApiUrl('/api/analytics/failures')),
        fetch(buildApiUrl('/api/analytics/top-recoverable'))
      ]);

      if (!ovRes.ok) throw new Error(`Analytics API returned HTTP ${ovRes.status}`);

      const [ovJson, trJson, meJson, faJson, topJson] = await Promise.all([
        ovRes.json(),
        trRes.json(),
        meRes.json(),
        faRes.json(),
        topRes.json()
      ]);

      if (ovJson.success) setOverview(ovJson.data);
      if (trJson.success) setTrends(trJson.data);
      if (meJson.success) setMethods(meJson.data);
      if (faJson.success) setFailures(faJson.data);
      if (topJson.success) setTopRecoverable(topJson.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data from API');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  // Build core KPI metric strip items
  const metricsData: MetricItemData[] = overview ? [
    {
      id: 'atRisk',
      title: 'Revenue at Risk',
      value: `₹${overview.totalRevenueAtRisk.toLocaleString('en-IN')}`,
      subtitle: `across ${overview.failedPaymentCount} failed payment attempts`
    },
    {
      id: 'recovered',
      title: 'Recovered Revenue',
      value: `₹${overview.totalRevenueRecovered.toLocaleString('en-IN')}`,
      trend: `${overview.recoveryRate}%`,
      trendPositive: true,
      subtitle: 'Automated recovery outcome'
    },
    {
      id: 'rate',
      title: 'Recovery Rate',
      value: `${overview.recoveryRate}%`,
      trend: '+4.1%',
      trendPositive: true,
      subtitle: `avg AI probability: ${overview.averageRecoveryProbability}%`
    },
    {
      id: 'decisions',
      title: 'AI-Assisted Recoveries',
      value: `${overview.aiAssistedRecoveryCount}`,
      subtitle: 'Policy verified'
    }
  ] : [];

  return (
    <div>
      <PageHeader
        title="Revenue Recovery Command Center"
        subtitle="Real-time AI revenue recovery analytics, gateway failure intelligence, and automated strategy performance."
        onOpenMobileNav={onOpenMobileNav}
      />

      {/* Control Bar: Refresh Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          <ShieldCheck size={16} style={{ color: 'var(--color-primary)' }} />
          <span>Live Revenue Intelligence</span>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Analytics'}</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="dashboard-section" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)', margin: '0 auto 1rem auto' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>Loading Revenue Recovery Command Center...</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Aggregating real-time transaction data</div>
        </div>
      ) : error ? (
        /* Error State with Retry */
        <div className="dashboard-section" style={{ padding: '2rem', border: '1px solid var(--color-danger-border)', backgroundColor: 'var(--color-danger-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertCircle size={24} style={{ color: 'var(--color-danger)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-danger-text)' }}>Failed to Load Recovery Analytics</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-danger-text)', marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={handleRefresh}>
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : (
        <>
          {/* Financial Metric Summary Strip */}
          <MetricStrip metrics={metricsData} />

          {/* Revenue Recovery Trend Chart */}
          <div style={{ marginBottom: '1.5rem' }}>
            <RecoveryChart data={trends} />
          </div>

          {/* Middle Operational Grid: Recovery Method & Failure Intelligence */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            {/* RECOVERY METHOD PERFORMANCE */}
            <div className="dashboard-section" style={{ minWidth: 0 }}>
              <div className="section-header" style={{ marginBottom: '1rem' }}>
                <div className="section-title-group">
                  <h2 className="section-title">Recovery Performance by Method</h2>
                  <p className="section-description">Conversion rate and revenue yield grouped by payment channel</p>
                </div>
              </div>

              <div className="queue-table-container">
                <table className="queue-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Attempts</th>
                      <th>Success Rate</th>
                      <th style={{ textAlign: 'right' }}>Recovered Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {methods.map((m) => (
                      <tr key={m.method}>
                        <td className="text-strong">{m.method}</td>
                        <td className="num-tabular text-muted">{m.attempts}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${Math.min(100, m.successRate)}%`,
                                  backgroundColor: 'var(--color-primary)',
                                  borderRadius: '3px',
                                }}
                              />
                            </div>
                            <span className="text-strong num-tabular" style={{ fontSize: '12px', minWidth: '36px' }}>{m.successRate}%</span>
                          </div>
                        </td>
                        <td className="text-strong num-tabular" style={{ textAlign: 'right', color: 'var(--color-success)' }}>
                          ₹{m.recoveredAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAILURE INTELLIGENCE */}
            <div className="dashboard-section" style={{ minWidth: 0 }}>
              <div className="section-header" style={{ marginBottom: '1rem' }}>
                <div className="section-title-group">
                  <h2 className="section-title">Failure Intelligence</h2>
                  <p className="section-description">Top failure reasons ranked by revenue at risk and estimated recovery rate</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {failures.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <span className="text-strong text-mono" style={{ fontSize: '13px', display: 'block', color: 'var(--color-text)' }}>
                        {f.failureReason}
                      </span>
                      <span className="text-xs text-muted">
                        {f.paymentCount} failed attempts • ₹{f.amountAtRisk.toLocaleString('en-IN')} at risk
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="text-strong num-tabular" style={{ fontSize: '14px', color: 'var(--color-primary)' }}>
                        {f.recoveryRate}%
                      </span>
                      <span className="text-xs text-muted block">recoverable</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* TOP RECOVERY OPPORTUNITIES TABLE */}
          <div className="dashboard-section">
            <div className="section-header" style={{ marginBottom: '1rem' }}>
              <div className="section-title-group">
                <h2 className="section-title">Top Recovery Opportunities</h2>
                <p className="section-description">
                  Highest-value failed payments prioritized for automated recovery
                </p>
              </div>
              <Link to="/transactions" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                View All Transactions
              </Link>
            </div>

            <div className="queue-table-container">
              <table className="queue-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Failure Reason</th>
                    <th>Probability</th>
                    <th>Recommended Method</th>
                    <th>Policy Status</th>
                    <th style={{ width: '40px' }}><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {topRecoverable.map((item) => (
                    <tr
                      key={item.paymentId}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/transactions/${item.paymentId}`)}
                    >
                      <td className="text-mono text-strong" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
                        {item.paymentId}
                      </td>
                      <td>
                        <div className="customer-name-cell">
                          <span className="text-strong">{item.customerName}</span>
                          <span className="customer-email">{item.customerEmail}</span>
                        </div>
                      </td>
                      <td className="amount-cell text-strong">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="text-mono text-xs text-muted">
                        {item.failureReason}
                      </td>
                      <td>
                        <div className="probability-bar-container">
                          <div className="probability-track">
                            <div
                              className={`probability-fill ${
                                item.recoveryProbability >= 75
                                  ? 'high'
                                  : item.recoveryProbability >= 50
                                  ? 'medium'
                                  : 'low'
                              }`}
                              style={{ width: `${item.recoveryProbability}%` }}
                            />
                          </div>
                          <span className="probability-value text-strong" style={{ fontSize: '12px', minWidth: '32px' }}>
                            {item.recoveryProbability}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Zap size={13} style={{ color: 'var(--color-primary)' }} />
                          <span style={{ fontWeight: 600 }}>{item.recommendedMethod}</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={item.policyStatus === 'APPROVED' ? 'Approved' : item.policyStatus} />
                      </td>
                      <td>
                        <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
