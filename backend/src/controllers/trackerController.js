import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const snapshot = {
  activeStaff: 3,
  sharingEnabled: 2,
  incidents: [
    {
      id: 'inc-1',
      title: 'Door access anomaly',
      severity: 'urgent',
      detail: 'Security team requested a manual check at Building B',
      time: '4m ago',
    },
    {
      id: 'inc-2',
      title: 'Shift handoff pending',
      severity: 'high',
      detail: 'Two staff members are due for the next check-in window',
      time: '18m ago',
    },
  ],
  staff: [
    {
      id: 1,
      name: 'Maya Chen',
      role: 'Field Supervisor',
      location: 'North Hub',
      status: 'active',
      lastUpdate: '2 min ago',
      sharing: true,
    },
    {
      id: 2,
      name: 'Darius Brooks',
      role: 'Support Lead',
      location: 'West Wing',
      status: 'away',
      lastUpdate: '10 min ago',
      sharing: true,
    },
    {
      id: 3,
      name: 'Noah Patel',
      role: 'Operations',
      location: 'Offline',
      status: 'offline',
      lastUpdate: '15 min ago',
      sharing: false,
    },
  ],
};

export const getTrackerSnapshot = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: snapshot,
  });
});

export const updateStaffPresence = asyncHandler(async (req, res) => {
  const { status, location, sharing } = req.body;

  if (!status) {
    throw new AppError('Status is required', 400);
  }

  const staffMember = snapshot.staff.find((person) => String(person.id) === req.params.id);

  if (!staffMember) {
    throw new AppError('Staff member not found', 404);
  }

  staffMember.status = status;
  if (location) staffMember.location = location;
  if (typeof sharing === 'boolean') staffMember.sharing = sharing;
  staffMember.lastUpdate = 'just now';

  res.status(200).json({
    success: true,
    data: staffMember,
  });
});

export const createIncidentAlert = asyncHandler(async (req, res) => {
  const { title, severity, detail } = req.body;

  if (!title || !severity || !detail) {
    throw new AppError('Title, severity, and detail are required', 400);
  }

  const alert = {
    id: `inc-${Date.now()}`,
    title,
    severity,
    detail,
    time: 'just now',
  };

  snapshot.incidents.unshift(alert);

  res.status(201).json({
    success: true,
    data: alert,
  });
});
