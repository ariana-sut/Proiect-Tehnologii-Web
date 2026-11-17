const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.get("/", tourController.getAllTours);
router.get("/:id", tourController.getTourById);

router.post("/", verifyToken, requireRole("guide"), tourController.createTour);
router.put(
  "/:id",
  verifyToken,
  requireRole("guide"),
  tourController.updateTour,
);
router.delete(
  "/:id",
  verifyToken,
  requireRole("guide"),
  tourController.deleteTour,
);

module.exports = router;
