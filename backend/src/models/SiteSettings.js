import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  // General
  siteName: {
    type: String,
    default: 'PlayBeat Digital',
  },
  tagline: {
    type: String,
    default: 'Your Digital World. One Powerful Marketplace.',
  },
  logo: {
    type: String,
    default: null,
  },
  favicon: {
    type: String,
    default: null,
  },
  contactEmail: {
    type: String,
    default: 'support@playbeat.digital',
  },
  supportPhone: {
    type: String,
    default: null,
  },

  // SEO
  defaultSeoTitle: {
    type: String,
    default: 'PlayBeat Digital - Your Digital World. One Powerful Marketplace.',
  },
  defaultSeoDescription: {
    type: String,
    default: 'Discover premium digital products, subscriptions, software, gaming products, hosting, marketing services and more.',
  },
  defaultSeoKeywords: [{
    type: String,
    default: 'digital products, software, gaming, gift cards, subscriptions',
  }],

  // Social Media
  socialLinks: {
    facebook: { type: String, default: null },
    twitter: { type: String, default: null },
    instagram: { type: String, default: null },
    youtube: { type: String, default: null },
    discord: { type: String, default: null },
    telegram: { type: String, default: null },
  },

  // Payment
  paymentMethods: {
    stripe: { enabled: { type: Boolean, default: false }, config: mongoose.Schema.Types.Mixed },
    paypal: { enabled: { type: Boolean, default: false }, config: mongoose.Schema.Types.Mixed },
    lemonSqueezy: { enabled: { type: Boolean, default: false }, config: mongoose.Schema.Types.Mixed },
    bankTransfer: { enabled: { type: Boolean, default: false }, config: mongoose.Schema.Types.Mixed },
    jazzcash: { enabled: { type: Boolean, default: false }, config: mongoose.Schema.Types.Mixed },
    easypaisa: { enabled: { type: Boolean, default: false }, config: mongoose.Schema.Types.Mixed },
  },

  // Currency
  defaultCurrency: {
    type: String,
    default: 'USD',
  },
  supportedCurrencies: [{
    type: String,
    default: ['USD', 'EUR', 'GBP'],
  }],

  // Order
  orderSettings: {
    autoCompleteHours: { type: Number, default: 24 },
    allowGuestCheckout: { type: Boolean, default: false },
    requireEmailVerification: { type: Boolean, default: true },
    minimumOrderAmount: { type: Number, default: 0 },
  },

  // Email
  emailSettings: {
    provider: { type: String, enum: ['smtp', 'sendgrid', 'mailgun', 'resend'], default: 'smtp' },
    fromName: { type: String, default: 'PlayBeat Digital' },
    fromEmail: { type: String, default: 'noreply@playbeat.digital' },
    templates: {
      welcome: { enabled: { type: Boolean, default: true }, subject: String },
      orderConfirmation: { enabled: { type: Boolean, default: true }, subject: String },
      paymentConfirmation: { enabled: { type: Boolean, default: true }, subject: String },
      delivery: { enabled: { type: Boolean, default: true }, subject: String },
      passwordReset: { enabled: { type: Boolean, default: true }, subject: String },
      ticketUpdate: { enabled: { type: Boolean, default: true }, subject: String },
    },
  },

  // Maintenance
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  maintenanceMessage: {
    type: String,
    default: 'We are currently performing maintenance. Please check back soon.',
  },

  // Analytics
  analytics: {
    googleAnalyticsId: { type: String, default: null },
    facebookPixelId: { type: String, default: null },
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
