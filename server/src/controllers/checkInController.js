const CheckIn = require('../models/CheckIn');
const KeyResult = require('../models/KeyResult');
const Objective = require('../models/Objective');
const { createNotification } = require('./notificationController');
const notificationHelper = require('../utils/notificationHelper');

// @desc    Get all check-ins
// @route   GET /api/checkins
// @access  Private
exports.getCheckIns = async (req, res) => {
  try {
    const { keyResultId, userId } = req.query;

    const filter = {};
    if (keyResultId) filter.keyResultId = keyResultId;
    if (userId) filter.userId = userId;

    const checkIns = await CheckIn.find(filter)
      .populate('keyResultId', 'title objectiveId')
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: checkIns.length,
      data: checkIns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single check-in
// @route   GET /api/checkins/:id
// @access  Private
exports.getCheckIn = async (req, res) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id)
      .populate('keyResultId', 'title objectiveId')
      .populate('userId', 'name email');

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: 'Check-in not found'
      });
    }

    res.status(200).json({
      success: true,
      data: checkIn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create check-in
// @route   POST /api/checkins
// @access  Private
exports.createCheckIn = async (req, res) => {
  try {
    const {
      keyResultId,
      currentValue,
      confidence,
      statusComment,
      blockers,
      completedTaskIds
    } = req.body;

    // Check if key result exists
    const keyResult = await KeyResult.findById(keyResultId);
    if (!keyResult) {
      return res.status(404).json({
        success: false,
        message: 'Key Result not found'
      });
    }

    // Calculate progress
    const progressCalc = ((currentValue - keyResult.startingValue) / (keyResult.targetValue - keyResult.startingValue)) * 100;
    const progress = Math.max(0, Math.min(100, Math.round(progressCalc)));

    // Check if late (more than 7 days since last check-in)
    const lastCheckIn = await CheckIn.findOne({ keyResultId })
      .sort({ submittedAt: -1 });

    let isLate = false;
    if (lastCheckIn) {
      const daysSinceLastCheckIn = (Date.now() - lastCheckIn.submittedAt.getTime()) / (1000 * 60 * 60 * 24);
      isLate = daysSinceLastCheckIn > 7;
    }

    // Create check-in
    const checkIn = await CheckIn.create({
      keyResultId,
      userId: req.user._id,
      currentValue,
      progress,
      confidence,
      statusComment,
      blockers,
      completedTaskIds,
      isLate,
      submittedAt: new Date()
    });

    // Update key result with new values
    keyResult.currentValue = currentValue;
    keyResult.progress = progress;
    keyResult.confidence = confidence;
    keyResult.lastCheckinAt = new Date();
    await keyResult.save();

    const populatedCheckIn = await CheckIn.findById(checkIn._id)
      .populate('keyResultId', 'title objectiveId')
      .populate('userId', 'name email');

    // Create notifications for check-in submission
    try {
      // Get the objective to determine recipients
      const objective = await Objective.findById(keyResult.objectiveId);

      if (objective) {
        const recipients = await notificationHelper.getCheckInNotificationRecipients(
          populatedCheckIn,
          keyResult,
          objective,
          req.user._id.toString()
        );

        const { title: notifTitle, message, priority } = notificationHelper.createNotificationMessage(
          'checkin_submitted',
          { title: keyResult.title },
          req.user
        );

        const actionUrl = notificationHelper.getNotificationActionUrl(
          'checkin_submitted',
          objective._id,
          'Objective'
        );

        for (const recipientId of recipients) {
          await createNotification({
            userId: recipientId,
            type: 'checkin_submitted',
            title: notifTitle,
            message,
            relatedId: objective._id,
            relatedModel: 'CheckIn',
            actionUrl,
            priority,
          });
        }

        console.log(`✅ Created ${recipients.length} notifications for check-in submission`);
      }
    } catch (notifError) {
      console.error('Error creating check-in notifications:', notifError);
    }

    res.status(201).json({
      success: true,
      data: populatedCheckIn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update check-in
// @route   PUT /api/checkins/:id
// @access  Private (owner only)
exports.updateCheckIn = async (req, res) => {
  try {
    let checkIn = await CheckIn.findById(req.params.id);

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: 'Check-in not found'
      });
    }

    // Check if user owns this check-in
    if (checkIn.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this check-in'
      });
    }

    // Update
    checkIn = await CheckIn.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('keyResultId', 'title objectiveId')
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      data: checkIn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete check-in
// @route   DELETE /api/checkins/:id
// @access  Private (owner, admin)
exports.deleteCheckIn = async (req, res) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id);

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: 'Check-in not found'
      });
    }

    // Check permissions
    const isOwner = checkIn.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this check-in'
      });
    }

    await checkIn.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Check-in deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get check-in statistics
// @route   GET /api/checkins/stats/user
// @access  Private
exports.getUserCheckInStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    // Total check-ins
    const totalCheckIns = await CheckIn.countDocuments({ userId });

    // Late check-ins
    const lateCheckIns = await CheckIn.countDocuments({ userId, isLate: true });

    // Check-ins in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCheckIns = await CheckIn.countDocuments({
      userId,
      submittedAt: { $gte: sevenDaysAgo }
    });

    // Average confidence
    const checkIns = await CheckIn.find({ userId });
    const confidenceMap = { 'on-track': 3, 'at-risk': 2, 'off-track': 1 };
    const avgConfidence = checkIns.length > 0
      ? checkIns.reduce((sum, ci) => sum + confidenceMap[ci.confidence], 0) / checkIns.length
      : 0;

    let overallConfidence = 'on-track';
    if (avgConfidence < 2) overallConfidence = 'off-track';
    else if (avgConfidence < 2.5) overallConfidence = 'at-risk';

    res.status(200).json({
      success: true,
      data: {
        totalCheckIns,
        lateCheckIns,
        recentCheckIns,
        overallConfidence,
        complianceRate: totalCheckIns > 0 ? Math.round(((totalCheckIns - lateCheckIns) / totalCheckIns) * 100) : 100
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
