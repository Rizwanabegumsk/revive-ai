export type PaymentGateway = 'Razorpay' | 'PayU' | 'PhonePe' | 'Cashfree' | 'Stripe India';
export type PaymentMethod = 'UPI Auto' | 'UPI Collect' | 'Credit Card' | 'Debit Card' | 'NetBanking' | 'eNACH Mandate';
export type PriorityLevel = 'High' | 'Medium' | 'Attention' | 'Low';
export type RecoveryStatus = 'Recovered' | 'In Progress' | 'Attention Required' | 'Failed' | 'Scheduled';

export interface PerformanceDataPoint {
  date: string;
  recovered: number; // in thousands (INR)
  atRisk: number;    // in thousands (INR)
  totalFailedCount: number;
}

export interface RecoveryQueueItem {
  id: string; // e.g. RV-28491
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number; // In INR e.g. 4999
  amountFormatted: string; // e.g. ₹4,999
  recoveryProbability: number; // e.g. 82
  recommendedAction: string; // e.g. "Retry via UPI"
  priority: PriorityLevel;
  status: RecoveryStatus;
  gateway: PaymentGateway;
  failureReason: string;
  timestamp: string;
  channel: PaymentMethod;
  attemptsCount: number;
  autoEligible: boolean;
}

export interface StrategyMetric {
  id: string;
  name: string;
  successRate: number; // e.g. 47.8
  volumeCount: number;
  recoveredAmountFormatted: string;
  avgTimeHours: number;
  isAiDriven: boolean;
  status: 'Active' | 'Optimizing' | 'Baseline';
}

export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  amountFormatted: string;
  gateway: PaymentGateway;
  paymentMethod: PaymentMethod;
  failureCode: string;
  failureReason: string;
  status: RecoveryStatus;
  createdAt: string;
  recoveryProbability: number;
  nextRetryTime?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpentFormatted: string;
  failedTransactionsCount: number;
  recoveredTransactionsCount: number;
  recoveredAmountFormatted: string;
  riskScore: number; // 1-100
  preferredMethod: PaymentMethod;
  status: 'Active' | 'At Risk' | 'Churn Prevented';
}

export interface DecisionLog {
  id: string; // e.g. DEC-9021
  transactionId: string;
  customerName: string;
  amountFormatted: string;
  decisionType: 'Smart UPI Retry' | 'WhatsApp Payment Link' | 'Mandate Reschedule' | 'Escalate to Merchant Support' | 'Hold Retry';
  confidenceScore: number; // e.g. 94%
  primaryFeature: string; // e.g. "High UPI success probability at 19:30 IST"
  actionTaken: string;
  outcome: 'Success' | 'Pending' | 'Aborted';
  timestamp: string;
}

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  variantA: string;
  variantB: string;
  status: 'Running' | 'Completed' | 'Draft';
  sampleSize: number;
  variantASuccessRate: number;
  variantBSuccessRate: number;
  confidenceInterval: string;
  lift: string;
  startDate: string;
}

export interface Policy {
  id: string;
  name: string;
  category: 'Retry Timing' | 'Communication Channel' | 'Discount & Incentives' | 'Risk Safety';
  description: string;
  thresholdValue: string;
  isEnabled: boolean;
  lastUpdated: string;
}
