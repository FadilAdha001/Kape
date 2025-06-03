// routes/AuthRoutes.js
const express = require('express');
const router = express.Router();
const { login, me, logout } = require('../controllers/AuthController');
const { verifyUser } = require('../middleware/UserMiddleware');

router.post('/login', login);
router.get('/me', verifyUser, me);
router.post('/logout', verifyUser, logout);

module.exports = router;