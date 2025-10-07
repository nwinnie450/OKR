const Badge = require('../models/Badge');
const Objective = require('../models/Objective');
const CheckIn = require('../models/CheckIn');
const { createNotification } = require('./notificationController');
const notificationHelper = require('../utils/notificationHelper');

// Badge definitions
const BADGE_DEFINITIONS = {
  'first-okr': {
    title: 'First Steps',
    description: 'Created your first OKR',
    icon: '🎯',
  },
  'streak-7': {
    title: '7-Day Streak',
    description: 'Checked in for 7 consecutive days',
    icon: '🔥',
  },
  'streak-30': {
    title: '30-Day Streak',
    description: 'Checked in for 30 consecutive days',
    icon: '⚡',
  },
  'achiever-100': {
    title: 'Goal Achiever',
    description: 'Completed an OKR with 100% progress',
    icon: '🏆',
  },
  'team-player': {
    title: 'Team Player',
    description: 'Aligned to 5+ team objectives',
    icon: '🤝',
  },
  'early-bird': {
    title: 'Early Bird',
    description: 'First check-in of the quarter',
    icon: '🌅',
  },
  'perfectionist': {
    title: 'Perfectionist',
    description: 'Completed 3 OKRs at 100%',
    icon: '💎',
  },
  'leader': {
    title: 'Leadership',
    description: 'Managed 10+ team OKRs',
    icon: '👑',
  },
  'consistent': {
    title: 'Consistency',
    description: 'Checked in every week for a quarter',
    icon: '📅',
  },
  'overachiever': {
    title: 'Overachiever',
    description: 'Completed 5 OKRs at 100%',
    icon: '🌟',
  },
};

// Get user's badges
exports.getBadges = async (req, res) => {
  try {
    const userId = req.query.userId || req.user._id;

    const badges = await Badge.find({ userId }).sort({ earnedAt: -1 });

    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges,
    });
  } catch (error) {
    console.error('Error getting badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get badges',
      error: error.message,
    });
  }
};

// Award a badge
exports.awardBadge = async (req, res) => {
  try {
    const { userId, badgeType } = req.body;

    if (!BADGE_DEFINITIONS[badgeType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid badge type',
      });
    }

    // Check if badge already exists
    const existingBadge = await Badge.findOne({ userId, badgeType });
    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: 'Badge already earned',
      });
    }

    const badgeDef = BADGE_DEFINITIONS[badgeType];
    const badge = await Badge.create({
      userId,
      badgeType,
      title: badgeDef.title,
      description: badgeDef.description,
      icon: badgeDef.icon,
    });

    // Create notification for badge earned
    try {
      const { title: notifTitle, message, priority } = notificationHelper.createNotificationMessage(
        'badge_earned',
        { name: badgeDef.title, description: badgeDef.description },
        null // No actor for badge earning
      );

      const actionUrl = notificationHelper.getNotificationActionUrl(
        'badge_earned',
        badge._id,
        'Badge'
      );

      await createNotification({
        userId,
        type: 'badge_earned',
        title: notifTitle,
        message,
        relatedId: badge._id,
        relatedModel: 'Badge',
        actionUrl,
        priority,
      });

      console.log(`✅ Created notification for badge earned: ${badgeDef.title}`);
    } catch (notifError) {
      console.error('Error creating badge notification:', notifError);
    }

    res.status(201).json({
      success: true,
      data: badge,
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award badge',
      error: error.message,
    });
  }
};

// Check and award badges for a user
exports.checkBadges = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const newBadges = [];

    // Get user's existing badges
    const existingBadges = await Badge.find({ userId });
    const existingBadgeTypes = existingBadges.map(b => b.badgeType);

    // Check for first-okr badge
    if (!existingBadgeTypes.includes('first-okr')) {
      const objectivesCount = await Objective.countDocuments({ ownerId: userId });
      if (objectivesCount >= 1) {
        const badge = await Badge.create({
          userId,
          badgeType: 'first-okr',
          ...BADGE_DEFINITIONS['first-okr'],
        });
        newBadges.push(badge);
      }
    }

    // Check for achiever-100 badge
    if (!existingBadgeTypes.includes('achiever-100')) {
      const completed100 = await Objective.countDocuments({
        ownerId: userId,
        progress: 100,
        status: 'completed',
      });
      if (completed100 >= 1) {
        const badge = await Badge.create({
          userId,
          badgeType: 'achiever-100',
          ...BADGE_DEFINITIONS['achiever-100'],
        });
        newBadges.push(badge);
      }
    }

    // Check for perfectionist badge (3 OKRs at 100%)
    if (!existingBadgeTypes.includes('perfectionist')) {
      const completed100 = await Objective.countDocuments({
        ownerId: userId,
        progress: 100,
        status: 'completed',
      });
      if (completed100 >= 3) {
        const badge = await Badge.create({
          userId,
          badgeType: 'perfectionist',
          ...BADGE_DEFINITIONS['perfectionist'],
        });
        newBadges.push(badge);
      }
    }

    // Check for overachiever badge (5 OKRs at 100%)
    if (!existingBadgeTypes.includes('overachiever')) {
      const completed100 = await Objective.countDocuments({
        ownerId: userId,
        progress: 100,
        status: 'completed',
      });
      if (completed100 >= 5) {
        const badge = await Badge.create({
          userId,
          badgeType: 'overachiever',
          ...BADGE_DEFINITIONS['overachiever'],
        });
        newBadges.push(badge);
      }
    }

    // Check for team-player badge
    if (!existingBadgeTypes.includes('team-player')) {
      const teamObjectives = await Objective.countDocuments({
        ownerId: userId,
        type: 'team',
      });
      if (teamObjectives >= 5) {
        const badge = await Badge.create({
          userId,
          badgeType: 'team-player',
          ...BADGE_DEFINITIONS['team-player'],
        });
        newBadges.push(badge);
      }
    }

    // Check for leader badge (10+ team OKRs owned)
    if (!existingBadgeTypes.includes('leader')) {
      const teamOKRs = await Objective.countDocuments({
        ownerId: userId,
        type: 'team',
      });
      if (teamOKRs >= 10) {
        const badge = await Badge.create({
          userId,
          badgeType: 'leader',
          ...BADGE_DEFINITIONS['leader'],
        });
        newBadges.push(badge);
      }
    }

    res.status(200).json({
      success: true,
      message: `Checked badges for user. ${newBadges.length} new badge(s) earned.`,
      newBadges,
      totalBadges: existingBadges.length + newBadges.length,
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check badges',
      error: error.message,
    });
  }
};

// Get all available badge types
exports.getBadgeTypes = async (req, res) => {
  try {
    const badgeTypes = Object.keys(BADGE_DEFINITIONS).map(key => ({
      type: key,
      ...BADGE_DEFINITIONS[key],
    }));

    res.status(200).json({
      success: true,
      count: badgeTypes.length,
      data: badgeTypes,
    });
  } catch (error) {
    console.error('Error getting badge types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get badge types',
      error: error.message,
    });
  }
};

// Delete a badge (admin only)
exports.deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Badge deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting badge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete badge',
      error: error.message,
    });
  }
};
