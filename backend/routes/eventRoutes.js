const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
// Definisci la route per ottenere tutti gli eventi
router.get('/getAllEvents', eventController.getAllEvents);
router.get('/myEvents/:user_id', eventController.getMyEvents);

module.exports = router;
