import { Schema, model } from 'mongoose';
import { ICustomer } from '../types';

const customerSchema = new Schema<ICustomer>(
  {
    customerId: {
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
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    totalPayments: {
      type: Number,
      default: 0
    },
    successfulPayments: {
      type: Number,
      default: 0
    },
    recoveredPayments: {
      type: Number,
      default: 0
    },
    preferredMethod: {
      type: String,
      enum: ['CARD', 'UPI', 'NETBANKING', 'WALLET'],
      default: 'UPI'
    }
  },
  {
    timestamps: true
  }
);

export const Customer = model<ICustomer>('Customer', customerSchema);
