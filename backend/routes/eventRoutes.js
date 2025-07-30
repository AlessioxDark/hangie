const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
// Definisci la route per ottenere tutti gli eventi
router.get('/discover', eventController.getAllEvents);
router.get('/myevents', eventController.getMyEvents);
router.get('/myEvents/:event_id', eventController.getSpecificEvent);
router.patch('/modify/:event_id', eventController.modifyEvent);
router.post('/add/newEvent', eventController.addNewEvent);
router.post('/request/:event_id', eventController.modifyResponseEvent);

module.exports = router;
