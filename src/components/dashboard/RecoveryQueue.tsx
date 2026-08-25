import React, { useState } from 'react';
import { Search, ChevronRight, Zap } from 'lucide-react';
import type { RecoveryQueueItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface RecoveryQueueProps {
  items: RecoveryQueueItem[];
  onSelectItem?: (item: RecoveryQueueItem) => void;
}

export const RecoveryQueue: React.FC<RecoveryQueueProps> = ({ items, onSelectItem }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recommendedAction.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      filterPriority === 'all' || item.priority.toLowerCase() === filterPriority.toLowerCase();

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="recovery-queue-card">
      <div className="section-header" style={{ padding: '1.25rem 1.5rem 0.75rem 1.5rem', marginBottom: 0 }}>
        <div className="section-title-group">
          <h2 className="section-title">AI Recovery Queue</h2>
          <p className="section-description">
            Prioritized failed payments currently assigned to Revive autonomous recovery agents
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="input-group">
            <Search className="input-icon" />
            <input
              type="text"
              className="input-search"
              placeholder="Search queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select-control"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="attention">Attention</option>
          </select>
        </div>
      </div>

      <div className="queue-table-container">
        <table className="queue-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Probability</th>
              <th>Recommended Action</th>
              <th>Priority</th>
              <th>Status</th>
              <th style={{ width: '40px' }}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((row) => (
                <tr
                  key={row.id}
                  style={{ cursor: onSelectItem ? 'pointer' : 'default' }}
                  onClick={() => onSelectItem && onSelectItem(row)}
                >
                  <td className="text-strong text-mono" style={{ fontSize: '13px' }}>
                    {row.id}
                  </td>
                  <td>
                    <div className="customer-name-cell">
                      <span className="text-strong">{row.customerName}</span>
                      <span className="customer-email">{row.customerEmail}</span>
                    </div>
                  </td>
                  <td className="amount-cell text-strong">
                    {row.amountFormatted}
                  </td>
                  <td>
                    <div className="probability-bar-container">
                      <div className="probability-track">
                        <div
                          className={`probability-fill ${
                            row.recoveryProbability >= 80
                              ? 'high'
                              : row.recoveryProbability >= 60
                              ? 'medium'
                              : 'low'
                          }`}
                          style={{ width: `${row.recoveryProbability}%` }}
                        />
                      </div>
                      <span className="probability-value text-strong" style={{ fontSize: '12px', minWidth: '32px' }}>
                        {row.recoveryProbability}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {row.autoEligible && <Zap size={13} style={{ color: 'var(--color-primary)' }} />}
                      <span style={{ fontWeight: 500 }}>{row.recommendedAction}</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={row.priority} />
                  </td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>
                    <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                  No queue items match your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
