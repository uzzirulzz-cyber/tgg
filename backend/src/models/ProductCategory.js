import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  image: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: null,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  seoTitle: {
    type: String,
    maxlength: [70, 'SEO title cannot exceed 70 characters'],
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot exceed 160 characters'],
  },
  seoKeywords: [String],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, isFeatured: 1 });
categorySchema.index({ parentCategory: 1 });

categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

categorySchema.virtual('subcategories', {
  ref: 'ProductCategory',
  localField: '_id',
  foreignField: 'parentCategory',
});

categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
});

export const ProductCategory = mongoose.model('ProductCategory', categorySchema);
