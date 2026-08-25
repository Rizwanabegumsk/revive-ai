import { RecoveryExecutionService, ISimulationResult } from './recoveryExecutionService';
import { RecoveryEvent } from '../models/RecoveryEvent';
import { Payment } from '../models/Payment';

export type IExecutionResult = ISimulationResult;

export class RecoveryExecutor {
  /**
   * Executes simulated recovery attempt for an approved payment via RecoveryExecutionService.
   */
  public static async executeRecovery(
    paymentIdStr: string,
    forceFailure = false
  ): Promise<ISimulationResult> {
    return RecoveryExecutionService.executeRecovery(paymentIdStr, forceFailure);
  }

  /**
   * Retrieves timeline audit events for a payment.
   */
  public static async getPaymentEvents(paymentIdStr: string) {
    const payment = await Payment.findOne({ paymentId: paymentIdStr });
    if (!payment) return [];

    return RecoveryEvent.find({ paymentId: payment._id }).sort({ timestamp: 1 });
  }
}
