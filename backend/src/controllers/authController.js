import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .cookie('refreshToken', refreshToken, { ...cookieOptions, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
    .json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences,
      },
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    password,
  });

  // Create welcome notification
  await Notification.create({
    recipient: user._id,
    type: 'system',
    title: 'Welcome to PlayBeat Digital!',
    message: 'Your account has been created successfully. Start exploring our digital marketplace.',
    actionUrl: '/products',
  });

  logger.info(`New user registered: ${email}`);
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 401);
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${email}`);
  sendTokenResponse(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('wishlist', 'name slug price salePrice images averageRating');

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      addresses: user.addresses,
      wishlist: user.wishlist,
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
    },
  });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if email exists
    return res.status(200).json({
      success: true,
      message: 'If an account exists, a password reset email has been sent',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  // TODO: Send email with reset token
  logger.info(`Password reset requested for: ${email}`);

  res.status(200).json({
    success: true,
    message: 'If an account exists, a password reset email has been sent',
    // Only in development
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.info(`Password reset completed for: ${user.email}`);
  sendTokenResponse(user, 200, res);
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('No refresh token provided', 401);
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    throw new AppError('Invalid refresh token', 401);
  }

  const newToken = generateToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  res.status(200).json({
    success: true,
    token: newToken,
    refreshToken: newRefreshToken,
  });
});
