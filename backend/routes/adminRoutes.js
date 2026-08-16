const express = require("express");
const router = express.Router();
const {
  getAdminDashboard,
  getAdminSessions,
  getAdminUsers,
  toggleUserStatus,
  retrySessionProcessing,
  deleteAdminSession,
  getAuditLogs,
} = require("../controllers/adminController");
const {
  getAdminFeedback,
  respondToFeedback,
} = require("../controllers/feedbackController");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/dashboard", auth, adminOnly, getAdminDashboard);
router.get("/sessions", auth, adminOnly, getAdminSessions);
router.get("/users", auth, adminOnly, getAdminUsers);
router.patch("/users/:id/status", auth, adminOnly, toggleUserStatus);
router.post("/sessions/:id/retry", auth, adminOnly, retrySessionProcessing);
router.delete("/sessions/:id", auth, adminOnly, deleteAdminSession);
router.get("/audit-logs", auth, adminOnly, getAuditLogs);
router.get("/feedback", auth, adminOnly, getAdminFeedback);
router.patch("/feedback/:id/respond", auth, adminOnly, respondToFeedback);

module.exports = router;
