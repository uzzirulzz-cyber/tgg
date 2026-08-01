import mongoose from 'mongoose';

const homepageSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['hero', 'banner', 'featured_products', 'trending_products', 'categories', 'testimonials', 'faq', 'custom'],
    required: true,
  },
  title: {
    type: String,
    maxlength: 200,
  },
  subtitle: {
    type: String,
    maxlength: 500,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Hero section content
  heroData: {
    headline: String,
    subheading: String,
    backgroundImage: String,
    backgroundVideo: String,
    buttons: [{
      text: String,
      url: String,
      style: { type: String, enum: ['primary', 'secondary', 'outline'], default: 'primary' },
    }],
    trustBadges: [String],
  },
  // Banner section content
  bannerData: {
    image: String,
    link: String,
    altText: String,
  },
  // Product section content
  productData: {
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory',
    },
    limit: { type: Number, default: 8 },
    sortBy: { type: String, enum: ['newest', 'popular', 'price_asc', 'price_desc', 'rating'], default: 'newest' },
  },
  // Category section content
  categoryData: {
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory',
    }],
    layout: { type: String, enum: ['grid', 'carousel', 'list'], default: 'grid' },
  },
  // Custom HTML content
  customHtml: {
    type: String,
    default: null,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

homepageSectionSchema.index({ type: 1, isActive: 1 });
homepageSectionSchema.index({ displayOrder: 1 });
homepageSectionSchema.index({ isVisible: 1, isActive: 1 });

export const HomepageSection = mongoose.model('HomepageSection', homepageSectionSchema);
