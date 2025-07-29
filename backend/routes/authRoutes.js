const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// Definisci la route per ottenere tutti gli eventi
router.post('/register', authController.Signup);
router.post('/login', authController.Login);

// router.get('/login', authController.Login);
module.exports = router;
