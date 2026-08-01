import { SiteSettings } from '../models/SiteSettings.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// @desc    Get site settings (public)
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne().lean();

  if (!settings) {
    settings = await SiteSettings.create({});
  }

  // Remove sensitive data for public
  const publicSettings = {
    siteName: settings.siteName,
    tagline: settings.tagline,
    logo: settings.logo,
    favicon: settings.favicon,
    contactEmail: settings.contactEmail,
    supportPhone: settings.supportPhone,
    defaultSeoTitle: settings.defaultSeoTitle,
    defaultSeoDescription: settings.defaultSeoDescription,
    defaultSeoKeywords: settings.defaultSeoKeywords,
    socialLinks: settings.socialLinks,
    defaultCurrency: settings.defaultCurrency,
    supportedCurrencies: settings.supportedCurrencies,
    analytics: settings.analytics,
    maintenanceMode: settings.maintenanceMode,
    maintenanceMessage: settings.maintenanceMessage,
  };

  res.status(200).json({
    success: true,
    data: publicSettings,
  });
});

// @desc    Get full settings (admin)
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getAdminSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne().lean();

  if (!settings) {
    settings = await SiteSettings.create({});
  }

  res.status(200).json({
    success: true,
    data: settings,
  });
});

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = await SiteSettings.create({ ...req.body, updatedBy: req.user.id });
  } else {
    Object.assign(settings, req.body);
    settings.updatedBy = req.user.id;
    await settings.save();
  }

  res.status(200).json({
    success: true,
    data: settings,
  });
});
