import { HomepageSection } from '../models/HomepageSection.js';
import { Product } from '../models/Product.js';
import { ProductCategory } from '../models/ProductCategory.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// @desc    Get homepage sections (public)
// @route   GET /api/homepage
// @access  Public
export const getHomepage = asyncHandler(async (req, res) => {
  const now = new Date();

  const sections = await HomepageSection.find({
    isActive: true,
    isVisible: true,
    $or: [
      { startDate: null, endDate: null },
      { startDate: { $lte: now }, endDate: null },
      { startDate: null, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: { $gte: now } },
    ],
  })
    .sort('displayOrder')
    .lean();

  // Populate product sections with actual products
  const populatedSections = await Promise.all(
    sections.map(async (section) => {
      if (section.type === 'featured_products' || section.type === 'trending_products') {
        const limit = section.productData?.limit || 8;
        const sortMap = {
          newest: '-createdAt',
          popular: '-totalSales',
          price_asc: 'price',
          price_desc: '-price',
          rating: '-averageRating',
        };
        const sort = sortMap[section.productData?.sortBy] || '-createdAt';

        let productQuery = { status: 'active' };
        if (section.productData?.category) {
          productQuery.category = section.productData.category;
        }
        if (section.productData?.products?.length > 0) {
          productQuery._id = { $in: section.productData.products };
        }

        const products = await Product.find(productQuery)
          .populate('category', 'name slug')
          .sort(sort)
          .limit(limit)
          .lean();

        return { ...section, products };
      }

      if (section.type === 'categories') {
        const categoryIds = section.categoryData?.categories || [];
        const categories = await ProductCategory.find({
          _id: { $in: categoryIds },
          isActive: true,
        }).lean();

        return { ...section, categories };
      }

      return section;
    })
  );

  res.status(200).json({
    success: true,
    data: populatedSections,
  });
});

// @desc    Get all homepage sections (admin)
// @route   GET /api/admin/homepage
// @access  Private/Admin
export const getAllSections = asyncHandler(async (req, res) => {
  const sections = await HomepageSection.find()
    .sort('displayOrder')
    .lean();

  res.status(200).json({
    success: true,
    data: sections,
  });
});

// @desc    Create homepage section
// @route   POST /api/admin/homepage
// @access  Private/Admin
export const createSection = asyncHandler(async (req, res) => {
  const section = await HomepageSection.create({
    ...req.body,
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: section,
  });
});

// @desc    Update homepage section
// @route   PUT /api/admin/homepage/:id
// @access  Private/Admin
export const updateSection = asyncHandler(async (req, res) => {
  const section = await HomepageSection.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  res.status(200).json({
    success: true,
    data: section,
  });
});

// @desc    Delete homepage section
// @route   DELETE /api/admin/homepage/:id
// @access  Private/Admin
export const deleteSection = asyncHandler(async (req, res) => {
  const section = await HomepageSection.findById(req.params.id);

  if (!section) {
    throw new AppError('Section not found', 404);
  }

  await section.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Section deleted successfully',
  });
});

// @desc    Reorder sections
// @route   PUT /api/admin/homepage/reorder
// @access  Private/Admin
export const reorderSections = asyncHandler(async (req, res) => {
  const { sections } = req.body; // Array of { id, displayOrder }

  await Promise.all(
    sections.map(({ id, displayOrder }) =>
      HomepageSection.findByIdAndUpdate(id, { displayOrder })
    )
  );

  res.status(200).json({
    success: true,
    message: 'Sections reordered successfully',
  });
});
