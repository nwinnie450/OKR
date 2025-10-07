const User = require('../models/User');
const Team = require('../models/Team');

/**
 * Notification Helper Utility
 *
 * Provides functions to determine who should receive notifications
 * based on OKR hierarchy, team structure, and roles.
 */

/**
 * Get users who should be notified about an OKR action
 * @param {Object} objective - The objective document
 * @param {String} action - Type of action (created, updated, deleted)
 * @param {String} actorId - ID of user performing the action (to exclude from notifications)
 * @returns {Promise<Array>} Array of user IDs to notify
 */
exports.getOKRNotificationRecipients = async (objective, action, actorId) => {
  const recipients = new Set(); // Using Set to avoid duplicates

  try {
    // Always notify admins about company-level OKRs
    if (objective.type === 'company') {
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
      admins.forEach(admin => {
        if (admin._id.toString() !== actorId) {
          recipients.add(admin._id.toString());
        }
      });

      // Notify all department heads
      const managers = await User.find({ role: 'manager', isActive: true }).select('_id');
      managers.forEach(manager => {
        if (manager._id.toString() !== actorId) {
          recipients.add(manager._id.toString());
        }
      });
    }

    // Department OKRs - notify team leads in that department + department head
    if (objective.type === 'department' && objective.departmentId) {
      // Get department head (manager assigned to this department)
      const deptHead = await User.findOne({
        role: 'manager',
        departments: objective.departmentId,
        isActive: true
      }).select('_id');

      if (deptHead && deptHead._id.toString() !== actorId) {
        recipients.add(deptHead._id.toString());
      }

      // Get all team leads in teams belonging to this department
      const teams = await Team.find({ department: objective.departmentId });
      const teamLeadIds = teams.map(team => team.leaderId).filter(Boolean);

      const teamLeads = await User.find({
        _id: { $in: teamLeadIds },
        isActive: true
      }).select('_id');

      teamLeads.forEach(lead => {
        if (lead._id.toString() !== actorId) {
          recipients.add(lead._id.toString());
        }
      });

      // Notify admins
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
      admins.forEach(admin => {
        if (admin._id.toString() !== actorId) {
          recipients.add(admin._id.toString());
        }
      });
    }

    // Team OKRs - notify all team members + team lead + department head
    if (objective.type === 'team' && objective.teamId) {
      // Get team details
      const team = await Team.findById(objective.teamId).populate('leaderId');

      if (team) {
        // Notify team lead
        if (team.leaderId && team.leaderId._id.toString() !== actorId) {
          recipients.add(team.leaderId._id.toString());
        }

        // Notify all team members
        const teamMembers = await User.find({
          teams: objective.teamId,
          isActive: true
        }).select('_id');

        teamMembers.forEach(member => {
          if (member._id.toString() !== actorId) {
            recipients.add(member._id.toString());
          }
        });

        // Notify department head if team belongs to a department
        if (team.department) {
          const deptHead = await User.findOne({
            role: 'manager',
            departments: team.department,
            isActive: true
          }).select('_id');

          if (deptHead && deptHead._id.toString() !== actorId) {
            recipients.add(deptHead._id.toString());
          }
        }
      }
    }

    // Individual OKRs - notify the individual + their manager + team lead
    if (objective.type === 'individual') {
      // The owner is usually the creator, but we can get from context
      // Notify their manager
      const user = await User.findById(actorId).populate('teams').populate('departments');

      if (user) {
        // Get user's team lead
        if (user.teams && user.teams.length > 0) {
          const userTeam = await Team.findById(user.teams[0]);
          if (userTeam && userTeam.leaderId && userTeam.leaderId.toString() !== actorId) {
            recipients.add(userTeam.leaderId.toString());
          }
        }

        // Get user's department head
        if (user.departments && user.departments.length > 0) {
          const deptHead = await User.findOne({
            role: 'manager',
            departments: user.departments[0],
            isActive: true
          }).select('_id');

          if (deptHead && deptHead._id.toString() !== actorId) {
            recipients.add(deptHead._id.toString());
          }
        }
      }
    }

    return Array.from(recipients);
  } catch (error) {
    console.error('Error getting OKR notification recipients:', error);
    return [];
  }
};

/**
 * Get users who should be notified about a check-in
 * @param {Object} checkIn - The check-in document
 * @param {Object} keyResult - The key result document
 * @param {Object} objective - The objective document
 * @param {String} actorId - ID of user submitting check-in
 * @returns {Promise<Array>} Array of user IDs to notify
 */
exports.getCheckInNotificationRecipients = async (checkIn, keyResult, objective, actorId) => {
  const recipients = new Set();

  try {
    // Notify the OKR owner if different from actor
    if (keyResult.ownerId && keyResult.ownerId.toString() !== actorId) {
      recipients.add(keyResult.ownerId.toString());
    }

    // Get user's team lead
    const user = await User.findById(actorId).populate('teams');
    if (user && user.teams && user.teams.length > 0) {
      const userTeam = await Team.findById(user.teams[0]);
      if (userTeam && userTeam.leaderId && userTeam.leaderId.toString() !== actorId) {
        recipients.add(userTeam.leaderId.toString());
      }
    }

    // If objective has aligned objectives, notify those owners too
    if (objective.alignedToId) {
      const parentObjective = await require('../models/Objective').findById(objective.alignedToId);
      if (parentObjective && parentObjective.ownerId && parentObjective.ownerId.toString() !== actorId) {
        recipients.add(parentObjective.ownerId.toString());
      }
    }

    return Array.from(recipients);
  } catch (error) {
    console.error('Error getting check-in notification recipients:', error);
    return [];
  }
};

/**
 * Get notification action URL based on type and related entity
 * @param {String} type - Notification type
 * @param {String} relatedId - ID of related entity
 * @param {String} relatedModel - Model type of related entity
 * @returns {String} Action URL
 */
exports.getNotificationActionUrl = (type, relatedId, relatedModel) => {
  switch (relatedModel) {
    case 'Objective':
      return `/okr/${relatedId}`;
    case 'KeyResult':
      return `/okr/${relatedId}`;
    case 'CheckIn':
      return `/okr/${relatedId}`;
    case 'Badge':
      return `/profile`;
    case 'Team':
      return `/teams`;
    case 'User':
      return `/users`;
    default:
      return '/';
  }
};

/**
 * Create notification message based on action and entity
 * @param {String} action - Action performed
 * @param {Object} entity - Entity affected
 * @param {Object} actor - User who performed the action
 * @returns {Object} { title, message, priority }
 */
exports.createNotificationMessage = (action, entity, actor) => {
  const actorName = actor?.name || 'Someone';

  const messages = {
    okr_created: {
      title: `New ${entity.type} OKR Created`,
      message: `${actorName} created "${entity.title}"`,
      priority: entity.type === 'company' ? 'high' : 'medium'
    },
    okr_updated: {
      title: 'OKR Updated',
      message: `${actorName} updated "${entity.title}"`,
      priority: 'low'
    },
    okr_deleted: {
      title: 'OKR Deleted',
      message: `${actorName} deleted "${entity.title}"`,
      priority: 'medium'
    },
    checkin_submitted: {
      title: 'Progress Update',
      message: `${actorName} submitted a check-in for "${entity.title}"`,
      priority: 'medium'
    },
    badge_earned: {
      title: '🏆 New Badge Earned!',
      message: `Congratulations! You earned the "${entity.name}" badge`,
      priority: 'medium'
    },
    team_assignment: {
      title: 'Team Assignment',
      message: `You have been added to team "${entity.name}"`,
      priority: 'high'
    },
    deadline_approaching: {
      title: '⏰ Deadline Approaching',
      message: `Quarter ends in ${entity.daysRemaining} days. Update your OKRs!`,
      priority: 'urgent'
    }
  };

  return messages[action] || {
    title: 'Notification',
    message: 'You have a new notification',
    priority: 'medium'
  };
};
