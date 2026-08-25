import React from 'react';
import { Lightbulb } from 'lucide-react';
import type { StrategyMetric } from '../../types';

interface StrategyPerformanceProps {
  strategies: StrategyMetric[];
  insight: string;
}

export const StrategyPerformance: React.FC<StrategyPerformanceProps> = ({
  strategies,
  insight
}) => {
  return (
    <div className="strategy-card">
      <div>
        <div className="section-header" style={{ marginBottom: '0.75rem' }}>
          <div className="section-title-group">
            <h2 className="section-title">Recovery Strategy</h2>
            <p className="section-description">
              Conversion rate by execution methodology across all payment gateways
            </p>
          </div>
        </div>

        <div className="strategy-comparison-list">
          {strategies.map((strat) => (
            <div key={strat.id} className="strategy-row">
              <div className="strategy-row-meta">
                <span className="strategy-name">
                  {strat.name}
                  {strat.isAiDriven && (
                    <span
                      style={{
                        marginLeft: '0.375rem',
                        fontSize: '11px',
                        color: 'var(--color-primary)',
                        fontWeight: 600
                      }}
                    >
                      (AI Driven)
                    </span>
                  )}
                </span>
                <span className="strategy-rate">{strat.successRate}%</span>
              </div>
              <div className="strategy-bar-bg">
                <div
                  className={`strategy-bar-fill ${
                    strat.name.includes('AI')
                      ? 'ai'
                      : strat.name.includes('Link')
                      ? 'link'
                      : 'retry'
                  }`}
                  style={{ width: `${strat.successRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Box */}
      <div className="insight-box">
        <Lightbulb className="insight-icon" />
        <p className="insight-text">{insight}</p>
      </div>
    </div>
  );
};
