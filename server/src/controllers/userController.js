const User = require('../models/User');

// @desc    Get all users (Role-based access)
// @route   GET /api/users
// @access  Private (Admin/Manager/Team Lead)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, departments, teams } = req.user;
    let query = { isActive: true };

    // Role-based filtering
    if (role === 'manager') {
      // Manager sees only users in their department
      const deptId = departments && departments.length > 0 ? departments[0] : null;
      console.log('🔍 MANAGER GETTING USERS - Department ID:', deptId);
      if (!deptId) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }
      // Use $in to check if deptId is in the user's departments array
      query.departments = { $in: [deptId] };
      console.log('🔍 USER QUERY:', JSON.stringify(query));
    } else if (role === 'team_lead') {
      // Team lead sees only users in their team
      const teamId = teams && teams.length > 0 ? teams[0] : null;
      if (!teamId) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }
      // Use $in to check if teamId is in the user's teams array
      query.teams = { $in: [teamId] };
    }
    // Admin sees all users (no additional filter)

    const users = await User.find(query)
      .select('-password')
      .populate('departments', 'name code')
      .populate('teams', 'name')
      .sort({ createdAt: -1 });

    console.log(`🔍 USERS FOUND: ${users.length}`);
    users.forEach(u => {
      console.log(`   - ${u.name} (${u.email}) - Depts: ${JSON.stringify(u.departments)}`);
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, departments, teams } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'member',
      departments: departments || [],
      teams: teams || [],
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, departments, teams, avatar, avatarUrl } = req.body;

    // Build update object (exclude password from updates)
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (departments !== undefined) updateData.departments = departments;
    if (teams !== undefined) updateData.teams = teams;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
