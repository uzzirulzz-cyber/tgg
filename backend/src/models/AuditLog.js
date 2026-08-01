import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  userEmail: {
    type: String,
    default: null,
  },
  userRole: {
    type: String,
    default: null,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT',
      'REGISTER', 'PASSWORD_RESET', 'EMAIL_VERIFY', 'ORDER_CREATE',
      'ORDER_UPDATE', 'PAYMENT_PROCESS', 'REFUND', 'INVENTORY_ADD',
      'INVENTORY_UPDATE', 'INVENTORY_DELETE', 'SETTINGS_UPDATE',
      'ADMIN_ACTION', 'EXPORT', 'IMPORT', 'BULK_ACTION'
    ],
  },
  entityType: {
    type: String,
    required: true,
    enum: ['User', 'Product', 'Order', 'Payment', 'Inventory', 'Category', 'Coupon', 'Ticket', 'Settings', 'Homepage', 'System'],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  description: {
    type: String,
    required: true,
  },
  oldValues: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
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

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ ipAddress: 1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
