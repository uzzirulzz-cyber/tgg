import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export const auditLog = (action, entityType, getEntityId = null, getDescription = null) => {
  return async (req, res, next) => {
    // Store original json method to capture response
    const originalJson = res.json;

    res.json = function(data) {
      res.json = originalJson;

      // Only log successful operations
      if (res.statusCode < 400) {
        try {
          const logData = {
            user: req.user?._id || null,
            userEmail: req.user?.email || req.body?.email || null,
            userRole: req.user?.role || null,
            action,
            entityType,
            entityId: getEntityId ? getEntityId(req, data) : (req.params?.id || null),
            description: getDescription ? getDescription(req, data) : `${action} ${entityType}`,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
            userAgent: req.headers['user-agent'] || null,
          };

          AuditLog.create(logData).catch(err => {
            logger.error(`Audit log creation failed: ${err.message}`);
          });
        } catch (err) {
          logger.error(`Audit log middleware error: ${err.message}`);
        }
      }

      return res.json(data);
    };

    next();
  };
};
