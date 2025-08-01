const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
// Definisci la route per ottenere tutti gli eventi
router.get('/:user_id', friendsController.getAllFriends);
router.get('/:user_id/pendingFriends', friendsController.getPendingFriends);
router.post('/:user_id/sendRequest', friendsController.sendFriendRequest);
router.patch('/:user_id/accept', friendsController.acceptFriendRequest);
router.delete('/:user_id/deny', friendsController.denyFriendRequest);
// router.get('/:group_id', groupController.getSpecificGroup);
// router.get('/:group_id/groupEvents', groupController.getGroupEvents);
// router.get('/groupEvents/:event_id', groupController.getSpecificGroupEvent);
// router.post('/add/newGroup', groupController.addNewGroup);
// router.patch('/modify/:group_id', groupController.modifyGroup);

module.exports = router;
