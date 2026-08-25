import { Schema, model } from 'mongoose';
import { IRecoveryEvent } from '../types';

const recoveryEventSchema = new Schema<IRecoveryEvent>(
  {
    eventId: {
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
    eventType: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export const RecoveryEvent = model<IRecoveryEvent>('RecoveryEvent', recoveryEventSchema);
