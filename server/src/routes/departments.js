const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');

// All routes require authentication
router.use(protect);

// Department routes
router.route('/')
  .get(getAllDepartments) // Allow all authenticated users to read departments
  .post(authorize('admin'), createDepartment); // Only admins can create

router.route('/:id')
  .get(getDepartmentById) // Allow all authenticated users to read a department
  .put(authorize('admin'), updateDepartment) // Only admins can update
  .delete(authorize('admin'), deleteDepartment); // Only admins can delete

module.exports = router;
