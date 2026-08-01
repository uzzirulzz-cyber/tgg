import { CustomerTicket } from '../models/CustomerTicket.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

// @desc    Get customer tickets
// @route   GET /api/tickets
// @access  Private
export const getMyTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { customer: req.user.id };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [tickets, total] = await Promise.all([
    CustomerTicket.find(query)
      .populate('assignedTo', 'name')
      .populate('relatedOrder', 'orderNumber')
      .populate('relatedProduct', 'name slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    CustomerTicket.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: tickets,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await CustomerTicket.findOne({
    _id: req.params.id,
    customer: req.user.id,
  })
    .populate('assignedTo', 'name')
    .populate('relatedOrder', 'orderNumber')
    .populate('relatedProduct', 'name slug')
    .populate('messages.sender', 'name avatar role')
    .lean();

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  res.status(200).json({
    success: true,
    data: ticket,
  });
});

// @desc    Create ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = asyncHandler(async (req, res) => {
  const { category, subject, description, relatedOrder, relatedProduct } = req.body;

  const ticket = await CustomerTicket.create({
    customer: req.user.id,
    category,
    subject,
    description,
    relatedOrder: relatedOrder || null,
    relatedProduct: relatedProduct || null,
    messages: [{
      sender: req.user.id,
      senderRole: 'customer',
      message: description,
    }],
  });

  await ticket.populate('customer', 'name email');

  // Notify admins
  // TODO: Send email notification to support team

  logger.info(`Ticket created: ${ticket.ticketNumber} by ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: ticket,
  });
});

// @desc    Reply to ticket
// @route   POST /api/tickets/:id/reply
// @access  Private
export const replyToTicket = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const ticket = await CustomerTicket.findOne({
    _id: req.params.id,
    customer: req.user.id,
  });

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  if (ticket.status === 'closed') {
    throw new AppError('Cannot reply to a closed ticket', 400);
  }

  ticket.messages.push({
    sender: req.user.id,
    senderRole: req.user.role === 'customer' ? 'customer' : 'support_agent',
    message,
  });

  if (ticket.status === 'resolved') {
    ticket.status = 'open';
  } else if (ticket.status === 'waiting') {
    ticket.status = 'in_progress';
  }

  await ticket.save();
  await ticket.populate('messages.sender', 'name avatar role');

  res.status(200).json({
    success: true,
    data: ticket,
  });
});

// @desc    Close ticket
// @route   PUT /api/tickets/:id/close
// @access  Private
export const closeTicket = asyncHandler(async (req, res) => {
  const ticket = await CustomerTicket.findOne({
    _id: req.params.id,
    customer: req.user.id,
  });

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  ticket.status = 'closed';
  ticket.closedAt = new Date();
  ticket.closedBy = req.user.id;
  await ticket.save();

  res.status(200).json({
    success: true,
    message: 'Ticket closed successfully',
    data: ticket,
  });
});

// ADMIN TICKET MANAGEMENT

// @desc    Get all tickets (admin)
// @route   GET /api/admin/tickets
// @access  Private/Admin
export const getAllTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, priority, category, search } = req.query;

  const query = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { ticketNumber: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [tickets, total] = await Promise.all([
    CustomerTicket.find(query)
      .populate('customer', 'name email')
      .populate('assignedTo', 'name')
      .populate('relatedOrder', 'orderNumber')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    CustomerTicket.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: tickets,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Admin reply to ticket
// @route   POST /api/admin/tickets/:id/reply
// @access  Private/Admin
export const adminReplyToTicket = asyncHandler(async (req, res) => {
  const { message, isInternal } = req.body;

  const ticket = await CustomerTicket.findById(req.params.id);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  ticket.messages.push({
    sender: req.user.id,
    senderRole: req.user.role === 'super_admin' ? 'admin' : req.user.role,
    message,
    isInternal: isInternal || false,
  });

  ticket.status = 'waiting';
  if (!ticket.assignedTo) {
    ticket.assignedTo = req.user.id;
  }

  await ticket.save();

  // Notify customer
  if (!isInternal) {
    await Notification.create({
      recipient: ticket.customer,
      type: 'ticket',
      title: 'New Reply on Your Ticket',
      message: `A support agent has replied to your ticket #${ticket.ticketNumber}.`,
      data: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
      actionUrl: `/support/tickets/${ticket._id}`,
    });
  }

  res.status(200).json({
    success: true,
    data: ticket,
  });
});

// @desc    Update ticket status/priority (admin)
// @route   PUT /api/admin/tickets/:id
// @access  Private/Admin
export const updateTicket = asyncHandler(async (req, res) => {
  const { status, priority, assignedTo } = req.body;

  const ticket = await CustomerTicket.findById(req.params.id);
  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  if (status) ticket.status = status;
  if (priority) ticket.priority = priority;
  if (assignedTo) ticket.assignedTo = assignedTo;

  if (status === 'closed') {
    ticket.closedAt = new Date();
    ticket.closedBy = req.user.id;
  }

  await ticket.save();

  res.status(200).json({
    success: true,
    data: ticket,
  });
});
