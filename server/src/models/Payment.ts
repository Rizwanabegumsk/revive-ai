import { Schema, model } from 'mongoose';
import { IPayment } from '../types';

const paymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true
    },
    method: {
      type: String,
      enum: ['CARD', 'UPI', 'NETBANKING', 'WALLET'],
      required: true
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING', 'RECOVERED'],
      required: true
    },
    failureReason: {
      type: String,
      trim: true
    },
    gateway: {
      type: String,
      required: true,
      trim: true
    },
    retryCount: {
      type: Number,
      default: 0
    },
    recovered: {
      type: Boolean,
      default: false
    },
    recoveredAmount: {
      type: Number,
      default: 0
    },
    recoveredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const Payment = model<IPayment>('Payment', paymentSchema);
