const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
// Definisci la route per ottenere tutti gli eventi
router.get('/discover', eventController.getAllEvents);
router.get('/myevents', eventController.getMyEvents);
router.get('/myEvents/:event_id', eventController.getSpecificEvent);

module.exports = router;
