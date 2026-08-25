import { Payment } from '../models/Payment';
import { RecoveryDecision } from '../models/RecoveryDecision';
import { RecoveryOutcome } from '../models/RecoveryOutcome';
import { PolicyEngine } from './policyEngine';
import { ICustomer } from '../types';

export interface IAnalyticsOverview {
  totalRevenueAtRisk: number;
  totalRevenueRecovered: number;
  recoveryRate: number;
  failedPaymentCount: number;
  recoveredPaymentCount: number;
  averageRecoveryProbability: number;
  aiAssistedRecoveryCount: number;
  averageRecoveredAmount: number;
}

export interface ITrendPoint {
  date: string;
  failedAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
  totalFailedCount: number;
}

export interface IMethodMetric {
  method: string;
  attempts: number;
  successfulRecoveries: number;
  recoveredAmount: number;
  successRate: number;
}

export interface IFailureMetric {
  failureReason: string;
  paymentCount: number;
  amountAtRisk: number;
  recoverableAmount: number;
  recoveredAmount: number;
  recoveryRate: number;
}

export interface IGatewayMetric {
  gateway: string;
  failedPayments: number;
  recoveredPayments: number;
  amountAtRisk: number;
  recoveredAmount: number;
  recoveryRate: number;
}

export interface ITopRecoverableItem {
  paymentId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  failureReason: string;
  recoveryProbability: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedMethod: string;
  policyStatus: 'APPROVED' | 'BLOCKED' | 'MANUAL_REVIEW';
}

export class AnalyticsService {
  /**
   * Calculates overall revenue recovery core metrics from MongoDB database.
   */
  public static async getRecoveryOverview(): Promise<IAnalyticsOverview> {
    const allPayments = await Payment.find();
    const successfulOutcomes = await RecoveryOutcome.find({ recovered: true });
    const allDecisions = await RecoveryDecision.find();

    let totalRevenueAtRisk = 0;
    let failedPaymentCount = 0;
    let recoveredPaymentCount = 0;

    allPayments.forEach(p => {
      if (p.status === 'RECOVERED' || p.recovered) {
        recoveredPaymentCount += 1;
      } else if (p.status === 'FAILED') {
        failedPaymentCount += 1;
        totalRevenueAtRisk += p.amount;
      }
    });

    let totalRevenueRecovered = 0;
    successfulOutcomes.forEach(o => {
      totalRevenueRecovered += o.amountRecovered || o.recoveredAmount || 0;
    });

    // Add any recovered payments in Payment model not captured in outcomes
    const recoveredPaymentsNotInOutcomes = allPayments.filter(
      p => (p.status === 'RECOVERED' || p.recovered) &&
      !successfulOutcomes.some(o => o.paymentId.toString() === p._id.toString())
    );
    recoveredPaymentsNotInOutcomes.forEach(p => {
      totalRevenueRecovered += p.recoveredAmount || p.amount;
    });

    const totalRevenueBase = totalRevenueAtRisk + totalRevenueRecovered;
    const recoveryRate = totalRevenueBase > 0
      ? Number(((totalRevenueRecovered / totalRevenueBase) * 100).toFixed(1))
      : 0;

    let totalProbability = 0;
    allDecisions.forEach(d => {
      totalProbability += d.probability;
    });
    const averageRecoveryProbability = allDecisions.length > 0
      ? Number(((totalProbability / allDecisions.length) * 100).toFixed(1))
      : 0;

    // AI-Assisted recoveries: decisions linked to successful outcomes
    const aiAssistedCount = successfulOutcomes.length;

    const averageRecoveredAmount = recoveredPaymentCount > 0
      ? Math.round(totalRevenueRecovered / recoveredPaymentCount)
      : 0;

    return {
      totalRevenueAtRisk,
      totalRevenueRecovered,
      recoveryRate,
      failedPaymentCount,
      recoveredPaymentCount,
      averageRecoveryProbability,
      aiAssistedRecoveryCount: aiAssistedCount,
      averageRecoveredAmount
    };
  }

  /**
   * Generates time-series trend data from database records.
   */
  public static async getRecoveryTrends(): Promise<ITrendPoint[]> {
    const payments = await Payment.find().sort({ createdAt: 1 });
    const outcomes = await RecoveryOutcome.find({ recovered: true });

    const trendMap: Record<string, { failedAmount: number; recoveredAmount: number; count: number }> = {};

    payments.forEach(p => {
      const dateKey = new Date(p.createdAt || Date.now()).toISOString().split('T')[0];
      if (!trendMap[dateKey]) {
        trendMap[dateKey] = { failedAmount: 0, recoveredAmount: 0, count: 0 };
      }
      if (p.status === 'FAILED') {
        trendMap[dateKey].failedAmount += p.amount;
        trendMap[dateKey].count += 1;
      }
    });

    outcomes.forEach(o => {
      const dateKey = new Date(o.executedAt || o.createdAt || Date.now()).toISOString().split('T')[0];
      if (!trendMap[dateKey]) {
        trendMap[dateKey] = { failedAmount: 0, recoveredAmount: 0, count: 0 };
      }
      trendMap[dateKey].recoveredAmount += o.amountRecovered || o.recoveredAmount || 0;
    });

    const dates = Object.keys(trendMap).sort();
    return dates.map(d => {
      const item = trendMap[d];
      const total = item.failedAmount + item.recoveredAmount;
      const rate = total > 0 ? Number(((item.recoveredAmount / total) * 100).toFixed(1)) : 0;
      return {
        date: d,
        failedAmount: item.failedAmount,
        recoveredAmount: item.recoveredAmount,
        recoveryRate: rate,
        totalFailedCount: item.count
      };
    });
  }

  /**
   * Aggregates recovery metrics grouped by payment method.
   */
  public static async getRecoveryByMethod(): Promise<IMethodMetric[]> {
    const methods = ['UPI', 'CARD', 'NETBANKING', 'WALLET'];
    const payments = await Payment.find();
    const outcomes = await RecoveryOutcome.find({ recovered: true });

    return methods.map(m => {
      const methodPayments = payments.filter(p => p.method === m);
      const attempts = methodPayments.length;
      const methodOutcomes = outcomes.filter(o => o.method === m);

      let recoveredAmount = 0;
      methodOutcomes.forEach(o => {
        recoveredAmount += o.amountRecovered || o.recoveredAmount || 0;
      });

      const successfulRecoveries = methodPayments.filter(p => p.status === 'RECOVERED' || p.recovered).length;
      const successRate = attempts > 0 ? Number(((successfulRecoveries / attempts) * 100).toFixed(1)) : 0;

      return {
        method: m,
        attempts,
        successfulRecoveries,
        recoveredAmount,
        successRate
      };
    });
  }

  /**
   * Aggregates recovery metrics grouped by failure reason.
   */
  public static async getRecoveryByFailureReason(): Promise<IFailureMetric[]> {
    const payments = await Payment.find();
    const decisions = await RecoveryDecision.find();
    const outcomes = await RecoveryOutcome.find({ recovered: true });

    const decMap: Record<string, any> = {};
    decisions.forEach(d => {
      decMap[d.paymentId.toString()] = d;
    });

    const reasonMap: Record<string, { count: number; risk: number; recoverable: number; recovered: number }> = {};

    payments.forEach(p => {
      const reason = p.failureReason || 'Other Error';
      if (!reasonMap[reason]) {
        reasonMap[reason] = { count: 0, risk: 0, recoverable: 0, recovered: 0 };
      }
      reasonMap[reason].count += 1;

      if (p.status === 'RECOVERED' || p.recovered) {
        reasonMap[reason].recovered += p.recoveredAmount || p.amount;
      } else if (p.status === 'FAILED') {
        reasonMap[reason].risk += p.amount;
        const dec = decMap[p._id.toString()];
        if (dec && dec.probability >= 0.50) {
          reasonMap[reason].recoverable += p.amount;
        }
      }
    });

    // Incorporate outcome amounts
    outcomes.forEach(o => {
      const p = payments.find(pay => pay._id.toString() === o.paymentId.toString());
      if (p) {
        const reason = p.failureReason || 'Other Error';
        if (reasonMap[reason] && reasonMap[reason].recovered === 0) {
          reasonMap[reason].recovered += o.amountRecovered || o.recoveredAmount || 0;
        }
      }
    });

    return Object.keys(reasonMap).map(r => {
      const item = reasonMap[r];
      const totalBase = item.risk + item.recovered;
      const rate = totalBase > 0 ? Number(((item.recovered / totalBase) * 100).toFixed(1)) : 0;
      return {
        failureReason: r,
        paymentCount: item.count,
        amountAtRisk: item.risk,
        recoverableAmount: item.recoverable,
        recoveredAmount: item.recovered,
        recoveryRate: rate
      };
    }).sort((a, b) => b.amountAtRisk - a.amountAtRisk);
  }

  /**
   * Aggregates recovery metrics grouped by gateway.
   */
  public static async getRecoveryByGateway(): Promise<IGatewayMetric[]> {
    const gateways = ['Razorpay', 'PhonePe', 'PayU', 'Cashfree'];
    const payments = await Payment.find();
    const outcomes = await RecoveryOutcome.find({ recovered: true });

    return gateways.map(g => {
      const gatewayPayments = payments.filter(p => p.gateway.toLowerCase() === g.toLowerCase());
      const failedPayments = gatewayPayments.filter(p => p.status === 'FAILED' && !p.recovered).length;
      const recoveredPayments = gatewayPayments.filter(p => p.status === 'RECOVERED' || p.recovered).length;

      let amountAtRisk = 0;
      gatewayPayments.filter(p => p.status === 'FAILED' && !p.recovered).forEach(p => {
        amountAtRisk += p.amount;
      });

      let recoveredAmount = 0;
      gatewayPayments.filter(p => p.status === 'RECOVERED' || p.recovered).forEach(p => {
        recoveredAmount += p.recoveredAmount || p.amount;
      });

      const totalBase = amountAtRisk + recoveredAmount;
      const recoveryRate = totalBase > 0 ? Number(((recoveredAmount / totalBase) * 100).toFixed(1)) : 0;

      return {
        gateway: g,
        failedPayments,
        recoveredPayments,
        amountAtRisk,
        recoveredAmount,
        recoveryRate
      };
    });
  }

  /**
   * Retrieves high-value failed payments sorted by recovery probability DESC, amount DESC.
   */
  public static async getTopRecoverablePayments(): Promise<ITopRecoverableItem[]> {
    const payments = await Payment.find({ status: 'FAILED', recovered: { $ne: true } }).populate('customerId');
    const decisions = await RecoveryDecision.find();

    const decMap: Record<string, any> = {};
    decisions.forEach(d => {
      decMap[d.paymentId.toString()] = d;
    });

    const items: ITopRecoverableItem[] = [];

    payments.forEach(p => {
      const dec = decMap[p._id.toString()];
      const customer = (p.customerId && typeof p.customerId === 'object') ? (p.customerId as ICustomer) : null;

      const prob = dec ? dec.probability : 0.60;
      const conf = dec ? dec.confidence : 'MEDIUM';
      const method = dec ? dec.recommendedMethod : p.method;

      // Evaluate policy for item
      const policyRes = dec
        ? PolicyEngine.evaluatePolicy(p, dec, customer)
        : PolicyEngine.evaluatePolicy(p, { probability: prob, recommendedMethod: method }, customer);

      items.push({
        paymentId: p.paymentId,
        amount: p.amount,
        customerName: customer ? customer.name : 'Merchant Customer',
        customerEmail: customer ? customer.email : 'customer@example.com',
        failureReason: p.failureReason || 'Gateway Timeout',
        recoveryProbability: Math.round(prob * 100),
        confidence: conf,
        recommendedMethod: method,
        policyStatus: policyRes.status
      });
    });

    return items
      .sort((a, b) => {
        if (b.recoveryProbability !== a.recoveryProbability) {
          return b.recoveryProbability - a.recoveryProbability;
        }
        return b.amount - a.amount;
      })
      .slice(0, 10);
  }
}
