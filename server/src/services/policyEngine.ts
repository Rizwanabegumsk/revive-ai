import { IPayment, IRecoveryDecision, ICustomer } from '../types';
import { RECOVERY_POLICY } from '../config/policyConfig';

export interface IPolicyCheckItem {
  name: string;
  passed: boolean;
  description: string;
}

export interface IPolicyEvaluationOutput {
  status: 'APPROVED' | 'BLOCKED' | 'MANUAL_REVIEW';
  allowed: boolean;
  reasons: string[];
  checks: IPolicyCheckItem[];
  policyVersion: string;
}

export class PolicyEngine {
  public static readonly POLICY_VERSION = 'policy-v1';

  /**
   * Deterministically evaluates payment + decision against merchant safety policies.
   * Architecture: Failed Payment -> Recovery Engine -> AI Recommendation -> Policy Engine -> APPROVED/BLOCKED/MANUAL_REVIEW.
   * Note: The Policy Engine NEVER increases the AI probability.
   */
  public static evaluatePolicy(
    payment: IPayment,
    decision: Partial<IRecoveryDecision>,
    _customer?: ICustomer | null
  ): IPolicyEvaluationOutput {
    const checks: IPolicyCheckItem[] = [];
    const reasons: string[] = [];
    let isBlocked = false;
    let isManualReview = false;

    const amount = payment.amount;
    const retryCount = payment.retryCount || 0;
    const probability = decision.probability ?? 0;
    const recommendedMethod = decision.recommendedMethod || payment.method;
    const failureReasonLower = (payment.failureReason || '').toLowerCase().trim();

    // Rule 1: Automatic recovery enabled check
    if (RECOVERY_POLICY.automaticRecoveryEnabled) {
      checks.push({
        name: 'Automatic recovery enabled',
        passed: true,
        description: 'Automatic recovery is enabled in merchant configuration'
      });
    } else {
      isBlocked = true;
      reasons.push('Automatic recovery is disabled in merchant configuration');
      checks.push({
        name: 'Automatic recovery enabled',
        passed: false,
        description: 'Automatic recovery is currently disabled by merchant policy'
      });
    }

    // Rule 2: Amount limit check (<= ₹10,000)
    if (amount <= RECOVERY_POLICY.autoRecoveryLimit) {
      checks.push({
        name: 'Auto-recovery limit',
        passed: true,
        description: `₹${amount.toLocaleString('en-IN')} is below ₹${RECOVERY_POLICY.autoRecoveryLimit.toLocaleString('en-IN')} auto-recovery limit`
      });
    } else {
      isBlocked = true;
      const msg = `Payment amount ₹${amount.toLocaleString('en-IN')} exceeds automatic recovery limit of ₹${RECOVERY_POLICY.autoRecoveryLimit.toLocaleString('en-IN')}`;
      reasons.push(msg);
      checks.push({
        name: 'Auto-recovery limit',
        passed: false,
        description: msg
      });
    }

    // Rule 3: Retry count limit check (< 2)
    if (retryCount < RECOVERY_POLICY.maxRetries) {
      checks.push({
        name: 'Retry count limit',
        passed: true,
        description: `Retry count (${retryCount}) is within allowed limit of ${RECOVERY_POLICY.maxRetries}`
      });
    } else {
      isBlocked = true;
      const msg = `Payment retry count (${retryCount}) reached maximum limit of ${RECOVERY_POLICY.maxRetries}`;
      reasons.push(msg);
      checks.push({
        name: 'Retry count limit',
        passed: false,
        description: msg
      });
    }

    // Rule 4: Permitted recovery method check
    if (RECOVERY_POLICY.allowedMethods.includes(recommendedMethod)) {
      checks.push({
        name: 'Permitted method',
        passed: true,
        description: `${recommendedMethod} recovery permitted by merchant policy`
      });
    } else {
      isBlocked = true;
      const msg = `Recommended method ${recommendedMethod} is not permitted by merchant policy`;
      reasons.push(msg);
      checks.push({
        name: 'Permitted method',
        passed: false,
        description: msg
      });
    }

    // Rule 5 & 6 & 7: Failure reason eligibility (Auth / Fraud / Permanent Decline)
    const isAuthFailure = failureReasonLower.includes('authentication failure');
    const isFraudOrRisk = failureReasonLower.includes('fraud') || failureReasonLower.includes('stolen card') || failureReasonLower.includes('risk');
    const isPermanentDecline = failureReasonLower.includes('permanently declined') || failureReasonLower.includes('invalid card') || failureReasonLower.includes('expired card');

    if (isAuthFailure) {
      isManualReview = true;
      const msg = 'Authentication failure detected; automatic retry not permitted';
      reasons.push(msg);
      checks.push({
        name: 'Failure category eligibility',
        passed: false,
        description: msg
      });
    } else if (isFraudOrRisk) {
      isManualReview = true;
      const msg = 'Suspected fraud/risk signal detected; manual operations review required';
      reasons.push(msg);
      checks.push({
        name: 'Failure category eligibility',
        passed: false,
        description: msg
      });
    } else if (isPermanentDecline) {
      isBlocked = true;
      const msg = 'Permanently declined payment cannot be automatically retried';
      reasons.push(msg);
      checks.push({
        name: 'Failure category eligibility',
        passed: false,
        description: msg
      });
    } else {
      checks.push({
        name: 'Failure category eligibility',
        passed: true,
        description: `${payment.failureReason || 'Failure type'} is eligible for automatic recovery`
      });
    }

    // Rule 8: Recovery probability check (>= 0.50 threshold)
    const probPercent = Math.round(probability * 100);
    if (probability >= 0.60) {
      checks.push({
        name: 'Sufficient AI probability',
        passed: true,
        description: `Recovery probability (${probPercent}%) meets minimum automatic threshold (60%)`
      });
    } else if (probability >= 0.50) {
      checks.push({
        name: 'Sufficient AI probability',
        passed: true,
        description: `Recovery probability (${probPercent}%) meets minimum 50% threshold`
      });
    } else if (probability >= 0.40) {
      isManualReview = true;
      const msg = `Recovery probability (${probPercent}%) below 50% threshold; requires manual review`;
      reasons.push(msg);
      checks.push({
        name: 'Sufficient AI probability',
        passed: false,
        description: msg
      });
    } else {
      isBlocked = true;
      const msg = `Low recovery probability (${probPercent}%) below threshold`;
      reasons.push(msg);
      checks.push({
        name: 'Sufficient AI probability',
        passed: false,
        description: msg
      });
    }

    // Final Status Determination
    let status: 'APPROVED' | 'BLOCKED' | 'MANUAL_REVIEW' = 'APPROVED';
    if (isBlocked) {
      status = 'BLOCKED';
    } else if (isManualReview) {
      status = 'MANUAL_REVIEW';
    }

    const allowed = status === 'APPROVED';

    if (allowed && reasons.length === 0) {
      reasons.push('All mandatory merchant safety policies passed successfully');
    }

    return {
      status,
      allowed,
      reasons,
      checks,
      policyVersion: this.POLICY_VERSION
    };
  }
}
