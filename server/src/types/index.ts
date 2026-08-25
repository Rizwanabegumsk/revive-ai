import { Document, Types } from 'mongoose';

export type PaymentMethodEnum = 'CARD' | 'UPI' | 'NETBANKING' | 'WALLET';
export type PaymentStatusEnum = 'SUCCESS' | 'FAILED' | 'PENDING' | 'RECOVERED';
export type ConfidenceLevelEnum = 'LOW' | 'MEDIUM' | 'HIGH';
export type PolicyStatusEnum = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED' | 'MANUAL_REVIEW';
export type DecisionStatusEnum = 'GENERATED' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'COMPLETED';
export type ExecutionStatusEnum = 'SCHEDULED' | 'SUCCESS' | 'EXECUTED' | 'FAILED' | 'CANCELLED';

export interface IEngineSignal {
  name: string;
  value: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface IPolicyCheck {
  rule: string;
  passed: boolean;
  explanation: string;
}

export interface IPolicyEvaluationResult {
  approved: boolean;
  status: 'APPROVED' | 'REJECTED';
  checks: IPolicyCheck[];
  reason: string;
}

export interface ICustomer extends Document {
  customerId: string;
  name: string;
  email: string;
  totalPayments: number;
  successfulPayments: number;
  recoveredPayments: number;
  preferredMethod: PaymentMethodEnum;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  paymentId: string;
  customerId: Types.ObjectId | ICustomer;
  amount: number;
  currency: string;
  method: PaymentMethodEnum;
  status: PaymentStatusEnum;
  failureReason?: string;
  gateway: string;
  retryCount: number;
  recovered?: boolean;
  recoveredAmount?: number;
  recoveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecoveryDecision extends Document {
  decisionId: string;
  paymentId: Types.ObjectId | IPayment;
  probability: number;
  confidence: ConfidenceLevelEnum;
  recommendation: string;
  recommendedAction?: string;
  recommendedMethod: PaymentMethodEnum;
  delayMinutes: number;
  reasoning: string[];
  signals?: IEngineSignal[];
  modelVersion: string;
  policyStatus: PolicyStatusEnum;
  status: DecisionStatusEnum;
  policyChecks?: IPolicyCheck[];
  policyReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecoveryOutcome extends Document {
  outcomeId: string;
  paymentId: Types.ObjectId | IPayment;
  decisionId: Types.ObjectId | IRecoveryDecision;
  action: string;
  method?: string;
  executionStatus: ExecutionStatusEnum;
  recovered: boolean;
  recoveredAmount: number;
  amountRecovered?: number;
  simulationMode?: boolean;
  message?: string;
  executedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecoveryEvent extends Document {
  eventId: string;
  paymentId: Types.ObjectId | IPayment;
  eventType: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
