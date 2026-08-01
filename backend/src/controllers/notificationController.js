import { Notification } from '../models/Notification.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;

  const query = { recipient: req.user.id };
  if (unreadOnly === 'true') query.isRead = false;

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: req.user.id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id,
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
});
