import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Payment } from '../models/Payment.js';
import { Inventory } from '../models/Inventory.js';
import { CustomerTicket } from '../models/CustomerTicket.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const [
    totalRevenue,
    todaySales,
    monthlySales,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalCustomers,
    activeProducts,
    lowStockProducts,
    failedPayments,
    refunds,
  ] = await Promise.all([
    // Total Revenue
    Order.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]).then(r => r[0]?.total || 0),

    // Today's Sales
    Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: { $in: ['completed', 'delivered', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]).then(r => r[0]?.total || 0),

    // Monthly Sales
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: { $in: ['completed', 'delivered', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]).then(r => r[0]?.total || 0),

    // Total Orders
    Order.countDocuments(),

    // Pending Orders
    Order.countDocuments({ status: { $in: ['pending', 'payment_pending', 'processing'] } }),

    // Completed Orders
    Order.countDocuments({ status: { $in: ['completed', 'delivered'] } }),

    // Total Customers
    User.countDocuments({ role: 'customer' }),

    // Active Products
    Product.countDocuments({ status: 'active' }),

    // Low Stock Products
    Product.countDocuments({
      unlimitedStock: false,
      status: 'active',
      stockQuantity: { $lte: 10 },
    }),

    // Failed Payments
    Payment.countDocuments({ status: 'failed' }),

    // Refunds
    Order.countDocuments({ status: 'refunded' }),
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('customer', 'name email')
    .sort('-createdAt')
    .limit(10)
    .lean();

  // Recent customers
  const recentCustomers = await User.find({ role: 'customer' })
    .select('name email createdAt lastLogin')
    .sort('-createdAt')
    .limit(10)
    .lean();

  // Open tickets
  const openTickets = await CustomerTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } });

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalRevenue,
        todaySales,
        monthlySales,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalCustomers,
        activeProducts,
        lowStockProducts,
        failedPayments,
        refunds,
        openTickets,
      },
      recentOrders,
      recentCustomers,
    },
  });
});

// @desc    Get sales analytics
// @route   GET /api/admin/analytics/sales
// @access  Private/Admin
export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  let days = 30;
  if (period === '7d') days = 7;
  if (period === '90d') days = 90;
  if (period === '1y') days = 365;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Daily sales data
  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'delivered', 'paid'] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  // Sales by payment method
  const salesByMethod = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'delivered', 'paid'] },
      },
    },
    {
      $group: {
        _id: '$paymentMethod',
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'delivered'] },
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        productName: { $first: '$items.productName' },
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.totalPrice' },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({
    success: true,
    data: {
      dailySales,
      salesByMethod,
      topProducts,
      period,
    },
  });
});

// @desc    Get customer analytics
// @route   GET /api/admin/analytics/customers
// @access  Private/Admin
export const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  let days = 30;
  if (period === '7d') days = 7;
  if (period === '90d') days = 90;
  if (period === '1y') days = 365;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // New customers over time
  const newCustomers = await User.aggregate([
    {
      $match: {
        role: 'customer',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  // Top customers by spending
  const topCustomers = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'delivered'] },
      },
    },
    {
      $group: {
        _id: '$customer',
        totalSpent: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
  ]);

  // Populate customer names
  const customerIds = topCustomers.map(c => c._id);
  const customers = await User.find({ _id: { $in: customerIds } }).select('name email').lean();
  const customerMap = customers.reduce((acc, c) => {
    acc[c._id.toString()] = c;
    return acc;
  }, {});

  const topCustomersWithNames = topCustomers.map(c => ({
    ...c,
    customer: customerMap[c._id.toString()] || { name: 'Unknown', email: '' },
  }));

  res.status(200).json({
    success: true,
    data: {
      newCustomers,
      topCustomers: topCustomersWithNames,
      period,
    },
  });
});

// @desc    Get all customers (admin)
// @route   GET /api/admin/customers
// @access  Private/Admin
export const getAllCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  const query = { role: 'customer' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [customers, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  // Get order counts for each customer
  const customerIds = customers.map(c => c._id);
  const orderCounts = await Order.aggregate([
    { $match: { customer: { $in: customerIds } } },
    { $group: { _id: '$customer', count: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } },
  ]);

  const orderCountMap = orderCounts.reduce((acc, o) => {
    acc[o._id.toString()] = o;
    return acc;
  }, {});

  const customersWithStats = customers.map(c => ({
    ...c,
    orderCount: orderCountMap[c._id.toString()]?.count || 0,
    totalSpent: orderCountMap[c._id.toString()]?.totalSpent || 0,
  }));

  res.status(200).json({
    success: true,
    data: customersWithStats,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get customer details (admin)
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
export const getCustomerDetails = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id)
    .select('-password')
    .lean();

  if (!customer) {
    throw new AppError('Customer not found', 404);
  }

  const [orders, tickets] = await Promise.all([
    Order.find({ customer: customer._id })
      .sort('-createdAt')
      .limit(20)
      .lean(),
    CustomerTicket.find({ customer: customer._id })
      .sort('-createdAt')
      .limit(10)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      customer,
      orders,
      tickets,
    },
  });
});
