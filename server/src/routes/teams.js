const express = require('express');
const router = express.Router();
const {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Public routes (all authenticated users can view teams - filtered by role in controller)
router.get('/', getTeams);
router.get('/:id', getTeam);

// Team management (admin and manager can manage teams)
router.post('/', authorize('admin', 'manager'), createTeam);
router.put('/:id', authorize('admin', 'manager'), updateTeam);
router.delete('/:id', authorize('admin', 'manager'), deleteTeam);

// Team member management (admin and manager can manage members)
router.post('/:id/members', authorize('admin', 'manager'), addMember);
router.delete('/:id/members', authorize('admin', 'manager'), removeMember);

module.exports = router;
