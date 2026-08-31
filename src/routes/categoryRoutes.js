const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.get('/', getAllCategories);
router.post('/', authenticate, authorize(['ADMIN']), createCategory);
router.put('/:id', authenticate, authorize(['ADMIN']), updateCategory);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteCategory);

module.exports = router;
