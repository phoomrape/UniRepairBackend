const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/dashboard', authenticate, authorize(['STAFF', 'ADMIN']), getDashboardStats);

module.exports = router;
