import { Schema, model } from 'mongoose';
import { IRecoveryOutcome } from '../types';

const recoveryOutcomeSchema = new Schema<IRecoveryOutcome>(
  {
    outcomeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
      index: true
    },
    decisionId: {
      type: Schema.Types.ObjectId,
      ref: 'RecoveryDecision',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    method: {
      type: String,
      trim: true
    },
    executionStatus: {
      type: String,
      enum: ['SCHEDULED', 'SUCCESS', 'EXECUTED', 'FAILED', 'CANCELLED'],
      default: 'SCHEDULED'
    },
    recovered: {
      type: Boolean,
      default: false
    },
    recoveredAmount: {
      type: Number,
      default: 0
    },
    amountRecovered: {
      type: Number,
      default: 0
    },
    simulationMode: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      trim: true
    },
    executedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const RecoveryOutcome = model<IRecoveryOutcome>('RecoveryOutcome', recoveryOutcomeSchema);
