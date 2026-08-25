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

  console.log('👤 Seeding 30 Customers...');
  const customersData = [
    { customerId: 'CUST-AISHA-001', name: 'Aisha Khan', email: 'aisha@example.com', preferredMethod: 'UPI' },
    { customerId: 'CUST-MEHTA-002', name: 'Rahul Mehta', email: 'rahul.m88@outlook.com', preferredMethod: 'CARD' },
    { customerId: 'CUST-JOSEPH-003', name: 'Sara Joseph', email: 'sara.j@yahoo.co.in', preferredMethod: 'NETBANKING' },
    { customerId: 'CUST-SHAH-004', name: 'Karan Shah', email: 'karan.shah@rediffmail.com', preferredMethod: 'UPI' },
    { customerId: 'CUST-SHARMA-005', name: 'Vikram Sharma', email: 'vikram.s@techcorp.in', preferredMethod: 'CARD' },
    { customerId: 'CUST-RAO-006', name: 'Ananya Rao', email: 'ananya.rao@gmail.com', preferredMethod: 'UPI' },
    { customerId: 'CUST-NAIR-007', name: 'Priyanka Nair', email: 'priyanka.nair@hotmail.com', preferredMethod: 'UPI' },
    { customerId: 'CUST-PATEL-008', name: 'Devansh Patel', email: 'devansh.p@gmail.com', preferredMethod: 'NETBANKING' },
    { customerId: 'CUST-VERMA-009', name: 'Neha Verma', email: 'neha.v@designstudio.in', preferredMethod: 'UPI' },
    { customerId: 'CUST-REDDY-010', name: 'Arjun Reddy', email: 'arjun.reddy@gmail.com', preferredMethod: 'CARD' },
    { customerId: 'CUST-GUPTA-011', name: 'Pooja Gupta', email: 'pooja.g@gmail.com', preferredMethod: 'UPI' },
    { customerId: 'CUST-JOSHI-012', name: 'Rohan Joshi', email: 'rohan.j@outlook.com', preferredMethod: 'CARD' },
    { customerId: 'CUST-IYER-013', name: 'Siddharth Iyer', email: 'sid.i@gmail.com', preferredMethod: 'NETBANKING' },
    { customerId: 'CUST-KAPOOR-014', name: 'Tanvi Kapoor', email: 'tanvi.k@gmail.com', preferredMethod: 'WALLET' },
    { customerId: 'CUST-SEN-015', name: 'Aditya Sen', email: 'aditya.s@techcorp.in', preferredMethod: 'CARD' },
    { customerId: 'CUST-DUTTA-016', name: 'Ishita Dutta', email: 'ishita.d@yahoo.co.in', preferredMethod: 'UPI' },
    { customerId: 'CUST-DHAWAN-017', name: 'Varun Dhawan', email: 'varun.d@gmail.com', preferredMethod: 'UPI' },
    { customerId: 'CUST-BHATT-018', name: 'Alia Bhatt', email: 'alia.b@outlook.com', preferredMethod: 'CARD' },
    { customerId: 'CUST-KAUR-019', name: 'Simran Kaur', email: 'simran.k@gmail.com', preferredMethod: 'UPI' },
    { customerId: 'CUST-CHOPRA-020', name: 'Deepak Chopra', email: 'deepak.c@rediffmail.com', preferredMethod: 'NETBANKING' },
    { customerId: 'CUST-MALHOTRA-021', name: 'Manish Malhotra', email: 'manish.m@gmail.com', preferredMethod: 'CARD' },
    { customerId: 'CUST-SANON-022', name: 'Kriti Sanon', email: 'kriti.s@gmail.com', preferredMethod: 'UPI' },
    { customerId: 'CUST-AKHTAR-023', name: 'Zoya Akhtar', email: 'zoya.a@gmail.com', preferredMethod: 'WALLET' },
    { customerId: 'CUST-BEDI-024', name: 'Kabir Bedi', email: 'kabir.b@techcorp.in', preferredMethod: 'CARD' },
    { customerId: 'CUST-KAMAT-025', name: 'Nikhil Kamat', email: 'nikhil.k@outlook.com', preferredMethod: 'UPI' },
    { customerId: 'CUST-DESHMUKH-026', name: 'Riteish Deshmukh', email: 'riteish.d@gmail.com', preferredMethod: 'NETBANKING' },
    { customerId: 'CUST-ROY-027', name: 'Mouni Roy', email: 'mouni.r@gmail.com', preferredMethod: 'UPI' },
    { customerId: 'CUST-SHETTY-028', name: 'Shilpa Shetty', email: 'shilpa.s@yahoo.co.in', preferredMethod: 'CARD' },
    { customerId: 'CUST-BACHCHAN-029', name: 'Amitabh Bachchan', email: 'bigb@gmail.com', preferredMethod: 'UPI' },
    { customerId: 'CUST-KHAN-030', name: 'Shahrukh Khan', email: 'srk@rediffmail.com', preferredMethod: 'CARD' }
  ].map(c => ({
    ...c,
    totalPayments: 0,
    successfulPayments: 0,
    recoveredPayments: 0,
    preferredMethod: c.preferredMethod as PaymentMethodEnum
  }));

  const insertedCustomers = await Customer.insertMany(customersData);
  console.log(`✅ ${insertedCustomers.length} customers inserted.`);

  const custMap: Record<string, mongoose.Types.ObjectId> = {};
  insertedCustomers.forEach((c: any) => {
    custMap[c.customerId] = c._id as mongoose.Types.ObjectId;
  });

  console.log('💳 Seeding 84 Payments with deterministic relative dates...');

  const now = new Date();
  const getOffsetDate = (daysAgo: number, hoursAgo = 0): Date => {
    const d = new Date(now.getTime());
    d.setDate(d.getDate() - daysAgo);
    d.setHours(d.getHours() - hoursAgo);
    return d;
  };

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
    createdAt: Date;
  }

  const paymentsData: SeedPaymentInput[] = [];
  const customerKeys = Object.keys(custMap);

  // Helper to add deterministic payments
  const addPayment = (
    paymentId: string,
    custKey: string,
    amount: number,
    method: PaymentMethodEnum,
    status: PaymentStatusEnum,
    gateway: string,
    failureReason: string | undefined,
    retryCount: number,
    daysAgo: number,
    hoursAgo = 0
  ) => {
    paymentsData.push({
      paymentId,
      customerId: custMap[custKey],
      amount,
      currency: 'INR',
      method,
      status,
      gateway,
      failureReason,
      retryCount,
      createdAt: getOffsetDate(daysAgo, hoursAgo)
    });
  };

  // ==========================================
  // GROUP 1: LAST 7 DAYS (20 Payments)
  // ==========================================
  // Hero Payment RV-28491 (Today - 0 days ago)
  addPayment('RV-28491', 'CUST-AISHA-001', 4999, 'CARD', 'FAILED', 'Razorpay', 'Temporary bank/server timeout', 1, 0, 2);
  addPayment('RV-28487', 'CUST-MEHTA-002', 8999, 'CARD', 'FAILED', 'PhonePe', 'Bank declined', 2, 0, 4);
  addPayment('RV-28476', 'CUST-JOSEPH-003', 24500, 'NETBANKING', 'FAILED', 'PayU', 'Authentication failure', 3, 0, 6);
  addPayment('RV-28463', 'CUST-SHAH-004', 899, 'UPI', 'FAILED', 'Cashfree', 'Gateway timeout', 1, 0, 8);
  addPayment('TXN-7001', 'CUST-NAIR-007', 1499, 'UPI', 'SUCCESS', 'Razorpay', undefined, 0, 1, 2);
  addPayment('RV-28450', 'CUST-RAO-006', 14200, 'CARD', 'PENDING', 'Razorpay', 'Insufficient funds', 2, 1, 6);
  addPayment('RV-28438', 'CUST-SHARMA-005', 32000, 'CARD', 'RECOVERED', 'Razorpay', 'Network error', 1, 1, 10);
  addPayment('TXN-7002', 'CUST-PATEL-008', 3499, 'NETBANKING', 'SUCCESS', 'PayU', undefined, 0, 2, 3);
  addPayment('RV-28421', 'CUST-NAIR-007', 6499, 'UPI', 'FAILED', 'PhonePe', 'Gateway timeout', 2, 2, 8);
  addPayment('TXN-7003', 'CUST-VERMA-009', 5999, 'UPI', 'SUCCESS', 'PhonePe', undefined, 0, 3, 1);
  addPayment('TXN-7004', 'CUST-REDDY-010', 2200, 'CARD', 'SUCCESS', 'Razorpay', undefined, 0, 3, 5);
  addPayment('RV-28410', 'CUST-PATEL-008', 11800, 'NETBANKING', 'FAILED', 'PayU', 'Authentication failure', 4, 4, 2);
  addPayment('TXN-7005', 'CUST-GUPTA-011', 7850, 'UPI', 'SUCCESS', 'Razorpay', undefined, 0, 4, 9);
  addPayment('RV-28399', 'CUST-VERMA-009', 18500, 'UPI', 'RECOVERED', 'Razorpay', 'Temporary bank/server timeout', 1, 5, 4);
  addPayment('TXN-7006', 'CUST-JOSHI-012', 1299, 'CARD', 'SUCCESS', 'Cashfree', undefined, 0, 5, 8);
  addPayment('RV-28385', 'CUST-REDDY-010', 5499, 'CARD', 'FAILED', 'PhonePe', 'Network error', 3, 6, 2);
  addPayment('TXN-7007', 'CUST-IYER-013', 9999, 'NETBANKING', 'SUCCESS', 'PayU', undefined, 0, 6, 7);
  addPayment('TXN-7008', 'CUST-KAPOOR-014', 4500, 'WALLET', 'SUCCESS', 'Razorpay', undefined, 0, 6, 11);
  addPayment('TXN-7009', 'CUST-SEN-015', 2800, 'CARD', 'FAILED', 'Razorpay', 'Limit exceeded', 1, 6, 15);
  addPayment('TXN-7010', 'CUST-DUTTA-016', 6200, 'UPI', 'SUCCESS', 'PhonePe', undefined, 0, 6, 18);

  // ==========================================
  // GROUP 2: LAST 8–30 DAYS (28 Payments)
  // Month-to-date (8-18 days ago): 20 Payments
  // Late July (20-29 days ago): 8 Payments
  // ==========================================
  const failureReasonsList = [
    'Temporary bank/server timeout',
    'Insufficient funds',
    'Authentication failure',
    'Bank declined',
    'Gateway timeout',
    'Network error',
    'Limit exceeded'
  ];
  const gatewaysList = ['Razorpay', 'PhonePe', 'PayU', 'Cashfree'];
  const methodsList: PaymentMethodEnum[] = ['UPI', 'CARD', 'NETBANKING', 'WALLET'];

  // MTD portion (8 to 18 days ago) -> 20 payments
  for (let i = 1; i <= 20; i++) {
    const custKey = customerKeys[(i + 10) % customerKeys.length];
    const daysAgo = 8 + (i % 11); // 8 to 18 days ago
    const isFailed = i % 3 === 0;
    const isRecovered = i % 7 === 0;
    const status: PaymentStatusEnum = isRecovered ? 'RECOVERED' : isFailed ? 'FAILED' : 'SUCCESS';
    const amount = 1500 + (i * 450);
    const method = methodsList[i % methodsList.length];
    const gateway = gatewaysList[i % gatewaysList.length];
    const failureReason = isFailed || isRecovered ? failureReasonsList[i % failureReasonsList.length] : undefined;

    addPayment(
      `TXN-MTD-${1000 + i}`,
      custKey,
      amount,
      method,
      status,
      gateway,
      failureReason,
      status === 'SUCCESS' ? 0 : (i % 3) + 1,
      daysAgo,
      i % 12
    );
  }

  // Late July portion (20 to 29 days ago) -> 8 payments
  for (let i = 1; i <= 8; i++) {
    const custKey = customerKeys[(i + 5) % customerKeys.length];
    const daysAgo = 20 + i; // 21 to 28 days ago
    const isFailed = i % 2 === 0;
    const status: PaymentStatusEnum = isFailed ? 'FAILED' : 'SUCCESS';
    const amount = 2200 + (i * 600);
    const method = methodsList[(i + 1) % methodsList.length];
    const gateway = gatewaysList[(i + 2) % gatewaysList.length];
    const failureReason = isFailed ? failureReasonsList[i % failureReasonsList.length] : undefined;

    addPayment(
      `TXN-JUL-${1000 + i}`,
      custKey,
      amount,
      method,
      status,
      gateway,
      failureReason,
      isFailed ? 2 : 0,
      daysAgo,
      i % 8
    );
  }

  // ==========================================
  // GROUP 3: OLDER THAN 30 DAYS (36 Payments)
  // (35 to 120 days ago)
  // ==========================================
  for (let i = 1; i <= 36; i++) {
    const custKey = customerKeys[i % customerKeys.length];
    const daysAgo = 35 + (i * 2); // 37 to 107 days ago
    const isFailed = i % 4 === 0;
    const isRecovered = i % 9 === 0;
    const status: PaymentStatusEnum = isRecovered ? 'RECOVERED' : isFailed ? 'FAILED' : 'SUCCESS';
    const amount = 1200 + (i * 320);
    const method = methodsList[i % methodsList.length];
    const gateway = gatewaysList[i % gatewaysList.length];
    const failureReason = isFailed || isRecovered ? failureReasonsList[i % failureReasonsList.length] : undefined;

    addPayment(
      `TXN-HIST-${1000 + i}`,
      custKey,
      amount,
      method,
      status,
      gateway,
      failureReason,
      status === 'SUCCESS' ? 0 : (i % 2) + 1,
      daysAgo,
      i % 14
    );
  }

  const insertedPayments = await Payment.insertMany(paymentsData);
  console.log(`✅ ${insertedPayments.length} payments inserted.`);

  // Recalculate and update Customer statistics based on actual inserted payments
  const customerStatsMap: Record<string, { total: number; success: number; recovered: number }> = {};
  insertedPayments.forEach((p: any) => {
    const custIdStr = p.customerId.toString();
    if (!customerStatsMap[custIdStr]) {
      customerStatsMap[custIdStr] = { total: 0, success: 0, recovered: 0 };
    }
    customerStatsMap[custIdStr].total += 1;
    if (p.status === 'SUCCESS') customerStatsMap[custIdStr].success += 1;
    if (p.status === 'RECOVERED' || p.recovered) customerStatsMap[custIdStr].recovered += 1;
  });

  for (const cust of insertedCustomers) {
    const stats = customerStatsMap[(cust._id as any).toString()] || { total: 0, success: 0, recovered: 0 };
    cust.totalPayments = stats.total;
    cust.successfulPayments = stats.success;
    cust.recoveredPayments = stats.recovered;
    await cust.save();
  }

  const payMap: Record<string, mongoose.Types.ObjectId> = {};
  insertedPayments.forEach((p: any) => {
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

  // Decision 2 (RV-28487)
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

  // Decision 3 (RV-28476)
  const decision3 = await RecoveryDecision.create({
    decisionId: 'DEC-RV-28476',
    paymentId: payMap['RV-28476'],
    probability: 0.22,
    confidence: 'LOW' as ConfidenceLevelEnum,
    recommendation: 'Manual Review / Escalation Required',
    recommendedMethod: 'NETBANKING' as PaymentMethodEnum,
    delayMinutes: 0,
    reasoning: [
      'High transaction value (₹24,500)',
      'Multiple previous authentication failures detected'
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

  // Decision 4 (RV-28438)
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

  // Decision 5 (RV-28421)
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
