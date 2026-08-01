import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    default: null,
  },
  productName: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
    default: null,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  deliveryItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
  }],
  deliveryStatus: {
    type: String,
    enum: ['pending', 'delivered', 'failed'],
    default: 'pending',
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  couponCode: {
    type: String,
    default: null,
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  status: {
    type: String,
    enum: ['pending', 'payment_pending', 'paid', 'processing', 'delivered', 'completed', 'cancelled', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'lemon_squeezy', 'bank_transfer', 'jazzcash', 'easypaisa', 'crypto', 'manual'],
    required: true,
  },
  paymentId: {
    type: String,
    default: null,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    default: null,
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
  internalNotes: {
    type: String,
    maxlength: 2000,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
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
  refundReason: {
    type: String,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.product': 1 });

// Generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const prefix = 'PB';
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

orderSchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'order',
});

export const Order = mongoose.model('Order', orderSchema);
