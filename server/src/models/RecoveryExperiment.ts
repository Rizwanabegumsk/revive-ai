import { Schema, model, Document } from 'mongoose';

export interface IExperimentVariant {
  variantId: 'CONTROL' | 'CHALLENGER';
  name: string;
  strategy: string;
  waitMinutes: number;
  paymentMethod: string;
  eligiblePayments?: number;
  recoveryAttempts: number;
  successfulRecoveries: number;
  recoveredAmount: number;
  recoveryRate: number;
}

export interface IRecoveryExperiment extends Document {
  experimentId: string;
  name: string;
  description: string;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED';
  metric: 'RECOVERY_RATE' | 'RECOVERED_AMOUNT';
  variants: IExperimentVariant[];
  control: IExperimentVariant;
  challenger: IExperimentVariant;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IExperimentVariant>(
  {
    variantId: { type: String, enum: ['CONTROL', 'CHALLENGER'], required: true },
    name: { type: String, required: true },
    strategy: { type: String, required: true },
    waitMinutes: { type: Number, required: true, default: 0 },
    paymentMethod: { type: String, required: true, default: 'UPI' },
    eligiblePayments: { type: Number, default: 0 },
    recoveryAttempts: { type: Number, default: 0 },
    successfulRecoveries: { type: Number, default: 0 },
    recoveredAmount: { type: Number, default: 0 },
    recoveryRate: { type: Number, default: 0 }
  },
  { _id: false }
);

const recoveryExperimentSchema = new Schema<IRecoveryExperiment>(
  {
    experimentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['RUNNING', 'PAUSED', 'COMPLETED'],
      default: 'RUNNING'
    },
    metric: {
      type: String,
      enum: ['RECOVERY_RATE', 'RECOVERED_AMOUNT'],
      default: 'RECOVERY_RATE'
    },
    variants: {
      type: [variantSchema],
      default: []
    },
    control: {
      type: variantSchema,
      required: true
    },
    challenger: {
      type: variantSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const RecoveryExperiment = model<IRecoveryExperiment>('RecoveryExperiment', recoveryExperimentSchema);
