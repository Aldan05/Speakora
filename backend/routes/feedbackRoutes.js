const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getMyFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");
const auth = require("../middleware/auth");

router.post("/", auth, createFeedback);
router.get("/my", auth, getMyFeedback);
router.delete("/:id", auth, deleteFeedback);

module.exports = router;
