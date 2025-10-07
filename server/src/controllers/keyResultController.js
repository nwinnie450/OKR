const KeyResult = require('../models/KeyResult');
const Objective = require('../models/Objective');

// @desc    Get all key results
// @route   GET /api/keyresults
// @access  Private
exports.getKeyResults = async (req, res) => {
  try {
    const { objectiveId, ownerId } = req.query;

    const filter = {};
    if (objectiveId) filter.objectiveId = objectiveId;
    if (ownerId) filter.ownerId = ownerId;

    const keyResults = await KeyResult.find(filter)
      .populate('objectiveId', 'title type')
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: keyResults.length,
      data: keyResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single key result
// @route   GET /api/keyresults/:id
// @access  Private
exports.getKeyResult = async (req, res) => {
  try {
    const keyResult = await KeyResult.findById(req.params.id)
      .populate('objectiveId', 'title type ownerId teamId')
      .populate('ownerId', 'name email');

    if (!keyResult) {
      return res.status(404).json({
        success: false,
        message: 'Key Result not found'
      });
    }

    res.status(200).json({
      success: true,
      data: keyResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create key result
// @route   POST /api/keyresults
// @access  Private
exports.createKeyResult = async (req, res) => {
  try {
    const {
      objectiveId,
      title,
      description,
      ownerId,
      metricType,
      unit,
      startingValue,
      targetValue,
      dueDate
    } = req.body;

    // Check if objective exists
    const objective = await Objective.findById(objectiveId);
    if (!objective) {
      return res.status(404).json({
        success: false,
        message: 'Objective not found'
      });
    }

    // Check permissions
    const isObjectiveOwner = objective.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager' && objective.teamId?.toString() === req.user.teamId?.toString();

    if (!isObjectiveOwner && !isAdmin && !isManager) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add key results to this objective'
      });
    }

    // Create key result
    const keyResult = await KeyResult.create({
      objectiveId,
      title,
      description,
      ownerId: ownerId || req.user._id,
      metricType,
      unit,
      startingValue,
      targetValue,
      currentValue: startingValue,
      dueDate
    });

    const populatedKeyResult = await KeyResult.findById(keyResult._id)
      .populate('objectiveId', 'title')
      .populate('ownerId', 'name email');

    res.status(201).json({
      success: true,
      data: populatedKeyResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update key result
// @route   PUT /api/keyresults/:id
// @access  Private (owner, manager, admin)
exports.updateKeyResult = async (req, res) => {
  try {
    let keyResult = await KeyResult.findById(req.params.id).populate('objectiveId');

    if (!keyResult) {
      return res.status(404).json({
        success: false,
        message: 'Key Result not found'
      });
    }

    // Check permissions
    const isOwner = keyResult.ownerId.toString() === req.user._id.toString();
    const isObjectiveOwner = keyResult.objectiveId.ownerId.toString() === req.user._id.toString();
    const isManager = req.user.role === 'manager' && keyResult.objectiveId.teamId?.toString() === req.user.teamId?.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isObjectiveOwner && !isManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this key result'
      });
    }

    // Update
    keyResult = await KeyResult.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('objectiveId', 'title')
      .populate('ownerId', 'name email');

    // Update objective progress if currentValue changed
    if (req.body.currentValue !== undefined) {
      await updateObjectiveProgress(keyResult.objectiveId._id);
    }

    res.status(200).json({
      success: true,
      data: keyResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete key result
// @route   DELETE /api/keyresults/:id
// @access  Private (owner, admin)
exports.deleteKeyResult = async (req, res) => {
  try {
    const keyResult = await KeyResult.findById(req.params.id).populate('objectiveId');

    if (!keyResult) {
      return res.status(404).json({
        success: false,
        message: 'Key Result not found'
      });
    }

    // Check permissions
    const isOwner = keyResult.ownerId.toString() === req.user._id.toString();
    const isObjectiveOwner = keyResult.objectiveId.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isObjectiveOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this key result'
      });
    }

    const objectiveId = keyResult.objectiveId._id;

    await keyResult.deleteOne();

    // Update objective progress
    await updateObjectiveProgress(objectiveId);

    res.status(200).json({
      success: true,
      message: 'Key Result deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to update objective progress
const updateObjectiveProgress = async (objectiveId) => {
  try {
    const keyResults = await KeyResult.find({ objectiveId });

    if (keyResults.length === 0) {
      await Objective.findByIdAndUpdate(objectiveId, {
        progress: 0,
        confidence: 'on-track'
      });
      return;
    }

    const totalProgress = keyResults.reduce((sum, kr) => sum + kr.progress, 0);
    const avgProgress = Math.round(totalProgress / keyResults.length);

    // Calculate overall confidence
    const confidenceCounts = {
      'on-track': keyResults.filter(kr => kr.confidence === 'on-track').length,
      'at-risk': keyResults.filter(kr => kr.confidence === 'at-risk').length,
      'off-track': keyResults.filter(kr => kr.confidence === 'off-track').length
    };

    let overallConfidence = 'on-track';
    if (confidenceCounts['off-track'] > 0 || confidenceCounts['at-risk'] >= keyResults.length / 2) {
      overallConfidence = 'at-risk';
    }
    if (confidenceCounts['off-track'] >= keyResults.length / 2) {
      overallConfidence = 'off-track';
    }

    await Objective.findByIdAndUpdate(objectiveId, {
      progress: avgProgress,
      confidence: overallConfidence
    });
  } catch (error) {
    console.error('Error updating objective progress:', error);
  }
};
