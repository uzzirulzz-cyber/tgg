import stripe from 'stripe';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Inventory } from '../models/Inventory.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const stripeClient = process.env.STRIPE_SECRET_KEY 
  ? stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

// @desc    Create Stripe payment intent
// @route   POST /api/payments/create
// @access  Private
export const createPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    customer: req.user.id,
    status: 'payment_pending',
  });

  if (!order) {
    throw new AppError('Order not found or already processed', 404);
  }

  if (!stripeClient) {
    throw new AppError('Payment provider not configured', 500);
  }

  // Create payment record
  const payment = await Payment.create({
    order: order._id,
    customer: req.user.id,
    amount: order.totalAmount,
    currency: order.currency,
    paymentMethod: 'stripe',
    status: 'pending',
  });

  // Create Stripe PaymentIntent
  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100), // cents
    currency: order.currency.toLowerCase(),
    metadata: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      paymentId: payment._id.toString(),
    },
    automatic_payment_methods: { enabled: true },
  });

  payment.providerPaymentId = paymentIntent.id;
  payment.providerResponse = paymentIntent;
  await payment.save();

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentId: payment._id,
  });
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public
export const webhookHandler = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  if (!stripeClient || !process.env.STRIPE_WEBHOOK_SECRET) {
    logger.warn('Stripe webhook received but not configured');
    return res.status(400).send('Webhook not configured');
  }

  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  logger.info(`Stripe webhook received: ${event.type}`);

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      await handlePaymentFailure(paymentIntent);
      break;
    }
    default:
      logger.info(`Unhandled webhook event: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

async function handlePaymentSuccess(paymentIntent) {
  const { orderId, paymentId } = paymentIntent.metadata;

  const [order, payment] = await Promise.all([
    Order.findById(orderId),
    Payment.findById(paymentId),
  ]);

  if (!order || !payment) {
    logger.error(`Order or Payment not found for intent: ${paymentIntent.id}`);
    return;
  }

  // Update payment
  payment.status = 'completed';
  payment.transactionId = paymentIntent.charges?.data?.[0]?.id || paymentIntent.id;
  payment.webhookData = paymentIntent;
  await payment.save();

  // Update order
  order.status = 'paid';
  order.paymentStatus = 'paid';
  order.paymentId = payment._id.toString();
  await order.save();

  // Deliver digital products
  for (const item of order.items) {
    if (item.deliveryItems?.length > 0) {
      await Inventory.updateMany(
        { _id: { $in: item.deliveryItems } },
        { 
          status: 'sold', 
          orderId: order._id,
          soldAt: new Date(),
          reservedAt: null,
          reservedUntil: null,
        }
      );

      item.deliveryStatus = 'delivered';
      item.deliveredAt = new Date();
    }
  }

  order.status = 'completed';
  order.completedAt = new Date();
  await order.save();

  // Update product sales
  for (const item of order.items) {
    await Order.model('Product').findByIdAndUpdate(
      item.product,
      { $inc: { totalSales: item.quantity } }
    );
  }

  // Notify customer
  await Notification.create({
    recipient: order.customer,
    type: 'payment',
    title: 'Payment Successful',
    message: `Payment for order #${order.orderNumber} was successful. Your digital products are ready.`,
    data: { orderId: order._id, orderNumber: order.orderNumber },
    actionUrl: `/orders/${order._id}`,
  });

  logger.info(`Payment succeeded for order: ${order.orderNumber}`);
}

async function handlePaymentFailure(paymentIntent) {
  const { orderId, paymentId } = paymentIntent.metadata;

  const [order, payment] = await Promise.all([
    Order.findById(orderId),
    Payment.findById(paymentId),
  ]);

  if (!order || !payment) return;

  payment.status = 'failed';
  payment.failureReason = paymentIntent.last_payment_error?.message;
  payment.webhookData = paymentIntent;
  await payment.save();

  order.status = 'failed';
  order.paymentStatus = 'failed';
  await order.save();

  // Release reserved inventory
  for (const item of order.items) {
    if (item.deliveryItems?.length > 0) {
      await Inventory.updateMany(
        { _id: { $in: item.deliveryItems } },
        { status: 'available', reservedAt: null, reservedUntil: null }
      );
    }
  }

  // Notify customer
  await Notification.create({
    recipient: order.customer,
    type: 'payment',
    title: 'Payment Failed',
    message: `Payment for order #${order.orderNumber} failed. Please try again.`,
    data: { orderId: order._id, orderNumber: order.orderNumber },
    actionUrl: `/orders/${order._id}`,
  });

  logger.warn(`Payment failed for order: ${order.orderNumber}`);
}

// @desc    Get payment status
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    _id: req.params.id,
    customer: req.user.id,
  }).populate('order', 'orderNumber status totalAmount');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  res.status(200).json({
    success: true,
    data: payment,
  });
});

// @desc    Get all payments (admin)
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getAllPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, method } = req.query;

  const query = {};
  if (status) query.status = status;
  if (method) query.paymentMethod = method;

  const skip = (Number(page) - 1) * Number(limit);

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate('order', 'orderNumber')
      .populate('customer', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Payment.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: payments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});
