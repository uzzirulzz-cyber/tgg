import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Inventory } from '../models/Inventory.js';
import { Coupon } from '../models/Coupon.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

// @desc    Get customer orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { customer: req.user.id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    customer: req.user.id,
  }).lean();

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { items, couponCode, billingAddress, paymentMethod, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Cart items are required', 400);
  }

  let subtotal = 0;
  const orderItems = [];
  const inventoryReservations = [];

  // Validate items and calculate prices
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || product.status !== 'active') {
      throw new AppError(`Product not found or unavailable: ${item.productId}`, 400);
    }

    let unitPrice = product.currentPrice;
    let variant = null;

    if (item.variantId) {
      variant = await ProductVariant.findById(item.variantId);
      if (!variant || !variant.isActive) {
        throw new AppError(`Variant not found or unavailable`, 400);
      }
      unitPrice = variant.currentPrice;
    }

    // Check stock
    if (!product.unlimitedStock && !(variant?.unlimitedStock)) {
      const stockQuery = { product: product._id, status: 'available' };
      if (variant) stockQuery.variant = variant._id;

      const availableStock = await Inventory.countDocuments(stockQuery);
      if (availableStock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      // Reserve inventory
      const reservedItems = await Inventory.find(stockQuery)
        .limit(item.quantity);

      for (const inv of reservedItems) {
        inv.status = 'reserved';
        inv.reservedAt = new Date();
        inv.reservedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min
        await inv.save();
        inventoryReservations.push(inv._id);
      }
    }

    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    orderItems.push({
      product: product._id,
      variant: variant?._id || null,
      productName: product.name,
      productImage: product.images?.[0]?.url || null,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      deliveryItems: inventoryReservations,
    });
  }

  // Apply coupon
  let discountAmount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon && coupon.isValid()) {
      discountAmount = coupon.calculateDiscount(subtotal);
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  const order = await Order.create({
    customer: req.user.id,
    items: orderItems,
    subtotal,
    discountAmount,
    couponCode: couponCode?.toUpperCase() || null,
    totalAmount,
    paymentMethod,
    customerEmail: req.user.email,
    customerName: req.user.name,
    customerPhone: req.user.phone,
    billingAddress,
    notes,
    status: 'payment_pending',
    paymentStatus: 'pending',
  });

  // Create notification
  await Notification.create({
    recipient: req.user.id,
    type: 'order',
    title: 'Order Placed',
    message: `Your order #${order.orderNumber} has been placed. Total: $${totalAmount.toFixed(2)}`,
    data: { orderId: order._id, orderNumber: order.orderNumber },
    actionUrl: `/orders/${order._id}`,
  });

  logger.info(`Order created: ${order.orderNumber} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    customer: req.user.id,
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (!['pending', 'payment_pending'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled', 400);
  }

  // Release reserved inventory
  for (const item of order.items) {
    if (item.deliveryItems?.length > 0) {
      await Inventory.updateMany(
        { _id: { $in: item.deliveryItems } },
        { status: 'available', reservedAt: null, reservedUntil: null }
      );
    }
  }

  order.status = 'cancelled';
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search, startDate, endDate } = req.query;

  const query = {};
  if (status) query.status = status;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { customerEmail: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('customer', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, internalNotes } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.status = status;
  if (internalNotes) order.internalNotes = internalNotes;
  if (status === 'completed') order.completedAt = new Date();

  await order.save();

  // Notify customer
  await Notification.create({
    recipient: order.customer,
    type: 'order',
    title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your order #${order.orderNumber} status has been updated to ${status}.`,
    data: { orderId: order._id, orderNumber: order.orderNumber, status },
    actionUrl: `/orders/${order._id}`,
  });

  logger.info(`Order ${order.orderNumber} status updated to ${status} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: order,
  });
});
