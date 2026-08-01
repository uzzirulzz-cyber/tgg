import { Inventory } from '../models/Inventory.js';
import { Product } from '../models/Product.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

// @desc    Get inventory for a product
// @route   GET /api/inventory/:productId
// @access  Private/Admin
export const getInventory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { status, page = 1, limit = 50 } = req.query;

  const query = { product: productId };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Inventory.find(query)
      .populate('product', 'name slug')
      .populate('variant', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Inventory.countDocuments(query),
  ]);

  // Get counts by status
  const statusCounts = await Inventory.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    data: items,
    statusCounts: statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Add inventory items
// @route   POST /api/inventory
// @access  Private/Admin
export const addInventory = asyncHandler(async (req, res) => {
  const { productId, variantId, type, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Inventory items are required', 400);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const inventoryDocs = items.map(item => ({
    product: productId,
    variant: variantId || null,
    type,
    value: item.value,
    additionalData: item.additionalData || {},
    status: 'available',
    importedBy: req.user.id,
  }));

  const created = await Inventory.insertMany(inventoryDocs);

  // Update product stock
  const availableCount = await Inventory.countDocuments({
    product: productId,
    status: 'available',
  });

  if (!product.unlimitedStock) {
    product.stockQuantity = availableCount;
    await product.save();
  }

  logger.info(`${created.length} inventory items added for ${product.name} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    message: `${created.length} items added successfully`,
    count: created.length,
  });
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
export const deleteInventory = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (!item) {
    throw new AppError('Inventory item not found', 404);
  }

  if (item.status === 'sold') {
    throw new AppError('Cannot delete sold inventory', 400);
  }

  await item.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Inventory item deleted',
  });
});

// @desc    Get low stock products
// @route   GET /api/admin/inventory/low-stock
// @access  Private/Admin
export const getLowStock = asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold) || 10;

  const products = await Product.find({
    unlimitedStock: false,
    status: 'active',
    $expr: { $lte: ['$stockQuantity', threshold] },
  }).select('name slug stockQuantity sku images').lean();

  res.status(200).json({
    success: true,
    data: products,
    threshold,
  });
});

// @desc    Export inventory
// @route   GET /api/admin/inventory/export
// @access  Private/Admin
export const exportInventory = asyncHandler(async (req, res) => {
  const { productId } = req.query;
  const query = productId ? { product: productId } : {};

  const items = await Inventory.find(query)
    .populate('product', 'name slug')
    .populate('variant', 'name')
    .select('-additionalData.password')
    .lean();

  // CSV format
  const csvHeader = 'ID,Product,Variant,Type,Value,Status,Order,SoldAt,ImportedAt\n';
  const csvRows = items.map(item => [
    item._id,
    item.product?.name || '',
    item.variant?.name || '',
    item.type,
    item.value,
    item.status,
    item.orderId || '',
    item.soldAt || '',
    item.importedAt,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  const csv = csvHeader + csvRows.join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=inventory-export.csv');
  res.status(200).send(csv);
});
