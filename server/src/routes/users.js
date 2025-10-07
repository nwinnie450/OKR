const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const createUserValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
];

const updateUserValidation = [
  body('email').optional().isEmail().normalizeEmail(),
  body('name').optional().trim().notEmpty()
];

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .get(getAllUsers) // Allow all authenticated users to read users (filtered by role in controller)
  .post(authorize('admin', 'manager'), createUserValidation, createUser); // Admin and managers can create

router.route('/:id')
  .get(getUserById) // Allow all authenticated users to read a user
  .put(authorize('admin', 'manager'), updateUserValidation, updateUser) // Admin and managers can update
  .delete(authorize('admin', 'manager'), deleteUser); // Admin and managers can delete

module.exports = router;
