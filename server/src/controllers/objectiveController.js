const Objective = require('../models/Objective');
const KeyResult = require('../models/KeyResult');
const { createNotification } = require('./notificationController');
const notificationHelper = require('../utils/notificationHelper');

// @desc    Get all objectives
// @route   GET /api/objectives
// @access  Private
exports.getObjectives = async (req, res) => {
  try {
    const {
      type,
      status,
      timePeriod,
      year,
      departmentId,
      teamId,
      ownerId,
      alignedToId
    } = req.query;

    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (timePeriod) filter.timePeriod = timePeriod;
    if (year) filter.year = parseInt(year);
    if (departmentId) filter.departmentId = departmentId;
    if (teamId) filter.teamId = teamId;
    if (ownerId) filter.ownerId = ownerId;
    if (alignedToId) filter.alignedToId = alignedToId;

    // For non-admin users, filter by access
    if (req.user.role !== 'admin') {
      filter.$or = [
        { ownerId: req.user._id },
        { teamId: req.user.teamId },
        { type: 'company' }
      ];
    }

    const objectives = await Objective.find(filter)
      .populate('ownerId', 'name email avatar avatarUrl')
      .populate('departmentId', 'name code')
      .populate('teamId', 'name')
      .populate('alignedToId', 'title type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: objectives.length,
      data: objectives
    });
  } catch (error) {
    console.error('Error in getObjectives:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single objective
// @route   GET /api/objectives/:id
// @access  Private
exports.getObjective = async (req, res) => {
  try {
    const objective = await Objective.findById(req.params.id)
      .populate('ownerId', 'name email avatar avatarUrl')
      .populate('departmentId', 'name code')
      .populate('teamId', 'name')
      .populate('alignedToId', 'title type');

    if (!objective) {
      return res.status(404).json({
        success: false,
        message: 'Objective not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' &&
        objective.ownerId._id.toString() !== req.user._id.toString() &&
        objective.teamId?.toString() !== req.user.teamId?.toString() &&
        objective.type !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this objective'
      });
    }

    // Get key results
    const keyResults = await KeyResult.find({ objectiveId: req.params.id })
      .populate('ownerId', 'name email');

    res.status(200).json({
      success: true,
      data: {
        ...objective.toObject(),
        keyResults
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create objective
// @route   POST /api/objectives
// @access  Private (admin, manager for team OKRs)
exports.createObjective = async (req, res) => {
  try {
    console.log('🔍 CREATE OBJECTIVE - Request Body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 CREATE OBJECTIVE - User:', req.user);

    const {
      title,
      description,
      type,
      ownerId,
      departmentId,
      teamId,
      timePeriod,
      year,
      category,
      tags,
      alignedToId,
      context,
      initiatives
    } = req.body;

    // Validate type-based permissions
    if (type === 'company' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create company objectives'
      });
    }

    if (type === 'department' && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and managers can create department objectives'
      });
    }

    if (type === 'team' && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and managers can create team objectives'
      });
    }

    // Create objective
    const objective = await Objective.create({
      title,
      description,
      type,
      ownerId: ownerId || req.user._id,
      departmentId,
      teamId,
      timePeriod,
      year,
      category,
      tags,
      alignedToId,
      context,
      initiatives,
      status: 'draft'
    });

    const populatedObjective = await Objective.findById(objective._id)
      .populate('ownerId', 'name email')
      .populate('teamId', 'name');

    // Create notifications for relevant users
    try {
      const recipients = await notificationHelper.getOKRNotificationRecipients(
        populatedObjective,
        'okr_created',
        req.user._id.toString()
      );

      const { title: notifTitle, message, priority } = notificationHelper.createNotificationMessage(
        'okr_created',
        populatedObjective,
        req.user
      );

      const actionUrl = notificationHelper.getNotificationActionUrl(
        'okr_created',
        populatedObjective._id,
        'Objective'
      );

      // Create notification for each recipient
      for (const recipientId of recipients) {
        await createNotification({
          userId: recipientId,
          type: 'okr_created',
          title: notifTitle,
          message,
          relatedId: populatedObjective._id,
          relatedModel: 'Objective',
          actionUrl,
          priority,
        });
      }

      console.log(`✅ Created ${recipients.length} notifications for new OKR: ${title}`);
    } catch (notifError) {
      console.error('Error creating notifications:', notifError);
      // Don't fail the request if notifications fail
    }

    res.status(201).json({
      success: true,
      data: populatedObjective
    });
  } catch (error) {
    console.error('❌ ERROR CREATING OBJECTIVE:', error);
    console.error('❌ ERROR MESSAGE:', error.message);
    console.error('❌ ERROR STACK:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update objective
// @route   PUT /api/objectives/:id
// @access  Private (owner, manager, admin)
exports.updateObjective = async (req, res) => {
  try {
    let objective = await Objective.findById(req.params.id);

    if (!objective) {
      return res.status(404).json({
        success: false,
        message: 'Objective not found'
      });
    }

    // Check permissions
    const isOwner = objective.ownerId.toString() === req.user._id.toString();
    const isManager = req.user.role === 'manager' && objective.teamId?.toString() === req.user.teamId?.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this objective'
      });
    }

    // Update
    objective = await Objective.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('ownerId', 'name email')
      .populate('teamId', 'name');

    // Create notifications for OKR update
    try {
      const recipients = await notificationHelper.getOKRNotificationRecipients(
        objective,
        'okr_updated',
        req.user._id.toString()
      );

      const { title: notifTitle, message, priority } = notificationHelper.createNotificationMessage(
        'okr_updated',
        objective,
        req.user
      );

      const actionUrl = notificationHelper.getNotificationActionUrl(
        'okr_updated',
        objective._id,
        'Objective'
      );

      for (const recipientId of recipients) {
        await createNotification({
          userId: recipientId,
          type: 'okr_updated',
          title: notifTitle,
          message,
          relatedId: objective._id,
          relatedModel: 'Objective',
          actionUrl,
          priority,
        });
      }

      console.log(`✅ Created ${recipients.length} notifications for updated OKR: ${objective.title}`);
    } catch (notifError) {
      console.error('Error creating update notifications:', notifError);
    }

    res.status(200).json({
      success: true,
      data: objective
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete objective
// @route   DELETE /api/objectives/:id
// @access  Private (owner, admin)
exports.deleteObjective = async (req, res) => {
  try {
    const objective = await Objective.findById(req.params.id);

    if (!objective) {
      return res.status(404).json({
        success: false,
        message: 'Objective not found'
      });
    }

    // Check permissions
    const isOwner = objective.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this objective'
      });
    }

    // Store objective data before deletion for notifications
    const objectiveData = {
      _id: objective._id,
      title: objective.title,
      type: objective.type,
      departmentId: objective.departmentId,
      teamId: objective.teamId,
    };

    // Delete associated key results
    await KeyResult.deleteMany({ objectiveId: req.params.id });

    await objective.deleteOne();

    // Create notifications for OKR deletion
    try {
      const recipients = await notificationHelper.getOKRNotificationRecipients(
        objectiveData,
        'okr_deleted',
        req.user._id.toString()
      );

      const { title: notifTitle, message, priority } = notificationHelper.createNotificationMessage(
        'okr_deleted',
        objectiveData,
        req.user
      );

      const actionUrl = '/okrs'; // Can't link to deleted objective, go to OKR list

      for (const recipientId of recipients) {
        await createNotification({
          userId: recipientId,
          type: 'okr_deleted',
          title: notifTitle,
          message,
          relatedId: null, // Objective no longer exists
          relatedModel: 'Objective',
          actionUrl,
          priority,
        });
      }

      console.log(`✅ Created ${recipients.length} notifications for deleted OKR: ${objectiveData.title}`);
    } catch (notifError) {
      console.error('Error creating delete notifications:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Objective deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Publish objective (change status from draft to active)
// @route   PUT /api/objectives/:id/publish
// @access  Private (owner, admin)
exports.publishObjective = async (req, res) => {
  try {
    const objective = await Objective.findById(req.params.id);

    if (!objective) {
      return res.status(404).json({
        success: false,
        message: 'Objective not found'
      });
    }

    // Check permissions
    const isOwner = objective.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this objective'
      });
    }

    // Check if objective has key results
    const keyResultCount = await KeyResult.countDocuments({ objectiveId: req.params.id });

    if (keyResultCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish objective without key results'
      });
    }

    objective.status = 'active';
    objective.publishedAt = new Date();
    await objective.save();

    res.status(200).json({
      success: true,
      data: objective
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
