const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
// Definisci la route per ottenere tutti gli eventi
router.get('/', groupController.getAllGroups);
router.get('/:group_id', groupController.getSpecificGroup);
router.get('/:group_id/groupEvents', groupController.getGroupEvents);
router.get('/groupEvents/:event_id', groupController.getSpecificGroupEvent);
router.post('/add/newGroup', groupController.addNewGroup);
router.patch('/modify/:group_id', groupController.modifyGroup);

module.exports = router;
