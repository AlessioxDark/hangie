const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
// Definisci la route per ottenere tutti gli eventi
router.get('/getAllGroups', groupController.getAllGroups);
router.get('/:group_id', groupController.getSpecificGroup);
router.get('/:group_id/groupEvents', groupController.getGroupEvents);

module.exports = router;
