import mongoose from 'mongoose';

const ticketMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderRole: {
    type: String,
    enum: ['customer', 'admin', 'support_agent'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  attachments: [{
    filename: String,
    url: String,
    mimeType: String,
  }],
  isInternal: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const customerTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['general', 'order_issue', 'payment_issue', 'product_issue', 'delivery_issue', 'refund_request', 'account_issue', 'technical_support', 'other'],
    default: 'general',
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    maxlength: [200, 'Subject cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting', 'resolved', 'closed'],
    default: 'open',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  messages: [ticketMessageSchema],
  internalNotes: [{
    note: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  closedAt: {
    type: Date,
    default: null,
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

customerTicketSchema.index({ ticketNumber: 1 });
customerTicketSchema.index({ customer: 1, createdAt: -1 });
customerTicketSchema.index({ status: 1 });
customerTicketSchema.index({ priority: 1 });
customerTicketSchema.index({ assignedTo: 1 });
customerTicketSchema.index({ createdAt: -1 });

customerTicketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const date = new Date();
    const prefix = 'TKT';
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ticketNumber = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

export const CustomerTicket = mongoose.model('CustomerTicket', customerTicketSchema);
