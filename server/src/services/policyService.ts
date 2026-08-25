import { IPayment, IRecoveryDecision, ICustomer } from '../types';
import { Payment } from '../models/Payment';
import { RecoveryDecision } from '../models/RecoveryDecision';
import { PolicyEngine, IPolicyEvaluationOutput } from './policyEngine';

export class PolicyService {
  /**
   * Evaluates deterministic merchant safety & authorization policy rules via PolicyEngine.
   * "AI RECOMMENDS. POLICY AUTHORIZES."
   */
  public static evaluatePolicyRules(
    payment: IPayment,
    decision: IRecoveryDecision,
    customer?: ICustomer | null
  ): IPolicyEvaluationOutput {
    return PolicyEngine.evaluatePolicy(payment, decision, customer);
  }

  /**
   * Evaluates recovery policy for a paymentId and updates the underlying RecoveryDecision document.
   */
  public static async evaluateAndPersist(paymentIdStr: string): Promise<{
    payment: IPayment;
    decision: IRecoveryDecision;
    policyResult: IPolicyEvaluationOutput;
  } | null> {
    const payment = await Payment.findOne({ paymentId: paymentIdStr }).populate('customerId');
    if (!payment) return null;

    let decision = await RecoveryDecision.findOne({ paymentId: payment._id });

    // Fallback if decision does not exist yet (Default structure)
    if (!decision) {
      decision = await RecoveryDecision.create({
        decisionId: `DEC-${payment.paymentId}`,
        paymentId: payment._id,
        probability: payment.status === 'FAILED' ? 0.82 : 0.0,
        confidence: 'HIGH',
        recommendation: 'Wait 90 minutes, then retry via UPI',
        recommendedMethod: 'UPI',
        delayMinutes: 90,
        reasoning: ['Default recovery decision generated for policy evaluation'],
        modelVersion: 'Revive Recovery Engine v1',
        policyStatus: 'PENDING',
        status: 'GENERATED'
      });
    }

    const customerObj = (payment.customerId && typeof payment.customerId === 'object')
      ? (payment.customerId as ICustomer)
      : null;

    const policyResult = PolicyEngine.evaluatePolicy(payment, decision, customerObj);

    // Persist policy evaluation result in RecoveryDecision
    decision.policyStatus = policyResult.status;
    decision.status = policyResult.status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    decision.policyChecks = policyResult.checks.map(c => ({
      rule: c.name,
      passed: c.passed,
      explanation: c.description
    }));
    decision.policyReason = policyResult.reasons.join('; ');
    await decision.save();

    return {
      payment,
      decision,
      policyResult
    };
  }
}
