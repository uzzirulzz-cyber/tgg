import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['license_key', 'activation_code', 'account_credentials', 'download_link', 'file', 'm3u_playlist', 'manual'],
    required: true,
  },
  value: {
    type: String,
    required: [true, 'Inventory value is required'],
  },
  additionalData: {
    username: String,
    password: String,
    expiryDate: Date,
    downloadUrl: String,
    filePath: String,
    notes: String,
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'expired', 'disabled'],
    default: 'available',
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
  reservedAt: {
    type: Date,
    default: null,
  },
  reservedUntil: {
    type: Date,
    default: null,
  },
  soldAt: {
    type: Date,
    default: null,
  },
  importedAt: {
    type: Date,
    default: Date.now,
  },
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

inventoryItemSchema.index({ product: 1, status: 1 });
inventoryItemSchema.index({ variant: 1, status: 1 });
inventoryItemSchema.index({ status: 1 });
inventoryItemSchema.index({ orderId: 1 });
inventoryItemSchema.index({ reservedUntil: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { status: 'reserved' } });

export const Inventory = mongoose.model('Inventory', inventoryItemSchema);
