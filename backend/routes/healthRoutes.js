const express = require('express');
const router = express.Router();
const { logHealth, getHistory, getRisk } = require('../controllers/healthController');
const { protect } = require('../middleware/authMiddleware');

router.post('/log', protect, logHealth);
router.get('/history', protect, getHistory);
router.post('/risk', getRisk); // Public — no auth needed for demo

module.exports = router;
