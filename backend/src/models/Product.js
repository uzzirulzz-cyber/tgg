import mongoose from 'mongoose';
import slugify from 'slugify';

const reviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    maxlength: 100,
  },
  comment: {
    type: String,
    maxlength: 1000,
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: [true, 'Category is required'],
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    default: null,
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
  }],
  video: {
    url: String,
    thumbnail: String,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative'],
    default: null,
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  },
  productType: {
    type: String,
    enum: ['digital', 'physical', 'subscription', 'service'],
    default: 'digital',
  },
  deliveryType: {
    type: String,
    enum: ['instant', 'manual', 'scheduled'],
    default: 'instant',
  },
  stockQuantity: {
    type: Number,
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  unlimitedStock: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'draft',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  variants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
  }],
  attributes: [{
    name: String,
    value: String,
  }],
  seoTitle: {
    type: String,
    maxlength: [70, 'SEO title cannot exceed 70 characters'],
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot exceed 160 characters'],
  },
  seoKeywords: [String],
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ isTrending: 1, status: 1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ tags: 1 });

// Auto-generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Calculate discount percentage virtual
productSchema.virtual('discountPercentage').get(function() {
  if (this.salePrice && this.price > 0) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

productSchema.virtual('currentPrice').get(function() {
  return this.salePrice || this.price;
});

productSchema.virtual('isInStock').get(function() {
  return this.unlimitedStock || this.stockQuantity > 0;
});

// Update average rating when reviews change
productSchema.methods.updateRating = async function() {
  const approvedReviews = this.reviews.filter(r => r.isApproved);
  if (approvedReviews.length === 0) {
    this.averageRating = 0;
    this.reviewCount = 0;
  } else {
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / approvedReviews.length) * 10) / 10;
    this.reviewCount = approvedReviews.length;
  }
  await this.save();
};

export const Product = mongoose.model('Product', productSchema);
