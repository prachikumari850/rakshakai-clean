const express = require('express');
const router = express.Router();
const { createPassport, getMyPassport, getPublicPassport } = require('../controllers/passportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createPassport);
router.get('/my', protect, getMyPassport);
router.get('/public/:passportId', getPublicPassport); // No auth — scannable by anyone

module.exports = router;