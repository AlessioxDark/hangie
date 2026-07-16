const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middlewares/auth");

router.use(authMiddleware.authMiddleware);

// Definisci la route per ottenere tutti gli eventi
router.get("/discover", eventController.getAllEvents);
router.get("/myevents", eventController.getMyEvents);
router.post("/suspendedevenets/all", eventController.getSuspendedEvents);
router.patch("/modify/:event_id", eventController.modifyEvent);
router.post("/add/create-event", eventController.addNewEvent);
router.patch("/answer/:event_id", eventController.modifyResponseEvent);
router.get("/:event_id", eventController.getSpecificEvent);
router.delete("/:event_id", eventController.deleteSpecificEvent);

module.exports = router;
