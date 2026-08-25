import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Search, Loader2 } from 'lucide-react';
import { buildApiUrl } from '../config/api';

interface ICustomerItem {
  id: string;
  name: string;
  email: string;
  totalPayments: number;
  successfulPayments: number;
  recoveredPayments: number;
  preferredMethod: string;
  riskScore: number;
  status: string;
}

export const CustomersPage: React.FC = () => {
  const { onOpenMobileNav } = useOutletContext<{ onOpenMobileNav: () => void }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [customers, setCustomers] = useState<ICustomerItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(buildApiUrl('/api/customers'));
      if (res.ok) {
        const json = await res.json();
        const customerList = Array.isArray(json) ? json : (json.success && Array.isArray(json.data) ? json.data : []);
        if (customerList.length > 0) {
          const mapped: ICustomerItem[] = customerList.map((c: any) => {
            const successRate = c.totalPayments > 0 ? (c.successfulPayments / c.totalPayments) : 1;
            const riskScore = Math.round((1 - successRate) * 100);
            return {
              id: c.customerId,
              name: c.name,
              email: c.email,
              totalPayments: c.totalPayments || 0,
              successfulPayments: c.successfulPayments || 0,
              recoveredPayments: c.recoveredPayments || 0,
              preferredMethod: c.preferredMethod || 'UPI',
              riskScore: Math.max(10, Math.min(90, riskScore || 15)),
              status: c.recoveredPayments > 0 ? 'RECOVERED' : (c.totalPayments > 0 ? 'ACTIVE' : 'NEW')
            };
          });
          setCustomers(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch customers from API:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter((cust) =>
    cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.id.toLowerCase().includes(searchQuery.toLowerCase())
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
                placeholder="Search customer name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '280px' }}
              />
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Showing <strong className="num-tabular">{filteredCustomers.length}</strong> of {customers.length} customers
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
            <p>Loading merchant customer profiles...</p>
          </div>
        ) : (
          /* Customer Table */
          <div className="queue-table-container">
            <table className="queue-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name & Email</th>
                  <th>Total Payments</th>
                  <th>Successful</th>
                  <th>Recovered</th>
                  <th>Risk Score</th>
                  <th>Preferred Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust, idx) => (
                  <tr key={cust.id} className="timeline-item-animated" style={{ animationDelay: `${idx * 50}ms` }}>
                    <td className="text-mono text-strong" style={{ fontSize: '13px' }}>
                      {cust.id}
                    </td>
                    <td>
                      <div className="customer-name-cell">
                        <span className="text-strong">{cust.name}</span>
                        <span className="customer-email">{cust.email}</span>
                      </div>
                    </td>
                    <td className="num-tabular text-strong">
                      {cust.totalPayments}
                    </td>
                    <td className="num-tabular" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                      {cust.successfulPayments}
                    </td>
                    <td className="num-tabular">
                      <span style={{ fontWeight: 600, color: cust.recoveredPayments > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                        {cust.recoveredPayments}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="probability-track" style={{ width: '50px' }}>
                          <div
                            className={`probability-fill ${
                              cust.riskScore > 50 ? 'high' : cust.riskScore > 25 ? 'medium' : 'low'
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
        )}
      </div>
    </div>
  );
};
