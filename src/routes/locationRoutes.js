const express = require('express');
const router = express.Router();
const { getAllLocations, createLocation, updateLocation, deleteLocation } = require('../controllers/locationController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', getAllLocations);
router.post('/', authenticate, authorize(['ADMIN']), createLocation);
router.put('/:id', authenticate, authorize(['ADMIN']), updateLocation);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteLocation);

module.exports = router;
