import type {
  PerformanceDataPoint,
  RecoveryQueueItem,
  StrategyMetric,
  Transaction,
  Customer,
  DecisionLog,
  Experiment,
  Policy
} from '../types';

// Top Summary Metrics
export const SUMMARY_METRICS = {
  recoveredRevenue: '₹18.42L',
  recoveredTrend: '+23.8%',
  recoveredSubtext: 'vs ₹14.88L last month',
  revenueAtRisk: '₹31.70L',
  riskSubtext: 'across 4,812 failed attempts',
  recoveryRate: '36.4%',
  recoveryRateTrend: '+4.1%',
  rateSubtext: 'benchmark: 28.2%',
  aiDecisionsCount: '4,281',
  decisionsSubtext: '99.4% execution precision'
};

// 30-Day Recovery Performance Chart Data (Monthly / Daily timeline for Recharts)
export const PERFORMANCE_CHART_DATA: PerformanceDataPoint[] = [
  { date: 'Jul 26', recovered: 42.5, atRisk: 95.0, totalFailedCount: 142 },
  { date: 'Jul 28', recovered: 48.0, atRisk: 102.4, totalFailedCount: 156 },
  { date: 'Jul 30', recovered: 51.2, atRisk: 98.8, totalFailedCount: 149 },
  { date: 'Aug 01', recovered: 55.4, atRisk: 110.2, totalFailedCount: 168 },
  { date: 'Aug 03', recovered: 61.0, atRisk: 105.0, totalFailedCount: 160 },
  { date: 'Aug 05', recovered: 58.6, atRisk: 92.4, totalFailedCount: 138 },
  { date: 'Aug 07', recovered: 64.2, atRisk: 115.0, totalFailedCount: 174 },
  { date: 'Aug 09', recovered: 70.8, atRisk: 108.6, totalFailedCount: 162 },
  { date: 'Aug 11', recovered: 68.0, atRisk: 101.2, totalFailedCount: 151 },
  { date: 'Aug 13', recovered: 74.5, atRisk: 112.8, totalFailedCount: 169 },
  { date: 'Aug 15', recovered: 82.0, atRisk: 124.0, totalFailedCount: 188 },
  { date: 'Aug 17', recovered: 79.4, atRisk: 118.5, totalFailedCount: 176 },
  { date: 'Aug 19', recovered: 86.2, atRisk: 110.0, totalFailedCount: 165 },
  { date: 'Aug 21', recovered: 91.0, atRisk: 104.2, totalFailedCount: 158 },
  { date: 'Aug 23', recovered: 96.8, atRisk: 99.5, totalFailedCount: 152 },
  { date: 'Aug 24', recovered: 102.4, atRisk: 94.0, totalFailedCount: 144 }
];

// Recovery Queue Items (Matches exact prompt requirements + supplementary items)
export const RECOVERY_QUEUE: RecoveryQueueItem[] = [
  {
    id: 'RV-28491',
    customerName: 'Aisha Khan',
    customerEmail: 'aisha@example.com',
    customerPhone: '+91 98201 44819',
    amount: 4999,
    amountFormatted: '₹4,999',
    recoveryProbability: 82,
    recommendedAction: 'Retry via UPI',
    priority: 'High',
    status: 'In Progress',
    gateway: 'Razorpay',
    failureReason: 'Temporary bank server timeout',
    timestamp: '10:31:04 AM',
    channel: 'Credit Card',
    attemptsCount: 1,
    autoEligible: true
  },
  {
    id: 'RV-28487',
    customerName: 'Rahul Mehta',
    customerEmail: 'rahul.m88@outlook.com',
    customerPhone: '+91 97112 00392',
    amount: 8999,
    amountFormatted: '₹8,999',
    recoveryProbability: 81,
    recommendedAction: 'Recovery link',
    priority: 'High',
    status: 'Scheduled',
    gateway: 'PhonePe',
    failureReason: 'Card Issuer Temporary Decline',
    timestamp: '24 mins ago',
    channel: 'Credit Card',
    attemptsCount: 2,
    autoEligible: true
  },
  {
    id: 'RV-28476',
    customerName: 'Sara Joseph',
    customerEmail: 'sara.j@yahoo.co.in',
    customerPhone: '+91 98450 12894',
    amount: 24500,
    amountFormatted: '₹24,500',
    recoveryProbability: 42,
    recommendedAction: 'Human review',
    priority: 'Attention',
    status: 'Attention Required',
    gateway: 'PayU',
    failureReason: 'High Value Mandate Execution Failed',
    timestamp: '45 mins ago',
    channel: 'eNACH Mandate',
    attemptsCount: 3,
    autoEligible: false
  },
  {
    id: 'RV-28463',
    customerName: 'Karan Shah',
    customerEmail: 'karan.shah@rediffmail.com',
    customerPhone: '+91 99304 88210',
    amount: 899,
    amountFormatted: '₹899',
    recoveryProbability: 91,
    recommendedAction: 'Retry now',
    priority: 'High',
    status: 'In Progress',
    gateway: 'Cashfree',
    failureReason: 'OTP Expiry',
    timestamp: '1 hour ago',
    channel: 'UPI Collect',
    attemptsCount: 1,
    autoEligible: true
  },
  {
    id: 'RV-28450',
    customerName: 'Ananya Rao',
    customerEmail: 'ananya.rao@gmail.com',
    customerPhone: '+91 98860 99120',
    amount: 14200,
    amountFormatted: '₹14,200',
    recoveryProbability: 76,
    recommendedAction: 'Smart SMS + Link',
    priority: 'Medium',
    status: 'Scheduled',
    gateway: 'Razorpay',
    failureReason: 'Insufficient Balance',
    timestamp: '2 hours ago',
    channel: 'Debit Card',
    attemptsCount: 2,
    autoEligible: true
  },
  {
    id: 'RV-28438',
    customerName: 'Vikram Sharma',
    customerEmail: 'vikram.s@techcorp.in',
    customerPhone: '+91 98100 55431',
    amount: 32000,
    amountFormatted: '₹32,000',
    recoveryProbability: 88,
    recommendedAction: 'Auto-retry Card Mandate',
    priority: 'High',
    status: 'Recovered',
    gateway: 'Razorpay',
    failureReason: '3DS Verification Timeout',
    timestamp: '3 hours ago',
    channel: 'Credit Card',
    attemptsCount: 1,
    autoEligible: true
  },
  {
    id: 'RV-28421',
    customerName: 'Priyanka Nair',
    customerEmail: 'priyanka.nair@hotmail.com',
    customerPhone: '+91 97441 22901',
    amount: 6499,
    amountFormatted: '₹6,499',
    recoveryProbability: 65,
    recommendedAction: 'WhatsApp Payment Link',
    priority: 'Medium',
    status: 'In Progress',
    gateway: 'PhonePe',
    failureReason: 'VPA Validation Failed',
    timestamp: '4 hours ago',
    channel: 'UPI Auto',
    attemptsCount: 2,
    autoEligible: true
  },
  {
    id: 'RV-28410',
    customerName: 'Devansh Patel',
    customerEmail: 'dev.patel@gmail.com',
    customerPhone: '+91 99250 88314',
    amount: 11800,
    amountFormatted: '₹11,800',
    recoveryProbability: 38,
    recommendedAction: 'Manual Customer Outreach',
    priority: 'Attention',
    status: 'Attention Required',
    gateway: 'PayU',
    failureReason: 'Account Inactive / Stolen Card Flag',
    timestamp: '5 hours ago',
    channel: 'NetBanking',
    attemptsCount: 4,
    autoEligible: false
  }
];

// Recovery Strategy Data (Matches exact prompt rates: 47.8%, 39.2%, 31.4%)
export const STRATEGY_METRICS: StrategyMetric[] = [
  {
    id: 'strat-1',
    name: 'AI Optimized',
    successRate: 47.8,
    volumeCount: 2450,
    recoveredAmountFormatted: '₹12.45L',
    avgTimeHours: 3.2,
    isAiDriven: true,
    status: 'Active'
  },
  {
    id: 'strat-2',
    name: 'Recovery Link',
    successRate: 39.2,
    volumeCount: 1120,
    recoveredAmountFormatted: '₹4.18L',
    avgTimeHours: 8.5,
    isAiDriven: false,
    status: 'Active'
  },
  {
    id: 'strat-3',
    name: 'Immediate Retry',
    successRate: 31.4,
    volumeCount: 711,
    recoveredAmountFormatted: '₹1.79L',
    avgTimeHours: 0.1,
    isAiDriven: false,
    status: 'Baseline'
  }
];

export const STRATEGY_INSIGHT = 
  'AI-optimized recovery is currently outperforming immediate retry by 16.4 percentage points.';

// Extended Transactions Dataset for /transactions route
export const TRANSACTIONS_DATA: Transaction[] = [
  {
    id: 'TXN-99401',
    orderId: 'ORD-88210',
    customerName: 'Aisha Khan',
    customerEmail: 'aisha.k@gmail.com',
    amount: 4999,
    amountFormatted: '₹4,999',
    gateway: 'Razorpay',
    paymentMethod: 'UPI Auto',
    failureCode: 'UPI_BANK_OFFLINE',
    failureReason: 'HDFC UPI Server Timeout',
    status: 'In Progress',
    createdAt: '2026-08-24 10:45 AM',
    recoveryProbability: 82,
    nextRetryTime: '11:15 AM'
  },
  {
    id: 'TXN-99400',
    orderId: 'ORD-88209',
    customerName: 'Rahul Mehta',
    customerEmail: 'rahul.m88@outlook.com',
    amount: 8999,
    amountFormatted: '₹8,999',
    gateway: 'PhonePe',
    paymentMethod: 'Credit Card',
    failureCode: 'CARD_DECLINED_SOFT',
    failureReason: 'Issuer Transient Error',
    status: 'Scheduled',
    createdAt: '2026-08-24 10:31 AM',
    recoveryProbability: 81,
    nextRetryTime: '12:30 PM'
  },
  {
    id: 'TXN-99398',
    orderId: 'ORD-88205',
    customerName: 'Vikram Sharma',
    customerEmail: 'vikram.s@techcorp.in',
    amount: 32000,
    amountFormatted: '₹32,000',
    gateway: 'Razorpay',
    paymentMethod: 'Credit Card',
    failureCode: 'VERIFICATION_TIMEOUT',
    failureReason: '3DS Page Abandoned',
    status: 'Recovered',
    createdAt: '2026-08-24 08:14 AM',
    recoveryProbability: 88
  },
  {
    id: 'TXN-99395',
    orderId: 'ORD-88198',
    customerName: 'Sara Joseph',
    customerEmail: 'sara.j@yahoo.co.in',
    amount: 24500,
    amountFormatted: '₹24,500',
    gateway: 'PayU',
    paymentMethod: 'eNACH Mandate',
    failureCode: 'MANDATE_EXHAUSTED',
    failureReason: 'Max Retry Limit Hit',
    status: 'Attention Required',
    createdAt: '2026-08-24 07:50 AM',
    recoveryProbability: 42
  },
  {
    id: 'TXN-99392',
    orderId: 'ORD-88190',
    customerName: 'Karan Shah',
    customerEmail: 'karan.shah@rediffmail.com',
    amount: 899,
    amountFormatted: '₹899',
    gateway: 'Cashfree',
    paymentMethod: 'UPI Collect',
    failureCode: 'OTP_EXPIRED',
    failureReason: 'User Response Timeout',
    status: 'In Progress',
    createdAt: '2026-08-24 06:12 AM',
    recoveryProbability: 91
  },
  {
    id: 'TXN-99389',
    orderId: 'ORD-88184',
    customerName: 'Ananya Rao',
    customerEmail: 'ananya.rao@gmail.com',
    amount: 14200,
    amountFormatted: '₹14,200',
    gateway: 'Razorpay',
    paymentMethod: 'Debit Card',
    failureCode: 'INSUFFICIENT_FUNDS',
    failureReason: 'Low Account Balance',
    status: 'Scheduled',
    createdAt: '2026-08-24 05:40 AM',
    recoveryProbability: 76
  },
  {
    id: 'TXN-99382',
    orderId: 'ORD-88172',
    customerName: 'Neha Verma',
    customerEmail: 'neha.v@designstudio.in',
    amount: 18500,
    amountFormatted: '₹18,500',
    gateway: 'Razorpay',
    paymentMethod: 'UPI Auto',
    failureCode: 'BANK_DOWNTIME',
    failureReason: 'ICICI Core Banking Maintenance',
    status: 'Recovered',
    createdAt: '2026-08-24 04:15 AM',
    recoveryProbability: 94
  },
  {
    id: 'TXN-99375',
    orderId: 'ORD-88160',
    customerName: 'Arjun Reddy',
    customerEmail: 'arjun.reddy@gmail.com',
    amount: 5499,
    amountFormatted: '₹5,499',
    gateway: 'PhonePe',
    paymentMethod: 'UPI Collect',
    failureCode: 'USER_CANCELLED',
    failureReason: 'Customer Declined Collect Request',
    status: 'Failed',
    createdAt: '2026-08-24 02:10 AM',
    recoveryProbability: 18
  }
];

// Customers Dataset for /customers route
export const CUSTOMERS_DATA: Customer[] = [
  {
    id: 'CUST-401',
    name: 'Aisha Khan',
    email: 'aisha.k@gmail.com',
    phone: '+91 98201 44819',
    totalSpentFormatted: '₹42,800',
    failedTransactionsCount: 2,
    recoveredTransactionsCount: 2,
    recoveredAmountFormatted: '₹9,998',
    riskScore: 24,
    preferredMethod: 'UPI Auto',
    status: 'Active'
  },
  {
    id: 'CUST-402',
    name: 'Vikram Sharma',
    email: 'vikram.s@techcorp.in',
    phone: '+91 98100 55431',
    totalSpentFormatted: '₹1,84,000',
    failedTransactionsCount: 1,
    recoveredTransactionsCount: 1,
    recoveredAmountFormatted: '₹32,000',
    riskScore: 12,
    preferredMethod: 'Credit Card',
    status: 'Churn Prevented'
  },
  {
    id: 'CUST-403',
    name: 'Sara Joseph',
    email: 'sara.j@yahoo.co.in',
    phone: '+91 98450 12894',
    totalSpentFormatted: '₹68,500',
    failedTransactionsCount: 4,
    recoveredTransactionsCount: 1,
    recoveredAmountFormatted: '₹14,000',
    riskScore: 68,
    preferredMethod: 'eNACH Mandate',
    status: 'At Risk'
  },
  {
    id: 'CUST-404',
    name: 'Rahul Mehta',
    email: 'rahul.m88@outlook.com',
    phone: '+91 97112 00392',
    totalSpentFormatted: '₹34,200',
    failedTransactionsCount: 2,
    recoveredTransactionsCount: 1,
    recoveredAmountFormatted: '₹8,999',
    riskScore: 35,
    preferredMethod: 'Credit Card',
    status: 'Active'
  }
];

// AI Decisions Log Dataset for /ai/decisions route
export const DECISION_LOGS: DecisionLog[] = [
  {
    id: 'DEC-9021',
    transactionId: 'TXN-99401',
    customerName: 'Aisha Khan',
    amountFormatted: '₹4,999',
    decisionType: 'Smart UPI Retry',
    confidenceScore: 94,
    primaryFeature: 'HDFC UPI gateway latency dropped from 4200ms to 180ms; recommended instant retry window',
    actionTaken: 'Executed automated UPI retry ping via Razorpay',
    outcome: 'Pending',
    timestamp: '10 mins ago'
  },
  {
    id: 'DEC-9018',
    transactionId: 'TXN-99398',
    customerName: 'Vikram Sharma',
    amountFormatted: '₹32,000',
    decisionType: 'WhatsApp Payment Link',
    confidenceScore: 88,
    primaryFeature: 'Customer mobile activity peak detected; credit card decline was soft verification error',
    actionTaken: 'Sent 1-click WhatsApp payment link with pre-filled OTP trigger',
    outcome: 'Success',
    timestamp: '3 hours ago'
  },
  {
    id: 'DEC-9015',
    transactionId: 'TXN-99392',
    customerName: 'Karan Shah',
    amountFormatted: '₹899',
    decisionType: 'Smart UPI Retry',
    confidenceScore: 91,
    primaryFeature: 'Failure was user OTP timeout during lunch hour; high conversion probability post-14:00',
    actionTaken: 'Scheduled silent UPI push notification for 14:15 IST',
    outcome: 'Pending',
    timestamp: '4 hours ago'
  },
  {
    id: 'DEC-9012',
    transactionId: 'TXN-99382',
    customerName: 'Neha Verma',
    amountFormatted: '₹18,500',
    decisionType: 'Mandate Reschedule',
    confidenceScore: 96,
    primaryFeature: 'Salary credit pattern detected on 24th; ICICI maintenance ended',
    actionTaken: 'Rescheduled eNACH mandate sweep for 04:15 AM',
    outcome: 'Success',
    timestamp: '6 hours ago'
  }
];

// AI Experiments Dataset for /ai/experiments route
export const EXPERIMENTS_DATA: Experiment[] = [
  {
    id: 'EXP-104',
    name: 'Dynamic UPI Retry Schedule vs Static 24h Window',
    hypothesis: 'Retrying UPI failures based on real-time bank gateway uptime increases recovery rate by >12%.',
    variantA: 'Control: Static 24-hour retry delay',
    variantB: 'Challenger: Real-time bank health adaptive retry',
    status: 'Running',
    sampleSize: 14200,
    variantASuccessRate: 31.2,
    variantBSuccessRate: 46.8,
    confidenceInterval: '99.4%',
    lift: '+15.6%',
    startDate: '2026-08-01'
  },
  {
    id: 'EXP-102',
    name: 'WhatsApp Pre-filled Link vs Standard SMS Reminder',
    hypothesis: 'Pre-filled WhatsApp payment link reduces friction for high-tier orders (₹5,000+).',
    variantA: 'Control: Standard SMS with web link',
    variantB: 'Challenger: WhatsApp Interactive Button + 1-Tap Pay',
    status: 'Completed',
    sampleSize: 8900,
    variantASuccessRate: 24.1,
    variantBSuccessRate: 39.5,
    confidenceInterval: '99.9%',
    lift: '+15.4%',
    startDate: '2026-07-15'
  }
];

// Policy Configuration Dataset for /settings/policies route
export const POLICIES_DATA: Policy[] = [
  {
    id: 'POL-01',
    name: 'Maximum Automated Retries',
    category: 'Retry Timing',
    description: 'Caps total automated retry attempts per transaction before escalating to manual human review.',
    thresholdValue: '3 Attempts',
    isEnabled: true,
    lastUpdated: '2026-08-10'
  },
  {
    id: 'POL-02',
    name: 'Minimum AI Recovery Probability Floor',
    category: 'Risk Safety',
    description: 'Transactions below this predicted recovery probability will skip automated retries to protect merchant gateway health score.',
    thresholdValue: '35% Probability',
    isEnabled: true,
    lastUpdated: '2026-08-15'
  },
  {
    id: 'POL-03',
    name: 'Nighttime Blackout Window (22:00 - 07:00 IST)',
    category: 'Communication Channel',
    description: 'Prevents sending SMS / WhatsApp payment prompts during late night hours unless requested.',
    thresholdValue: 'Active (22:00 - 07:00)',
    isEnabled: true,
    lastUpdated: '2026-07-28'
  },
  {
    id: 'POL-04',
    name: 'High-Value Mandate Hold Threshold',
    category: 'Risk Safety',
    description: 'Requires human approval before retrying any failed transaction exceeding ₹50,000.',
    thresholdValue: '₹50,000 Threshold',
    isEnabled: true,
    lastUpdated: '2026-08-01'
  }
];
