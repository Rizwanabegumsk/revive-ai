import { Payment } from '../models/Payment';
import { Customer } from '../models/Customer';
import { RecoveryDecision } from '../models/RecoveryDecision';
import { RecoveryOutcome } from '../models/RecoveryOutcome';
import { RecoveryEvent } from '../models/RecoveryEvent';
import { PolicyEngine } from './policyEngine';
import { RecoveryEngine } from './recoveryEngine';
import { ICustomer } from '../types';

export interface ISimulationResult {
  success: boolean;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'ALREADY_RECOVERED' | 'NOT_FOUND';
  paymentId?: string;
  action?: string;
  method?: string;
  executionStatus?: 'SUCCESS' | 'FAILED' | 'SCHEDULED' | 'EXECUTED' | 'CANCELLED';
  recovered?: boolean;
  recoveredAmount?: number;
  amountRecovered?: number;
  simulationMode?: boolean;
  simulatedAt?: string;
  message?: string;
  reason?: string;
}

export class RecoveryExecutionService {
  /**
   * Executes a controlled recovery simulation after validating policy authorization.
   * Architecture: Failed Payment -> Recovery Engine -> AI Recommendation -> Policy Engine -> APPROVED -> Recovery Execution Simulation.
   * Note: NEVER makes a real payment or calls a real gateway. Controlled simulation mode only.
   */
  public static async executeRecovery(
    paymentIdStr: string,
    forceFailure = false
  ): Promise<ISimulationResult> {
    // 1. Load payment
    const payment = await Payment.findOne({ paymentId: paymentIdStr }).populate('customerId');
    if (!payment) {
      return {
        success: false,
        status: 'NOT_FOUND',
        reason: `Payment #${paymentIdStr} not found`
      };
    }

    // 2. Verify payment is in a state eligible for recovery
    if (payment.status !== 'FAILED' && payment.status !== 'RECOVERED') {
      return {
        success: false,
        status: 'BLOCKED',
        reason: `Payment #${paymentIdStr} is currently ${payment.status} and cannot be executed`
      };
    }

    // 3. IDEMPOTENCY / DUPLICATE PROTECTION: Check if payment is already recovered
    const existingSuccessfulOutcome = await RecoveryOutcome.findOne({
      paymentId: payment._id,
      recovered: true
    });

    if (payment.status === 'RECOVERED' || payment.recovered || existingSuccessfulOutcome) {
      return {
        success: false,
        status: 'ALREADY_RECOVERED',
        paymentId: payment.paymentId,
        recovered: true,
        recoveredAmount: payment.recoveredAmount || payment.amount,
        amountRecovered: payment.recoveredAmount || payment.amount,
        simulationMode: true,
        message: 'Payment has already been recovered. Duplicate execution prevented.'
      };
    }

    // 4. Load or generate latest RecoveryDecision
    let decision = await RecoveryDecision.findOne({ paymentId: payment._id });
    const customerObj = (payment.customerId && typeof payment.customerId === 'object')
      ? (payment.customerId as ICustomer)
      : null;

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
      }
    }

    // 5. INDEPENDENT BACKEND POLICY VALIDATION (Never trust frontend policy status)
    const policyResult = PolicyEngine.evaluatePolicy(payment, decision, customerObj);

    // Sync policy result on decision record
    decision.policyStatus = policyResult.status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    decision.status = policyResult.status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    decision.policyChecks = policyResult.checks.map(c => ({
      rule: c.name,
      passed: c.passed,
      explanation: c.description
    }));
    decision.policyReason = policyResult.reasons.join('; ');
    await decision.save();

    // Rejection Gate: Reject execution if policy is not APPROVED
    if (policyResult.status !== 'APPROVED') {
      return {
        success: false,
        status: 'BLOCKED',
        paymentId: payment.paymentId,
        reason: `Recovery execution blocked by safety policy: ${policyResult.reasons.join('. ')}`
      };
    }

    // 6. Audit Event: Execution Started
    const now = new Date();
    await RecoveryEvent.create({
      eventId: `EVT-START-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentId: payment._id,
      eventType: 'EXECUTION_STARTED',
      message: `Recovery execution simulation started for payment #${payment.paymentId} via ${decision.recommendedMethod}`,
      timestamp: now
    });

    // 7. Controlled Simulation Logic
    const shouldSucceed = !forceFailure && decision.probability >= 0.50;

    if (shouldSucceed) {
      // Update Payment State
      payment.status = 'RECOVERED';
      payment.recovered = true;
      payment.recoveredAmount = payment.amount;
      payment.recoveredAt = now;
      await payment.save();

      // Update Customer Statistics
      if (payment.customerId) {
        const custId = typeof payment.customerId === 'object' ? (payment.customerId as any)._id : payment.customerId;
        await Customer.findByIdAndUpdate(custId, {
          $inc: { recoveredPayments: 1 }
        });
      }

      // Update Decision Status
      decision.status = 'COMPLETED';
      await decision.save();

      // Save RecoveryOutcome Document in MongoDB
      const outcomeRecord = await RecoveryOutcome.create({
        outcomeId: `OUT-EXEC-${Date.now()}`,
        paymentId: payment._id,
        decisionId: decision._id,
        action: decision.recommendation,
        method: decision.recommendedMethod,
        executionStatus: 'SUCCESS',
        recovered: true,
        recoveredAmount: payment.amount,
        amountRecovered: payment.amount,
        simulationMode: true,
        message: `Payment successfully recovered in simulation mode via ${decision.recommendedMethod} retry. No real payment was processed.`,
        executedAt: now
      });

      // Emit Timeline Audit Events
      await RecoveryEvent.create({
        eventId: `EVT-RETRY-${Date.now()}`,
        paymentId: payment._id,
        eventType: 'RETRY_EXECUTED',
        message: `Simulated ${decision.recommendedMethod} retry executed successfully`,
        timestamp: now
      });

      await RecoveryEvent.create({
        eventId: `EVT-SUCCESS-${Date.now()}`,
        paymentId: payment._id,
        eventType: 'RECOVERY_SUCCESSFUL',
        message: `₹${payment.amount.toLocaleString('en-IN')} recovered via ${decision.recommendedMethod}`,
        timestamp: now
      });

      return {
        success: true,
        status: 'SUCCESS',
        paymentId: payment.paymentId,
        action: decision.recommendation,
        method: decision.recommendedMethod,
        executionStatus: 'SUCCESS',
        recovered: true,
        recoveredAmount: payment.amount,
        amountRecovered: payment.amount,
        simulationMode: true,
        simulatedAt: now.toISOString(),
        message: 'Payment successfully recovered in simulation mode. No real payment was processed.'
      };
    } else {
      // Record Failed Outcome
      await RecoveryOutcome.create({
        outcomeId: `OUT-FAIL-${Date.now()}`,
        paymentId: payment._id,
        decisionId: decision._id,
        action: decision.recommendation,
        method: decision.recommendedMethod,
        executionStatus: 'FAILED',
        recovered: false,
        recoveredAmount: 0,
        amountRecovered: 0,
        simulationMode: true,
        message: 'Simulated recovery attempt failed.',
        executedAt: now
      });

      await RecoveryEvent.create({
        eventId: `EVT-FAIL-${Date.now()}`,
        paymentId: payment._id,
        eventType: 'RECOVERY_FAILED',
        message: `Simulated ${decision.recommendedMethod} recovery attempt failed`,
        timestamp: now
      });

      return {
        success: false,
        status: 'FAILED',
        paymentId: payment.paymentId,
        action: decision.recommendation,
        method: decision.recommendedMethod,
        executionStatus: 'FAILED',
        recovered: false,
        recoveredAmount: 0,
        amountRecovered: 0,
        simulationMode: true,
        simulatedAt: now.toISOString(),
        message: 'Simulated recovery attempt failed.'
      };
    }
  }
}
