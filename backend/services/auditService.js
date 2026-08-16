const AuditLog = require("../models/AuditLog");

/**
 * Creates an audit log entry for admin actions and emits real-time WebSocket update
 */
const logAdminAction = async (adminUser, action, targetType, targetId = "", details = "", ipAddress = "", req = null) => {
  try {
    const log = await AuditLog.create({
      adminId: adminUser.id || adminUser._id,
      adminEmail: adminUser.email || "admin@speakora.com",
      action,
      targetType,
      targetId: String(targetId),
      details,
      ipAddress,
    });

    if (req && req.io) {
      req.io.emit("audit_log_new", log);
    }
  } catch (err) {
    console.error("Audit Log Creation Error:", err.message);
  }
};

/**
 * Creates an audit log entry for standard user actions (login, practice, feedback)
 */
const logUserAction = async (user, action, targetType, targetId = "", details = "", ipAddress = "", req = null) => {
  try {
    const log = await AuditLog.create({
      adminId: user.id || user._id,
      adminEmail: user.email,
      action,
      targetType,
      targetId: String(targetId),
      details,
      ipAddress: ipAddress || (req ? req.ip : ""),
    });

    if (req && req.io) {
      req.io.emit("audit_log_new", log);
    }
  } catch (err) {
    console.error("User Audit Log Creation Error:", err.message);
  }
};

module.exports = {
  logAdminAction,
  logUserAction,
};
