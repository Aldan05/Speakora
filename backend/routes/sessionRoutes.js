const express = require("express");
const router = express.Router();
const {
  createSession,
  getUserSessions,
  getSessionById,
  getSessionAudio,
  deleteSession,
} = require("../controllers/sessionController");
const auth = require("../middleware/auth");
const upload = require("../config/multer");

// Protected session endpoints
router.post("/", auth, upload.single("audio"), createSession);
router.get("/", auth, getUserSessions);
router.get("/:id", auth, getSessionById);
router.get("/:id/audio", auth, getSessionAudio);
router.delete("/:id", auth, deleteSession);

module.exports = router;
