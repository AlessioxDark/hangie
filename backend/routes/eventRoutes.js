const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
// Definisci la route per ottenere tutti gli eventi
router.get('/getAllEvents', eventController.getAllEvents);

module.exports = router;
