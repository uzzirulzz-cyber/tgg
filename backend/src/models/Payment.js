import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'lemon_squeezy', 'bank_transfer', 'jazzcash', 'easypaisa', 'crypto', 'manual'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    default: null,
  },
  providerPaymentId: {
    type: String,
    default: null,
  },
  providerResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  webhookData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  failureReason: {
    type: String,
    default: null,
  },
  refundedAt: {
    type: Date,
    default: null,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundTransactionId: {
    type: String,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

paymentSchema.index({ order: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);
