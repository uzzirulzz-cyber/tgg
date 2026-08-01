import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { ProductCategory } from '../models/ProductCategory.js';
import { Inventory } from '../models/Inventory.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    sort = '-createdAt',
    category,
    subcategory,
    minPrice,
    maxPrice,
    search,
    tags,
    status = 'active',
    featured,
    trending,
    productType,
  } = req.query;

  const query = { status };

  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (productType) query.productType = productType;
  if (featured === 'true') query.isFeatured = true;
  if (trending === 'true') query.isTrending = true;

  if (minPrice || maxPrice) {
    query.$or = [
      { salePrice: { $exists: true, $ne: null } },
      { price: { $exists: true } },
    ];
    if (minPrice) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { salePrice: { $gte: Number(minPrice) } },
          { price: { $gte: Number(minPrice) }, salePrice: { $in: [null, undefined] } },
        ],
      });
    }
    if (maxPrice) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { salePrice: { $lte: Number(maxPrice) } },
          { price: { $lte: Number(maxPrice) }, salePrice: { $in: [null, undefined] } },
        ],
      });
    }
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (tags) {
    const tagArray = tags.split(',').map(t => t.trim());
    query.tags = { $in: tagArray };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('variants', 'name price salePrice stockQuantity isActive')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: { $ne: 'discontinued' } })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('variants')
    .populate({
      path: 'reviews',
      match: { isApproved: true },
      options: { sort: { createdAt: -1 }, limit: 10 },
      populate: { path: 'customer', select: 'name avatar' },
    });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Increment view count (fire and forget)
  Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } }).catch(() => {});

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body, createdBy: req.user.id };
  const product = await Product.create(productData);

  await product.populate('category');
  logger.info(`Product created: ${product.name} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('category subcategory variants');

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  logger.info(`Product updated: ${product.name} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Soft delete - mark as discontinued
  product.status = 'discontinued';
  await product.save();

  logger.info(`Product discontinued: ${product.name} by ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Product discontinued successfully',
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, status: 'active' })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(8)
    .lean();

  res.status(200).json({
    success: true,
    data: products,
  });
});

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
export const getTrendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isTrending: true, status: 'active' })
    .populate('category', 'name slug')
    .sort('-totalSales')
    .limit(8)
    .lean();

  res.status(200).json({
    success: true,
    data: products,
  });
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if user already reviewed
  const existingReview = product.reviews.find(
    r => r.customer.toString() === req.user.id
  );

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.title = title;
    existingReview.comment = comment;
  } else {
    product.reviews.push({
      customer: req.user.id,
      rating,
      title,
      comment,
    });
  }

  await product.updateRating();

  res.status(200).json({
    success: true,
    message: 'Review submitted successfully',
    data: product,
  });
});

// @desc    Get categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await ProductCategory.find({ isActive: true })
    .populate('subcategories', 'name slug image')
    .sort('displayOrder')
    .lean();

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// @desc    Get category by slug with products
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findOne({ slug: req.params.slug, isActive: true });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const products = await Product.find({ category: category._id, status: 'active' })
    .populate('category', 'name slug')
    .sort('-createdAt')
    .limit(24)
    .lean();

  res.status(200).json({
    success: true,
    data: { category, products },
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const category = await ProductCategory.create(req.body);

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await ProductCategory.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw new AppError('Cannot delete category with existing products', 400);
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});
