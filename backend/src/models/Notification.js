import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['order', 'payment', 'delivery', 'ticket', 'system', 'promotion', 'security'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
  actionUrl: {
    type: String,
    default: null,
  },
  sentVia: {
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
  },
}, {
  timestamps: true,
});

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
