import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
  },
  maximumDiscountAmount: {
    type: Number,
    default: null,
  },
  appliesTo: {
    type: String,
    enum: ['all', 'categories', 'products'],
    default: 'all',
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  usageLimit: {
    type: Number,
    default: null,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  perCustomerLimit: {
    type: Number,
    default: null,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

couponSchema.methods.isValid = function() {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) return false;
  return true;
};

couponSchema.methods.calculateDiscount = function(subtotal) {
  if (subtotal < this.minimumOrderAmount) return 0;

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (subtotal * this.discountValue) / 100;
  } else {
    discount = this.discountValue;
  }

  if (this.maximumDiscountAmount && discount > this.maximumDiscountAmount) {
    discount = this.maximumDiscountAmount;
  }

  return Math.round(discount * 100) / 100;
};

export const Coupon = mongoose.model('Coupon', couponSchema);
