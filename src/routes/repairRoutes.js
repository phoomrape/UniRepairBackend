const express = require('express');
const router = express.Router();
const {
  createRepair,
  getAllRepairs,
  getRepairById,
  updateRepairStatus,
  cancelRepair,
  deleteRepair
} = require('../controllers/repairController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../utils/upload');

router.use(authenticate);

router.post('/', upload.single('image'), createRepair);
router.get('/', getAllRepairs);
router.get('/:id', getRepairById);
router.put('/:id/status', authorize(['STAFF', 'ADMIN']), updateRepairStatus);
router.put('/:id/cancel', cancelRepair);
router.delete('/:id', authorize(['ADMIN']), deleteRepair);

module.exports = router;
