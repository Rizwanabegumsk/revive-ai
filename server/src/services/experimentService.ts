import { RecoveryExperiment, IRecoveryExperiment } from '../models/RecoveryExperiment';
import { Payment } from '../models/Payment';
import { RecoveryOutcome } from '../models/RecoveryOutcome';

export interface IExperimentAnalysis {
  experiment: IRecoveryExperiment;
  control: {
    variantId: 'CONTROL';
    name: string;
    strategy: string;
    waitMinutes: number;
    paymentMethod: string;
    recoveryAttempts: number;
    successfulRecoveries: number;
    recoveredAmount: number;
    recoveryRate: number;
  };
  challenger: {
    variantId: 'CHALLENGER';
    name: string;
    strategy: string;
    waitMinutes: number;
    paymentMethod: string;
    recoveryAttempts: number;
    successfulRecoveries: number;
    recoveredAmount: number;
    recoveryRate: number;
  };
  totalAttempts: number;
  totalRecovered: number;
  lift: number;
  winnerStatus: 'CHALLENGER' | 'CONTROL' | 'TIE' | 'INSUFFICIENT_DATA';
  winner: 'CHALLENGER' | 'CONTROL' | 'TIE' | null;
  recommendation: string;
  insight: string;
  minimumSampleSize: number;
  hasSufficientData: boolean;
}

export class ExperimentService {
  public static readonly MINIMUM_SAMPLE_SIZE = 20;

  /**
   * Deterministic assignment based on paymentId string hash.
   * Same paymentId ALWAYS remains in the same variant.
   */
  public static assignVariant(paymentId: string): 'CONTROL' | 'CHALLENGER' {
    let hash = 0;
    for (let i = 0; i < paymentId.length; i++) {
      hash = (hash << 5) - hash + paymentId.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 2 === 0 ? 'CONTROL' : 'CHALLENGER';
  }

  public static async getExperiments(): Promise<IExperimentAnalysis[]> {
    const experiments = await RecoveryExperiment.find().sort({ createdAt: -1 });
    const results: IExperimentAnalysis[] = [];

    for (const exp of experiments) {
      const analysis = await this.analyzeExperiment(exp.experimentId);
      if (analysis) results.push(analysis);
    }

    return results;
  }

  public static async getExperimentById(experimentIdStr: string): Promise<IExperimentAnalysis | null> {
    return this.analyzeExperiment(experimentIdStr);
  }

  public static async createExperiment(data: {
    name: string;
    description: string;
    metric?: 'RECOVERY_RATE' | 'RECOVERED_AMOUNT';
    control: { name: string; waitMinutes: number; method: string };
    challenger: { name: string; waitMinutes: number; method: string };
  }): Promise<IRecoveryExperiment> {
    const count = await RecoveryExperiment.countDocuments();
    const expId = `EXP-${String(count + 1).padStart(3, '0')}`;

    const controlVariant = {
      variantId: 'CONTROL' as const,
      name: data.control.name || 'Control (90 Min)',
      strategy: `Wait ${data.control.waitMinutes} minutes → Retry via ${data.control.method}`,
      waitMinutes: data.control.waitMinutes,
      paymentMethod: data.control.method,
      eligiblePayments: 0,
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      recoveredAmount: 0,
      recoveryRate: 0
    };

    const challengerVariant = {
      variantId: 'CHALLENGER' as const,
      name: data.challenger.name || 'Challenger (30 Min)',
      strategy: `Wait ${data.challenger.waitMinutes} minutes → Retry via ${data.challenger.method}`,
      waitMinutes: data.challenger.waitMinutes,
      paymentMethod: data.challenger.method,
      eligiblePayments: 0,
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      recoveredAmount: 0,
      recoveryRate: 0
    };

    const experiment = await RecoveryExperiment.create({
      experimentId: expId,
      name: data.name,
      description: data.description,
      status: 'RUNNING',
      metric: data.metric || 'RECOVERY_RATE',
      variants: [controlVariant, challengerVariant],
      control: controlVariant,
      challenger: challengerVariant
    });

    return experiment;
  }

  /**
   * Evaluates experiment results using stored database records and statistical confidence gates.
   */
  public static async analyzeExperiment(experimentIdStr: string): Promise<IExperimentAnalysis | null> {
    const experiment = await RecoveryExperiment.findOne({ experimentId: experimentIdStr });
    if (!experiment) return null;

    const allPayments = await Payment.find();
    const successfulOutcomes = await RecoveryOutcome.find({ recovered: true });

    let controlAttempts = 0;
    let controlSuccesses = 0;
    let controlRecovered = 0;

    let challengerAttempts = 0;
    let challengerSuccesses = 0;
    let challengerRecovered = 0;

    allPayments.forEach(p => {
      const variant = this.assignVariant(p.paymentId);

      if (variant === 'CONTROL') {
        controlAttempts += 1;
        const isRecovered = p.status === 'RECOVERED' || p.recovered;
        if (isRecovered) {
          controlSuccesses += 1;
          controlRecovered += p.recoveredAmount || p.amount;
        }
      } else {
        challengerAttempts += 1;
        const isRecovered = p.status === 'RECOVERED' || p.recovered;
        if (isRecovered) {
          challengerSuccesses += 1;
          challengerRecovered += p.recoveredAmount || p.amount;
        }
      }
    });

    // Also account for simulation outcomes
    successfulOutcomes.forEach(o => {
      const p = allPayments.find(pay => pay._id.toString() === o.paymentId.toString());
      if (p) {
        const variant = this.assignVariant(p.paymentId);
        const amount = o.amountRecovered || o.recoveredAmount || 0;
        if (variant === 'CONTROL' && controlRecovered === 0) {
          controlSuccesses += 1;
          controlRecovered += amount;
        } else if (variant === 'CHALLENGER' && challengerRecovered === 0) {
          challengerSuccesses += 1;
          challengerRecovered += amount;
        }
      }
    });

    const controlRate = controlAttempts > 0 ? Number(((controlSuccesses / controlAttempts) * 100).toFixed(1)) : 0;
    const challengerRate = challengerAttempts > 0 ? Number(((challengerSuccesses / challengerAttempts) * 100).toFixed(1)) : 0;

    const lift = controlRate > 0
      ? Number((((challengerRate - controlRate) / controlRate) * 100).toFixed(1))
      : (challengerRate > 0 ? 100 : 0);

    const totalAttempts = controlAttempts + challengerAttempts;
    const totalRecovered = controlRecovered + challengerRecovered;

    // STATISTICAL SAFETY THRESHOLD CHECK
    const hasSufficientData = totalAttempts >= this.MINIMUM_SAMPLE_SIZE;
    let winnerStatus: 'CHALLENGER' | 'CONTROL' | 'TIE' | 'INSUFFICIENT_DATA' = 'INSUFFICIENT_DATA';
    let winner: 'CHALLENGER' | 'CONTROL' | 'TIE' | null = null;
    let recommendation = '';
    let insight = '';

    if (!hasSufficientData) {
      winnerStatus = 'INSUFFICIENT_DATA';
      winner = null;
      recommendation = 'Continue collecting recovery outcomes before selecting a winning strategy';
      insight = `Current sample size (${totalAttempts} transactions) is below the statistical confidence threshold (${this.MINIMUM_SAMPLE_SIZE}). More outcomes are required.`;
    } else {
      if (challengerRate > controlRate + 2.0) {
        winnerStatus = 'CHALLENGER';
        winner = 'CHALLENGER';
        recommendation = 'Challenger strategy recovered more payments than Control';
        insight = `Challenger strategy (${experiment.challenger.waitMinutes || 30}-min delay) recovered ${challengerSuccesses - controlSuccesses} more payments (+${lift}% lift).`;
      } else if (controlRate > challengerRate + 2.0) {
        winnerStatus = 'CONTROL';
        winner = 'CONTROL';
        recommendation = 'Control strategy outperforms Challenger';
        insight = `Control strategy (${experiment.control.waitMinutes || 90}-min delay) outperforms Challenger by ${(controlRate - challengerRate).toFixed(1)}%.`;
      } else {
        winnerStatus = 'TIE';
        winner = 'TIE';
        recommendation = 'Control and Challenger strategies perform similarly';
        insight = 'No statistical difference observed between variants at current sample size.';
      }
    }

    // Update variant stats in experiment model
    experiment.control.recoveryAttempts = controlAttempts;
    experiment.control.successfulRecoveries = controlSuccesses;
    experiment.control.recoveredAmount = controlRecovered;
    experiment.control.recoveryRate = controlRate;

    experiment.challenger.recoveryAttempts = challengerAttempts;
    experiment.challenger.successfulRecoveries = challengerSuccesses;
    experiment.challenger.recoveredAmount = challengerRecovered;
    experiment.challenger.recoveryRate = challengerRate;

    await experiment.save();

    return {
      experiment,
      control: {
        variantId: 'CONTROL',
        name: experiment.control.name,
        strategy: experiment.control.strategy,
        waitMinutes: experiment.control.waitMinutes,
        paymentMethod: experiment.control.paymentMethod,
        recoveryAttempts: controlAttempts,
        successfulRecoveries: controlSuccesses,
        recoveredAmount: controlRecovered,
        recoveryRate: controlRate
      },
      challenger: {
        variantId: 'CHALLENGER',
        name: experiment.challenger.name,
        strategy: experiment.challenger.strategy,
        waitMinutes: experiment.challenger.waitMinutes,
        paymentMethod: experiment.challenger.paymentMethod,
        recoveryAttempts: challengerAttempts,
        successfulRecoveries: challengerSuccesses,
        recoveredAmount: challengerRecovered,
        recoveryRate: challengerRate
      },
      totalAttempts,
      totalRecovered,
      lift,
      winnerStatus,
      winner,
      recommendation,
      insight,
      minimumSampleSize: this.MINIMUM_SAMPLE_SIZE,
      hasSufficientData
    };
  }

  public static async activateExperiment(experimentIdStr: string): Promise<IRecoveryExperiment | null> {
    const exp = await RecoveryExperiment.findOne({ experimentId: experimentIdStr });
    if (!exp) return null;
    exp.status = 'RUNNING';
    await exp.save();
    return exp;
  }

  public static async pauseExperiment(experimentIdStr: string): Promise<IRecoveryExperiment | null> {
    const exp = await RecoveryExperiment.findOne({ experimentId: experimentIdStr });
    if (!exp) return null;
    exp.status = 'PAUSED';
    await exp.save();
    return exp;
  }
}
