const Team = require('../models/Team');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const notificationHelper = require('../utils/notificationHelper');

// Get all teams (Role-based access)
exports.getTeams = async (req, res) => {
  try {
    const { isActive, leaderId, search } = req.query;
    const { role, departments } = req.user;

    // Build query
    const query = {};

    // Role-based filtering
    if (role === 'manager') {
      // Manager sees only teams in their department
      const deptId = departments && departments.length > 0 ? departments[0] : null;
      if (!deptId) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }
      query.department = deptId;
    }
    // Admin sees all teams (no additional filter)

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (leaderId) {
      query.leaderId = leaderId;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const teams = await Team.find(query)
      .populate('leaderId', 'name email')
      .populate('department', 'name code')
      .sort({ name: 1 });

    // Calculate member count for each team
    const teamsWithCount = await Promise.all(teams.map(async (team) => {
      const memberCount = await User.countDocuments({ teams: team._id });
      console.log(`Team: ${team.name} (${team._id}) - Member count: ${memberCount}`);
      return {
        ...team.toObject(),
        memberCount,
      };
    }));

    res.status(200).json({
      success: true,
      count: teamsWithCount.length,
      data: teamsWithCount,
    });
  } catch (error) {
    console.error('Error getting teams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teams',
      error: error.message,
    });
  }
};

// Get single team
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leaderId', 'name email')
      .populate('department', 'name code');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Get team members (using new teams array field)
    const members = await User.find({ teams: team._id })
      .select('name email role avatar');

    res.status(200).json({
      success: true,
      data: {
        ...team.toObject(),
        members,
        memberCount: members.length,
      },
    });
  } catch (error) {
    console.error('Error getting team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get team',
      error: error.message,
    });
  }
};

// Create team
exports.createTeam = async (req, res) => {
  try {
    const { name, description, leaderId, department, tags, color } = req.body;

    console.log('🔍 CREATE TEAM - Request Body:', req.body);
    console.log('🔍 CREATE TEAM - leaderId value:', leaderId, 'type:', typeof leaderId);

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required',
      });
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team name already exists',
      });
    }

    // Create team - only include leaderId if it's provided
    const teamData = {
      name,
      description,
      department,
      tags,
      color,
    };

    // Only add leaderId if it's a valid value (not undefined, null, or empty string)
    if (leaderId) {
      console.log('✅ Adding leaderId to team data:', leaderId);
      teamData.leaderId = leaderId;
    } else {
      console.log('⏭️  Skipping leaderId (no team lead selected)');
    }

    console.log('🔍 CREATE TEAM - Final teamData:', teamData);
    const team = await Team.create(teamData);

    // Populate leader info
    await team.populate('leaderId', 'name email');

    res.status(201).json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team',
      error: error.message,
    });
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    const { name, description, leaderId, department, tags, color, isActive } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if new name conflicts with existing team
    if (name && name !== team.name) {
      const existingTeam = await Team.findOne({ name, _id: { $ne: req.params.id } });
      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'Team name already exists',
        });
      }
    }

    // Update fields
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    // Only update leaderId if it has a valid value, otherwise set to null (no leader)
    if (leaderId !== undefined) {
      team.leaderId = leaderId || null;
    }
    if (department !== undefined) team.department = department;
    if (tags !== undefined) team.tags = tags;
    if (color !== undefined) team.color = color;
    if (isActive !== undefined) team.isActive = isActive;

    await team.save();
    await team.populate('leaderId', 'name email');

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team',
      error: error.message,
    });
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if team has members
    const memberCount = await User.countDocuments({ teamId: team._id });
    if (memberCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete team with ${memberCount} member(s). Please reassign members first.`,
      });
    }

    await team.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team',
      error: error.message,
    });
  }
};

// Add member to team
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const teamId = req.params.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user's team
    user.teamId = teamId;
    await user.save();

    // Update team member count
    const memberCount = await User.countDocuments({ teamId });
    team.memberCount = memberCount;
    await team.save();

    // Create notification for team assignment
    try {
      const { title: notifTitle, message, priority } = notificationHelper.createNotificationMessage(
        'team_assignment',
        { name: team.name },
        req.user
      );

      const actionUrl = notificationHelper.getNotificationActionUrl(
        'team_assignment',
        team._id,
        'Team'
      );

      await createNotification({
        userId: user._id,
        type: 'team_assignment',
        title: notifTitle,
        message,
        relatedId: team._id,
        relatedModel: 'Team',
        actionUrl,
        priority,
      });

      console.log(`✅ Created notification for team assignment: ${user.name} → ${team.name}`);
    } catch (notifError) {
      console.error('Error creating team assignment notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Member added to team successfully',
      data: team,
    });
  } catch (error) {
    console.error('Error adding member to team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member to team',
      error: error.message,
    });
  }
};

// Remove member from team
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const teamId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove team from user
    user.teamId = null;
    await user.save();

    // Update team member count
    const team = await Team.findById(teamId);
    if (team) {
      const memberCount = await User.countDocuments({ teamId });
      team.memberCount = memberCount;
      await team.save();
    }

    res.status(200).json({
      success: true,
      message: 'Member removed from team successfully',
    });
  } catch (error) {
    console.error('Error removing member from team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member from team',
      error: error.message,
    });
  }
};
