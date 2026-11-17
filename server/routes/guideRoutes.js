const express = require("express");
const router = express.Router();
const guideController = require("../controllers/guideController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.get(
  "/reservations",
  verifyToken,
  requireRole("guide"),
  guideController.getGuideReservations,
);
router.put(
  "/reservations/:id/status",
  verifyToken,
  requireRole("guide"),
  guideController.updateReservationStatus,
);

module.exports = router;
