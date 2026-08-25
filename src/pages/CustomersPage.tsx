import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { CUSTOMERS_DATA } from '../data/mockData';
import { Search } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { onOpenMobileNav } = useOutletContext<{ onOpenMobileNav: () => void }>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = CUSTOMERS_DATA.filter((cust) =>
    cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Customer risk profiles, failure histories, recovered lifetime value, and payment channel preferences."
        onOpenMobileNav={onOpenMobileNav}
      />

      <div className="dashboard-section" style={{ padding: 0 }}>
        {/* Filter Controls Bar */}
        <div className="filter-bar">
          <div className="filter-controls">
            <div className="input-group">
              <Search className="input-icon" />
              <input
                type="text"
                className="input-search"
                placeholder="Search customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '280px' }}
              />
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Showing <strong className="num-tabular">{filteredCustomers.length}</strong> customers
          </div>
        </div>

        {/* Customer Table */}
        <div className="queue-table-container">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name & Contact</th>
                <th>Total GMV</th>
                <th>Recovered GMV</th>
                <th>Payment Failures</th>
                <th>Risk Score</th>
                <th>Preferred Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => (
                <tr key={cust.id}>
                  <td className="text-mono text-strong" style={{ fontSize: '13px' }}>
                    {cust.id}
                  </td>
                  <td>
                    <div className="customer-name-cell">
                      <span className="text-strong">{cust.name}</span>
                      <span className="customer-email">{cust.email} • {cust.phone}</span>
                    </div>
                  </td>
                  <td className="amount-cell text-strong">
                    {cust.totalSpentFormatted}
                  </td>
                  <td className="amount-cell text-strong" style={{ color: 'var(--color-success)' }}>
                    {cust.recoveredAmountFormatted}
                  </td>
                  <td className="num-tabular">
                    <span style={{ fontWeight: 600 }}>{cust.failedTransactionsCount}</span> failed
                    <span className="text-xs text-muted block">({cust.recoveredTransactionsCount} recovered)</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="probability-track" style={{ width: '50px' }}>
                        <div
                          className={`probability-fill ${
                            cust.riskScore > 50 ? 'low' : cust.riskScore > 25 ? 'medium' : 'high'
                          }`}
                          style={{ width: `${cust.riskScore}%` }}
                        />
                      </div>
                      <span className="text-strong num-tabular" style={{ fontSize: '12px' }}>
                        {cust.riskScore}/100
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{cust.preferredMethod}</span>
                  </td>
                  <td>
                    <StatusBadge status={cust.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
