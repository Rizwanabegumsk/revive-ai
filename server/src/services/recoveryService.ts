import { Payment } from '../models/Payment';
import { Customer } from '../models/Customer';
import { RecoveryDecision } from '../models/RecoveryDecision';
import { RecoveryOutcome } from '../models/RecoveryOutcome';
import { RecoveryEngine } from './recoveryEngine';
import { PolicyEngine } from './policyEngine';
import { ICustomer } from '../types';

export class RecoveryService {
  public static async getPayments() {
    return Payment.find().populate('customerId').sort({ createdAt: -1 });
  }

  public static async getPaymentById(paymentId: string) {
    const payment = await Payment.findOne({ paymentId }).populate('customerId');
    if (!payment) return null;

    let decision = await RecoveryDecision.findOne({ paymentId: payment._id });
    const outcome = await RecoveryOutcome.findOne({ paymentId: payment._id });

    const customerObj = (payment.customerId && typeof payment.customerId === 'object')
      ? (payment.customerId as ICustomer)
      : null;

    // If decision does not exist or lacks signals, generate using Revive Recovery Engine v1
    if (!decision || !decision.signals || decision.signals.length === 0) {
      const engineOutput = RecoveryEngine.analyzePayment(payment, customerObj);

      if (!decision) {
        decision = await RecoveryDecision.create({
          decisionId: `DEC-${payment.paymentId}`,
          paymentId: payment._id,
          probability: engineOutput.probability,
          confidence: engineOutput.confidence,
          recommendation: engineOutput.recommendation,
          recommendedAction: engineOutput.recommendedAction,
          recommendedMethod: engineOutput.recommendedMethod,
          delayMinutes: engineOutput.delayMinutes,
          reasoning: engineOutput.reasoning,
          signals: engineOutput.signals,
          modelVersion: engineOutput.modelVersion,
          policyStatus: 'PENDING',
          status: 'GENERATED'
        });
      } else {
        decision.probability = engineOutput.probability;
        decision.confidence = engineOutput.confidence;
        decision.recommendation = engineOutput.recommendation;
        decision.recommendedAction = engineOutput.recommendedAction;
        decision.recommendedMethod = engineOutput.recommendedMethod;
        decision.delayMinutes = engineOutput.delayMinutes;
        decision.reasoning = engineOutput.reasoning;
        decision.signals = engineOutput.signals;
        decision.modelVersion = engineOutput.modelVersion;
        await decision.save();
      }
    }

    // Evaluate Policy Engine
    const policyDecision = PolicyEngine.evaluatePolicy(payment, decision, customerObj);

    // Sync Policy Status on RecoveryDecision document
    decision.policyStatus = policyDecision.status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    decision.status = policyDecision.status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    decision.policyChecks = policyDecision.checks.map(c => ({
      rule: c.name,
      passed: c.passed,
      explanation: c.description
    }));
    decision.policyReason = policyDecision.reasons.join('; ');
    await decision.save();

    return {
      payment,
      decision,
      policyDecision,
      outcome
    };
  }

  public static async getCustomers() {
    return Customer.find().sort({ createdAt: -1 });
  }

  public static async getCustomerById(customerId: string) {
    return Customer.findOne({ customerId });
  }

  public static async getRecoveryDecisions() {
    return RecoveryDecision.find().populate('paymentId').sort({ createdAt: -1 });
  }

  public static async getRecoveryDecisionById(decisionId: string) {
    return RecoveryDecision.findOne({ decisionId }).populate('paymentId');
  }

  public static async getRecoveryOutcomes() {
    return RecoveryOutcome.find().populate('paymentId').populate('decisionId').sort({ createdAt: -1 });
  }

  public static async getRecoveryContext(paymentId: string) {
    const data = await this.getPaymentById(paymentId);
    if (!data || !data.payment) return null;
    return {
      payment: data.payment,
      customer: data.payment.customerId
    };
  }

  public static async generateRecoveryDecision(paymentIdStr: string) {
    const payment = await Payment.findOne({ paymentId: paymentIdStr }).populate('customerId');
    if (!payment) return null;

    const customerObj = (payment.customerId && typeof payment.customerId === 'object')
      ? (payment.customerId as ICustomer)
      : null;

    return RecoveryEngine.analyzePayment(payment, customerObj);
  }
}
