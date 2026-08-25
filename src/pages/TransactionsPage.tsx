import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { TRANSACTIONS_DATA } from '../data/mockData';
import { Search } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { onOpenMobileNav } = useOutletContext<{ onOpenMobileNav: () => void }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGateway, setSelectedGateway] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredTransactions = TRANSACTIONS_DATA.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.orderId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGateway =
      selectedGateway === 'all' || txn.gateway.toLowerCase() === selectedGateway.toLowerCase();

    const matchesStatus =
      selectedStatus === 'all' || txn.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesGateway && matchesStatus;
  });

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="Complete log of payment failure events, gateway response codes, and recovery tracking for Nova Fashion."
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
                placeholder="Search transaction ID, order, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '280px' }}
              />
            </div>

            <select
              className="select-control"
              value={selectedGateway}
              onChange={(e) => setSelectedGateway(e.target.value)}
            >
              <option value="all">All Payment Gateways</option>
              <option value="razorpay">Razorpay</option>
              <option value="phonepe">PhonePe</option>
              <option value="payu">PayU</option>
              <option value="cashfree">Cashfree</option>
            </select>

            <select
              className="select-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="recovered">Recovered</option>
              <option value="in progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
              <option value="attention required">Attention Required</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Showing <strong className="num-tabular">{filteredTransactions.length}</strong> transactions
          </div>
        </div>

        {/* Table */}
        <div className="queue-table-container">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Gateway & Channel</th>
                <th>Failure Code & Reason</th>
                <th>Probability</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} style={{ cursor: 'pointer' }}>
                  <td className="text-mono text-strong" style={{ fontSize: '13px' }}>
                    <Link to={`/transactions/${txn.id}`} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                      {txn.id}
                    </Link>
                  </td>
                  <td className="text-mono text-muted" style={{ fontSize: '12px' }}>
                    {txn.orderId}
                  </td>
                  <td>
                    <div className="customer-name-cell">
                      <span className="text-strong">{txn.customerName}</span>
                      <span className="customer-email">{txn.customerEmail}</span>
                    </div>
                  </td>
                  <td className="amount-cell text-strong">
                    {txn.amountFormatted}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="text-strong" style={{ fontSize: '13px' }}>{txn.gateway}</span>
                      <span className="text-xs text-muted">{txn.paymentMethod}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="text-mono text-xs" style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                        {txn.failureCode}
                      </span>
                      <span className="text-xs text-muted">{txn.failureReason}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-strong num-tabular" style={{ fontSize: '13px' }}>
                      {txn.recoveryProbability}%
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={txn.status} />
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
