// backend/routes/fitRoutes.js
// NEW FILE — mounts fit data routes (all protected by JWT)

const express = require('express');
const router = express.Router();
const { getFitData, getCachedFitData } = require('../controllers/fitController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/fit-data — fetch live from Google Fit
router.post('/', protect, getFitData);

// GET /api/fit-data/cached — return last stored data (no Google call)
router.get('/cached', protect, getCachedFitData);

module.exports = router; 