import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { PERFORMANCE_CHART_DATA } from '../../data/mockData';

interface TrendItem {
  date: string;
  failedAmount?: number;
  atRisk?: number;
  recoveredAmount?: number;
  recovered?: number;
  recoveryRate?: number;
}

interface RecoveryChartProps {
  data?: TrendItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-date">{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="tooltip-item">
            <div className="tooltip-item-label">
              <span className="tooltip-dot" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}</span>
            </div>
            <span className="tooltip-item-val">
              ₹{Number(entry.value).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const RecoveryChart: React.FC<RecoveryChartProps> = ({ data }) => {
  const [metricView, setMetricView] = useState<'all' | 'recovered' | 'atRisk'>('all');

  const chartData = data && data.length > 0
    ? data.map(d => ({
        date: d.date.length > 10 ? d.date.substring(5) : d.date,
        recovered: d.recoveredAmount ?? d.recovered ?? 0,
        atRisk: d.failedAmount ?? d.atRisk ?? 0
      }))
    : PERFORMANCE_CHART_DATA;

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <div className="section-title-group">
          <h2 className="section-title">Revenue Recovery Trend</h2>
          <p className="section-description">
            Daily comparison of recovered payment volume against failed revenue at risk from live backend API
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className={`btn btn-sm ${metricView === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMetricView('all')}
          >
            Combined
          </button>
          <button
            className={`btn btn-sm ${metricView === 'recovered' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMetricView('recovered')}
          >
            Recovered Only
          </button>
          <button
            className={`btn btn-sm ${metricView === 'atRisk' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMetricView('atRisk')}
          >
            At Risk Only
          </button>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#047857" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(val) => val >= 1000 ? `₹${(val / 1000).toFixed(0)}K` : `₹${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              iconType="circle"
              iconSize={8}
            />

            {(metricView === 'all' || metricView === 'recovered') && (
              <Area
                type="monotone"
                dataKey="recovered"
                name="Recovered Revenue"
                stroke="#047857"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRecovered)"
                isAnimationActive={true}
                animationDuration={1100}
                animationEasing="ease-out"
              />
            )}

            {(metricView === 'all' || metricView === 'atRisk') && (
              <Area
                type="monotone"
                dataKey="atRisk"
                name="Revenue at Risk"
                stroke="#1e3a8a"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAtRisk)"
                isAnimationActive={true}
                animationDuration={1100}
                animationEasing="ease-out"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
