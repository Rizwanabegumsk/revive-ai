import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface MetricItemData {
  id: string;
  title: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
}

interface MetricStripProps {
  metrics: MetricItemData[];
}

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
              <span className="metric-value num-tabular">{item.value}</span>
            </div>
            {item.subtitle && <span className="metric-subtitle">{item.subtitle}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
