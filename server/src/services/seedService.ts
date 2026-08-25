import mongoose from 'mongoose';
import { Customer } from '../models/Customer';
import { Payment } from '../models/Payment';
import { RecoveryDecision } from '../models/RecoveryDecision';
import { RecoveryOutcome } from '../models/RecoveryOutcome';
import { RecoveryEvent } from '../models/RecoveryEvent';
import { RecoveryExperiment } from '../models/RecoveryExperiment';
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
  ConfidenceLevelEnum,
  PolicyStatusEnum,
  DecisionStatusEnum,
  ExecutionStatusEnum
} from '../types';

export const seedDatabaseData = async (clearExisting = true): Promise<{
  customersCount: number;
  paymentsCount: number;
  decisionsCount: number;
  outcomesCount: number;
}> => {
  if (clearExisting) {
    console.log('🧹 Clearing existing collections...');
    await Customer.deleteMany({});
    await Payment.deleteMany({});
    await RecoveryDecision.deleteMany({});
    await RecoveryOutcome.deleteMany({});
    await RecoveryEvent.deleteMany({});
    await RecoveryExperiment.deleteMany({});
  }

  console.log('👤 Seeding Customers...');
  const customersData = [
    {
      customerId: 'CUST-AISHA-001',
      name: 'Aisha Khan',
      email: 'aisha@example.com',
      totalPayments: 6,
      successfulPayments: 5,
      recoveredPayments: 1,
      preferredMethod: 'UPI' as PaymentMethodEnum
    },
    {
      customerId: 'CUST-MEHTA-002',
      name: 'Rahul Mehta',
      email: 'rahul.m88@outlook.com',
      totalPayments: 12,
      successfulPayments: 10,
      recoveredPayments: 1,
      preferredMethod: 'CARD' as PaymentMethodEnum
    },
    {
      customerId: 'CUST-JOSEPH-003',
      name: 'Sara Joseph',
      email: 'sara.j@yahoo.co.in',
      totalPayments: 8,
      successfulPayments: 5,
      recoveredPayments: 1,
      preferredMethod: 'NETBANKING' as PaymentMethodEnum
    },
    {
      customerId: 'CUST-SHAH-004',
      name: 'Karan Shah',
      email: 'karan.shah@rediffmail.com',
      totalPayments: 15,
      successfulPayments: 14,
      recoveredPayments: 2,
      preferredMethod: 'UPI' as PaymentMethodEnum
    },
    {
      customerId: 'CUST-SHARMA-005',
      name: 'Vikram Sharma',
      email: 'vikram.s@techcorp.in',
      totalPayments: 20,
      successfulPayments: 19,
      recoveredPayments: 3,
      preferredMethod: 'CARD' as PaymentMethodEnum
    },
    {
      customerId: 'CUST-RAO-006',
      name: 'Ananya Rao',
      email: 'ananya.rao@gmail.com',
      totalPayments: 9,
      successfulPayments: 7,
      recoveredPayments: 1,
      preferredMethod: 'UPI' as PaymentMethodEnum
    },
    {
      customerId: 'CUST-NAIR-007',
      name: 'Priyanka Nair',
      email: 'priyanka.nair@hotmail.com',
      totalPayments: 5,
      successfulPayments: 4,
      recoveredPayments: 1,
      preferredMethod: 'UPI' as PaymentMethodEnum
    },
    {
      customerId: 'CUST-PATEL-008',
      name: 'Devansh Patel',
      email: 'dev.patel@gmail.com',
      totalPayments: 11,
      successfulPayments: 8,
      recoveredPayments: 0,
      preferredMethod: 'WALLET' as PaymentMethodEnum
    },
    {
      customerId: 'CUST-VERMA-009',
      name: 'Neha Verma',
      email: 'neha.v@designstudio.in',
      totalPayments: 14,
      successfulPayments: 13,
      recoveredPayments: 2,
      preferredMethod: 'UPI' as PaymentMethodEnum
    },
    {
      customerId: 'CUST-REDDY-010',
      name: 'Arjun Reddy',
      email: 'arjun.reddy@gmail.com',
      totalPayments: 7,
      successfulPayments: 6,
      recoveredPayments: 0,
      preferredMethod: 'CARD' as PaymentMethodEnum
    }
  ];

  const insertedCustomers = await Customer.insertMany(customersData);
  console.log(`✅ ${insertedCustomers.length} customers inserted.`);

  const custMap: Record<string, mongoose.Types.ObjectId> = {};
  insertedCustomers.forEach(c => {
    custMap[c.customerId] = c._id as mongoose.Types.ObjectId;
  });

  console.log('💳 Seeding Payments...');
  interface SeedPaymentInput {
    paymentId: string;
    customerId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    method: PaymentMethodEnum;
    status: PaymentStatusEnum;
    gateway: string;
    failureReason?: string;
    retryCount: number;
  }

  const paymentsData: SeedPaymentInput[] = [
    // Hero Payment RV-28491
    {
      paymentId: 'RV-28491',
      customerId: custMap['CUST-AISHA-001'],
      amount: 4999,
      currency: 'INR',
      method: 'CARD',
      status: 'FAILED',
      gateway: 'Razorpay',
      failureReason: 'Temporary bank server timeout',
      retryCount: 1
    },
    {
      paymentId: 'RV-28487',
      customerId: custMap['CUST-MEHTA-002'],
      amount: 8999,
      currency: 'INR',
      method: 'CARD',
      status: 'FAILED',
      gateway: 'PhonePe',
      failureReason: 'issuer unavailable',
      retryCount: 2
    },
    {
      paymentId: 'RV-28476',
      customerId: custMap['CUST-JOSEPH-003'],
      amount: 24500,
      currency: 'INR',
      method: 'NETBANKING',
      status: 'FAILED',
      gateway: 'PayU',
      failureReason: 'authentication failure',
      retryCount: 3
    },
    {
      paymentId: 'RV-28463',
      customerId: custMap['CUST-SHAH-004'],
      amount: 899,
      currency: 'INR',
      method: 'UPI',
      status: 'FAILED',
      gateway: 'Cashfree',
      failureReason: 'UPI technical failure',
      retryCount: 1
    },
    {
      paymentId: 'RV-28438',
      customerId: custMap['CUST-SHARMA-005'],
      amount: 32000,
      currency: 'INR',
      method: 'CARD',
      status: 'RECOVERED',
      gateway: 'Razorpay',
      failureReason: 'network timeout',
      retryCount: 1
    },
    {
      paymentId: 'RV-28450',
      customerId: custMap['CUST-RAO-006'],
      amount: 14200,
      currency: 'INR',
      method: 'CARD',
      status: 'PENDING',
      gateway: 'Razorpay',
      failureReason: 'insufficient balance',
      retryCount: 2
    },
    {
      paymentId: 'RV-28421',
      customerId: custMap['CUST-NAIR-007'],
      amount: 6499,
      currency: 'INR',
      method: 'UPI',
      status: 'FAILED',
      gateway: 'PhonePe',
      failureReason: 'UPI technical failure',
      retryCount: 2
    },
    {
      paymentId: 'RV-28410',
      customerId: custMap['CUST-PATEL-008'],
      amount: 11800,
      currency: 'INR',
      method: 'NETBANKING',
      status: 'FAILED',
      gateway: 'PayU',
      failureReason: 'authentication failure',
      retryCount: 4
    },
    {
      paymentId: 'RV-28399',
      customerId: custMap['CUST-VERMA-009'],
      amount: 18500,
      currency: 'INR',
      method: 'UPI',
      status: 'RECOVERED',
      gateway: 'Razorpay',
      failureReason: 'temporary bank timeout',
      retryCount: 1
    },
    {
      paymentId: 'RV-28385',
      customerId: custMap['CUST-REDDY-010'],
      amount: 5499,
      currency: 'INR',
      method: 'CARD',
      status: 'FAILED',
      gateway: 'PhonePe',
      failureReason: 'network timeout',
      retryCount: 3
    }
  ];

  // Seed 20 historical/successful payments
  for (let i = 1; i <= 20; i++) {
    const keys = Object.keys(custMap);
    const chosenCustId = keys[i % keys.length];
    paymentsData.push({
      paymentId: `TXN-DEMO-${1000 + i}`,
      customerId: custMap[chosenCustId],
      amount: Math.floor(Math.random() * 8000) + 1000,
      currency: 'INR',
      method: (i % 2 === 0 ? 'UPI' : 'CARD') as PaymentMethodEnum,
      status: 'SUCCESS' as PaymentStatusEnum,
      gateway: i % 3 === 0 ? 'Razorpay' : i % 3 === 1 ? 'PhonePe' : 'PayU',
      retryCount: 0
    });
  }

  const insertedPayments = await Payment.insertMany(paymentsData);
  console.log(`✅ ${insertedPayments.length} payments inserted.`);

  const payMap: Record<string, mongoose.Types.ObjectId> = {};
  insertedPayments.forEach(p => {
    payMap[p.paymentId] = p._id as mongoose.Types.ObjectId;
  });

  console.log('🤖 Seeding Recovery Decisions & Outcomes...');

  // Hero Decision for RV-28491
  const heroDecision = await RecoveryDecision.create({
    decisionId: 'DEC-RV-28491',
    paymentId: payMap['RV-28491'],
    probability: 0.82,
    confidence: 'HIGH' as ConfidenceLevelEnum,
    recommendation: 'Wait 90 minutes, then retry via UPI',
    recommendedMethod: 'UPI' as PaymentMethodEnum,
    delayMinutes: 90,
    reasoning: [
      'Customer has 5 successful historical payments',
      'Previous UPI payments succeeded',
      'Failure appears consistent with a temporary bank/server issue',
      'Similar payment failures recovered after delayed retries'
    ],
    modelVersion: 'Revive Recovery Engine v1',
    policyStatus: 'APPROVED' as PolicyStatusEnum,
    status: 'APPROVED' as DecisionStatusEnum
  });

  const heroOutcome = await RecoveryOutcome.create({
    outcomeId: 'OUT-RV-28491',
    paymentId: payMap['RV-28491'],
    decisionId: heroDecision._id,
    action: 'Wait 90 minutes, then retry via UPI',
    executionStatus: 'SCHEDULED' as ExecutionStatusEnum,
    recovered: false,
    recoveredAmount: 0
  });

  // Decision 2
  const decision2 = await RecoveryDecision.create({
    decisionId: 'DEC-RV-28487',
    paymentId: payMap['RV-28487'],
    probability: 0.81,
    confidence: 'HIGH' as ConfidenceLevelEnum,
    recommendation: 'Send 1-Click WhatsApp Recovery Link',
    recommendedMethod: 'UPI' as PaymentMethodEnum,
    delayMinutes: 30,
    reasoning: [
      'Customer responds quickly to mobile push notifications',
      'Card issuer outage predicted to resolve within 30 minutes'
    ],
    modelVersion: 'Revive Recovery Engine v1',
    policyStatus: 'APPROVED' as PolicyStatusEnum,
    status: 'APPROVED' as DecisionStatusEnum
  });

  const outcome2 = await RecoveryOutcome.create({
    outcomeId: 'OUT-RV-28487',
    paymentId: payMap['RV-28487'],
    decisionId: decision2._id,
    action: 'Sent WhatsApp payment link',
    executionStatus: 'EXECUTED' as ExecutionStatusEnum,
    recovered: false,
    recoveredAmount: 0,
    executedAt: new Date()
  });

  // Decision 3
  const decision3 = await RecoveryDecision.create({
    decisionId: 'DEC-RV-28476',
    paymentId: payMap['RV-28476'],
    probability: 0.42,
    confidence: 'MEDIUM' as ConfidenceLevelEnum,
    recommendation: 'Escalate to merchant human review',
    recommendedMethod: 'NETBANKING' as PaymentMethodEnum,
    delayMinutes: 0,
    reasoning: [
      'High transaction value exceeding automated mandate retry cap',
      'Multiple previous mandate failures detected'
    ],
    modelVersion: 'Revive Recovery Engine v1',
    policyStatus: 'REJECTED' as PolicyStatusEnum,
    status: 'REJECTED' as DecisionStatusEnum
  });

  const outcome3 = await RecoveryOutcome.create({
    outcomeId: 'OUT-RV-28476',
    paymentId: payMap['RV-28476'],
    decisionId: decision3._id,
    action: 'Escalated to human review queue',
    executionStatus: 'CANCELLED' as ExecutionStatusEnum,
    recovered: false,
    recoveredAmount: 0
  });

  // Decision 4
  const decision4 = await RecoveryDecision.create({
    decisionId: 'DEC-RV-28438',
    paymentId: payMap['RV-28438'],
    probability: 0.88,
    confidence: 'HIGH' as ConfidenceLevelEnum,
    recommendation: 'Auto-retry Card Mandate',
    recommendedMethod: 'CARD' as PaymentMethodEnum,
    delayMinutes: 15,
    reasoning: [
      'Soft 3DS timeout; gateway recovery rate is 88% within 20 mins'
    ],
    modelVersion: 'Revive Recovery Engine v1',
    policyStatus: 'APPROVED' as PolicyStatusEnum,
    status: 'COMPLETED' as DecisionStatusEnum
  });

  const outcome4 = await RecoveryOutcome.create({
    outcomeId: 'OUT-RV-28438',
    paymentId: payMap['RV-28438'],
    decisionId: decision4._id,
    action: 'Executed automated card mandate retry',
    executionStatus: 'EXECUTED' as ExecutionStatusEnum,
    recovered: true,
    recoveredAmount: 32000,
    executedAt: new Date()
  });

  // Decision 5
  const decision5 = await RecoveryDecision.create({
    decisionId: 'DEC-RV-28421',
    paymentId: payMap['RV-28421'],
    probability: 0.35,
    confidence: 'LOW' as ConfidenceLevelEnum,
    recommendation: 'Request customer VPA re-validation',
    recommendedMethod: 'UPI' as PaymentMethodEnum,
    delayMinutes: 60,
    reasoning: [
      'Invalid VPA address error code from PhonePe gateway'
    ],
    modelVersion: 'Revive Recovery Engine v1',
    policyStatus: 'PENDING' as PolicyStatusEnum,
    status: 'GENERATED' as DecisionStatusEnum
  });

  const outcome5 = await RecoveryOutcome.create({
    outcomeId: 'OUT-RV-28421',
    paymentId: payMap['RV-28421'],
    decisionId: decision5._id,
    action: 'Awaiting policy approval',
    executionStatus: 'SCHEDULED' as ExecutionStatusEnum,
    recovered: false,
    recoveredAmount: 0
  });

  const decisionsCount = [heroDecision, decision2, decision3, decision4, decision5].length;
  const outcomesCount = [heroOutcome, outcome2, outcome3, outcome4, outcome5].length;

  console.log('🧪 Seeding Recovery Experiments...');
  await RecoveryExperiment.create({
    experimentId: 'EXP-001',
    name: 'Retry Timing Optimization',
    description: 'Compare 90-minute and 30-minute retry timing for temporary bank server timeouts',
    status: 'RUNNING',
    metric: 'RECOVERY_RATE',
    control: {
      variantId: 'CONTROL',
      name: 'Control (90 Min)',
      strategy: 'Wait 90 minutes → Retry via UPI',
      waitMinutes: 90,
      paymentMethod: 'UPI',
      eligiblePayments: 15,
      recoveryAttempts: 15,
      successfulRecoveries: 5,
      recoveredAmount: 18200,
      recoveryRate: 33.3
    },
    challenger: {
      variantId: 'CHALLENGER',
      name: 'Challenger (30 Min)',
      strategy: 'Wait 30 minutes → Retry via UPI',
      waitMinutes: 30,
      paymentMethod: 'UPI',
      eligiblePayments: 15,
      recoveryAttempts: 15,
      successfulRecoveries: 7,
      recoveredAmount: 24500,
      recoveryRate: 46.7
    },
    variants: [
      {
        variantId: 'CONTROL',
        name: 'Control (90 Min)',
        strategy: 'Wait 90 minutes → Retry via UPI',
        waitMinutes: 90,
        paymentMethod: 'UPI',
        eligiblePayments: 15,
        recoveryAttempts: 15,
        successfulRecoveries: 5,
        recoveredAmount: 18200,
        recoveryRate: 33.3
      },
      {
        variantId: 'CHALLENGER',
        name: 'Challenger (30 Min)',
        strategy: 'Wait 30 minutes → Retry via UPI',
        waitMinutes: 30,
        paymentMethod: 'UPI',
        eligiblePayments: 15,
        recoveryAttempts: 15,
        successfulRecoveries: 7,
        recoveredAmount: 24500,
        recoveryRate: 46.7
      }
    ]
  });

  return {
    customersCount: insertedCustomers.length,
    paymentsCount: insertedPayments.length,
    decisionsCount,
    outcomesCount
  };
};
