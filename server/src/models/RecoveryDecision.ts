import { Schema, model } from 'mongoose';
import { IRecoveryDecision } from '../types';

const policyCheckSchema = new Schema(
  {
    rule: { type: String, required: true },
    passed: { type: Boolean, required: true },
    explanation: { type: String, required: true }
  },
  { _id: false }
);

const signalSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
    impact: { type: String, enum: ['positive', 'negative', 'neutral'], required: true }
  },
  { _id: false }
);

const recoveryDecisionSchema = new Schema<IRecoveryDecision>(
  {
    decisionId: {
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
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    confidence: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: true
    },
    recommendation: {
      type: String,
      required: true,
      trim: true
    },
    recommendedAction: {
      type: String,
      enum: ['DELAYED_RETRY', 'IMMEDIATE_RETRY', 'ALTERNATIVE_METHOD', 'MANUAL_REVIEW', 'DO_NOT_RETRY'],
      default: 'DELAYED_RETRY'
    },
    recommendedMethod: {
      type: String,
      enum: ['CARD', 'UPI', 'NETBANKING', 'WALLET'],
      required: true
    },
    delayMinutes: {
      type: Number,
      required: true,
      default: 0
    },
    reasoning: {
      type: [String],
      default: []
    },
    signals: {
      type: [signalSchema],
      default: []
    },
    modelVersion: {
      type: String,
      default: 'Revive Recovery Engine v1'
    },
    policyStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'BLOCKED', 'MANUAL_REVIEW'],
      default: 'PENDING'
    },
    status: {
      type: String,
      enum: ['GENERATED', 'APPROVED', 'REJECTED', 'EXECUTED', 'COMPLETED'],
      default: 'GENERATED'
    },
    policyChecks: {
      type: [policyCheckSchema],
      default: []
    },
    policyReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const RecoveryDecision = model<IRecoveryDecision>('RecoveryDecision', recoveryDecisionSchema);
