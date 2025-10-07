const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private/Admin
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('headOfDepartment', 'name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message,
    });
  }
};

// @desc    Get single department by ID
// @route   GET /api/departments/:id
// @access  Private/Admin
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headOfDepartment', 'name email role');

    if (!department || !department.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department',
      error: error.message,
    });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description, headOfDepartment } = req.body;

    // Check if department with same code or name already exists
    const existingDept = await Department.findOne({
      $or: [
        { code: code.toUpperCase() },
        { name: { $regex: new RegExp(`^${name}$`, 'i') } }
      ],
      isActive: true,
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name or code already exists',
      });
    }

    // Verify headOfDepartment exists if provided
    if (headOfDepartment) {
      const user = await User.findById(headOfDepartment);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Head of department user not found',
        });
      }
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      headOfDepartment: headOfDepartment || null,
    });

    const populatedDept = await Department.findById(department._id)
      .populate('headOfDepartment', 'name email');

    res.status(201).json({
      success: true,
      data: populatedDept,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message,
    });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res) => {
  try {
    const { name, code, description, headOfDepartment } = req.body;

    let department = await Department.findById(req.params.id);

    if (!department || !department.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Check if new code/name conflicts with existing departments
    if (name || code) {
      const existingDept = await Department.findOne({
        _id: { $ne: req.params.id },
        $or: [
          code && { code: code.toUpperCase() },
          name && { name: { $regex: new RegExp(`^${name}$`, 'i') } }
        ].filter(Boolean),
        isActive: true,
      });

      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: 'Department with this name or code already exists',
        });
      }
    }

    // Verify headOfDepartment exists if provided
    if (headOfDepartment) {
      const user = await User.findById(headOfDepartment);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Head of department user not found',
        });
      }
    }

    // Update fields
    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description;
    if (headOfDepartment !== undefined) department.headOfDepartment = headOfDepartment || null;

    await department.save();

    const updatedDept = await Department.findById(department._id)
      .populate('headOfDepartment', 'name email');

    res.status(200).json({
      success: true,
      data: updatedDept,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: error.message,
    });
  }
};

// @desc    Delete department (soft delete)
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department || !department.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Check if any active users are in this department
    const usersInDept = await User.countDocuments({
      department: req.params.id,
      isActive: true,
    });

    if (usersInDept > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. ${usersInDept} active user(s) are assigned to this department.`,
      });
    }

    // Soft delete
    department.isActive = false;
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete department',
      error: error.message,
    });
  }
};
