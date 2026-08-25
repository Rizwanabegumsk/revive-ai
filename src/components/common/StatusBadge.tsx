import React from 'react';

export type StatusType = 
  | 'Recovered' 
  | 'In Progress' 
  | 'Scheduled' 
  | 'Attention Required' 
  | 'Failed' 
  | 'Blocked'
  | 'Active'
  | 'Running'
  | 'Completed'
  | 'High'
  | 'Medium'
  | 'Attention'
  | 'Low'
  | 'Success'
  | 'Pending';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeClass = 'badge-neutral';
  let label = status;

  switch (status) {
    case 'Recovered':
    case 'Success':
    case 'Completed':
    case 'Active':
      badgeClass = 'badge-success';
      break;

    case 'In Progress':
    case 'Scheduled':
    case 'Pending':
    case 'Medium':
    case 'Running':
      badgeClass = 'badge-info';
      break;

    case 'Attention Required':
    case 'Attention':
    case 'High':
      badgeClass = 'badge-warning';
      break;

    case 'Failed':
    case 'Blocked':
      badgeClass = 'badge-danger';
      break;

    case 'Low':
      badgeClass = 'badge-neutral';
      break;

    default:
      badgeClass = 'badge-neutral';
      break;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot" />
      <span>{label}</span>
    </span>
  );
};
