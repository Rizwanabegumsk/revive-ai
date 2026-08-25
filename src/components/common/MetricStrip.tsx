import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface MetricItemData {
  id: string;
  title: string;
  value: string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  formatIndian?: boolean;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
}

interface MetricStripProps {
  metrics: MetricItemData[];
}

// Static display — no count-up animation
const MetricValue: React.FC<{ item: MetricItemData }> = ({ item }) => {
  let display = item.value;
  if (item.numericValue !== undefined) {
    const num = (item.decimals && item.decimals > 0)
      ? item.numericValue.toFixed(item.decimals)
      : (item.formatIndian
          ? item.numericValue.toLocaleString('en-IN')
          : Math.round(item.numericValue).toString());
    display = `${item.prefix || ''}${num}${item.suffix || ''}`;
  }
  return <span className="metric-value num-tabular">{display}</span>;
};

export const MetricStrip: React.FC<MetricStripProps> = ({ metrics }) => {
  return (
    <div className="metric-strip-container">
      <div className="metric-strip">
        {metrics.map((item) => (
          <div key={item.id} className="metric-item">
            <div className="metric-header">
              <span className="metric-title">{item.title}</span>
              {item.trend && (
                <span className={`metric-trend ${item.trendPositive !== false ? 'positive' : 'neutral'}`}>
                  {item.trendPositive !== false && <ArrowUpRight size={12} />}
                  {item.trend}
                </span>
              )}
            </div>
            <div className="metric-value-row">
              <MetricValue item={item} />
            </div>
            {item.subtitle && <span className="metric-subtitle">{item.subtitle}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

