const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/', authorize(['ADMIN', 'STAFF']), getAllUsers);
router.get('/:id', authorize(['ADMIN']), getUserById);
router.post('/', authorize(['ADMIN']), createUser);
router.put('/:id', authorize(['ADMIN']), updateUser);
router.delete('/:id', authorize(['ADMIN']), deleteUser);

module.exports = router;
