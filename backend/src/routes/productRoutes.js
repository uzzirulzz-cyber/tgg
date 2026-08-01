import express from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getTrendingProducts,
  addReview,
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.get('/:slug', getProductBySlug);

// Protected routes
router.post('/:id/reviews', protect, addReview);

// Admin routes
router.post('/', protect, restrictTo('admin', 'super_admin', 'manager'), createProduct);
router.put('/:id', protect, restrictTo('admin', 'super_admin', 'manager'), updateProduct);
router.delete('/:id', protect, restrictTo('admin', 'super_admin'), deleteProduct);
router.post('/categories', protect, restrictTo('admin', 'super_admin', 'manager'), createCategory);
router.put('/categories/:id', protect, restrictTo('admin', 'super_admin', 'manager'), updateCategory);
router.delete('/categories/:id', protect, restrictTo('admin', 'super_admin'), deleteCategory);

export default router;
