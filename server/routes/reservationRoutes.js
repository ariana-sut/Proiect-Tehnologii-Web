const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, reservationController.createReservation);
router.get("/my", verifyToken, reservationController.getMyReservations);
router.put("/:id/cancel", verifyToken, reservationController.cancelReservation);

module.exports = router;
