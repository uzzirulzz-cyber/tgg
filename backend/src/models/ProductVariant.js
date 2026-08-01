import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Variant name is required'],
    trim: true,
    maxlength: [100, 'Variant name cannot exceed 100 characters'],
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  price: {
    type: Number,
    required: [true, 'Variant price is required'],
    min: [0, 'Price cannot be negative'],
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative'],
    default: null,
  },
  stockQuantity: {
    type: Number,
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  unlimitedStock: {
    type: Boolean,
    default: false,
  },
  deliveryMethod: {
    type: String,
    enum: ['instant', 'manual', 'scheduled'],
    default: 'instant',
  },
  attributes: [{
    name: String,
    value: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

productVariantSchema.index({ product: 1 });
productVariantSchema.index({ sku: 1 });
productVariantSchema.index({ isActive: 1 });

productVariantSchema.virtual('currentPrice').get(function() {
  return this.salePrice || this.price;
});

productVariantSchema.virtual('discountPercentage').get(function() {
  if (this.salePrice && this.price > 0) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

export const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
